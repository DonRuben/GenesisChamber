"""
Debate orchestrator using LangGraph for conversation flow management.
Coordinates expert discussions through multiple rounds.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict
from langgraph.checkpoint.memory import MemorySaver

from agents.expert_agent import ExpertAgent
from agents.moderator_agent import ModeratorAgent
from agents.summarizer_agent import SummarizerAgent
from utils.prompt_loader import ExpertPersona


class ConversationState(TypedDict):
    """State container for the debate conversation."""
    messages: List[BaseMessage]
    current_round: int
    current_speaker_index: int
    problem_statement: str
    expert_names: List[str]
    metadata: Dict[str, Any]


class DebateOrchestrator:
    """Orchestrates multi-round debates between AI experts."""
    
    def __init__(
        self,
        experts: List[ExpertAgent],
        moderator: ModeratorAgent,
        summarizer: SummarizerAgent,
        config: Dict[str, Any]
    ):
        """Initialize the debate orchestrator.
        
        Args:
            experts: List of expert agents
            moderator: Moderator agent
            summarizer: Summarizer agent
            config: Configuration dictionary
        """
        self.experts = sorted(experts, key=lambda e: e.persona.priority)
        self.moderator = moderator
        self.summarizer = summarizer
        self.config = config
        self.max_rounds = config.get('max_rounds', 2)
        self.logger = logging.getLogger('orchestrator')
        
        # Initialize checkpointer before building graph
        self.checkpointer = MemorySaver()
        
        # Initialize live transcript files
        self.transcript_file = None
        self.root_transcript = Path("transcript.log")
        self._init_transcript_file()
        
        # Build the conversation graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state machine for conversation flow."""
        # Create workflow
        workflow = StateGraph(ConversationState)
        
        # Add nodes
        workflow.add_node("moderator_intro", self._moderator_intro)
        workflow.add_node("expert_turn", self._expert_turn)
        workflow.add_node("check_round", self._check_round_complete)
        workflow.add_node("summarize", self._summarize_debate)
        
        # Add edges
        workflow.set_entry_point("moderator_intro")
        workflow.add_edge("moderator_intro", "expert_turn")
        workflow.add_edge("expert_turn", "check_round")
        workflow.add_conditional_edges(
            "check_round",
            self._should_continue,
            {
                "continue": "expert_turn",
                "new_round": "expert_turn",
                "end": "summarize"
            }
        )
        workflow.add_edge("summarize", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    def _moderator_intro(self, state: ConversationState) -> ConversationState:
        """Moderator introduces the problem."""
        print("\n🎤 Moderator is preparing introduction...", flush=True)
        
        # Write status to transcript with model params
        model_params = self.moderator.get_model_params()
        status_msg = (f"🎤 Generating Moderator's introduction with OpenAI "
                     f"({model_params['model']}, temp={model_params['temperature']}, "
                     f"top_p={model_params['top_p']})...")
        self._write_status_to_transcript(status_msg)
        
        intro = self.moderator.introduce_problem(state['problem_statement'])
        
        # Write to transcript
        self._write_to_transcript("MODERATOR", intro, {"role": "introduction"})
        
        message = AIMessage(
            content=intro,
            additional_kwargs={'speaker': 'Moderator', 'role': 'moderator'}
        )
        state['messages'].append(message)
        
        print("✓ Moderator has introduced the problem\n")
        self.logger.info("Moderator has introduced the problem")
        return state
    
    def _expert_turn(self, state: ConversationState) -> ConversationState:
        """Execute a single expert's turn."""
        expert = self.experts[state['current_speaker_index']]
        
        # Show progress in console
        self._show_thinking_indicator(expert.name)
        
        # Write status to transcript with model params
        model_params = expert.get_model_params()
        status_msg = (f"💭 Getting {expert.name}'s analysis from OpenAI "
                     f"({model_params['model']}, temp={model_params['temperature']}, "
                     f"top_p={model_params['top_p']}, Round {state['current_round']})...")
        self._write_status_to_transcript(status_msg)
        
        # Get expert response
        response = expert.respond(
            state['problem_statement'],
            state['messages']
        )
        
        # Write to transcript
        self._write_to_transcript(
            expert.name.upper(),
            response,
            {"role": "expert", "round": state['current_round']}
        )
        
        # Add to conversation
        message = AIMessage(
            content=response,
            additional_kwargs={
                'speaker': expert.name,
                'role': 'expert',
                'round': state['current_round']
            }
        )
        state['messages'].append(message)
        
        self._show_completion(expert.name)
        
        # Move to next speaker
        state['current_speaker_index'] += 1
        
        return state
    
    def _check_round_complete(self, state: ConversationState) -> ConversationState:
        """Check if current round is complete."""
        if state['current_speaker_index'] >= len(self.experts):
            # Round complete
            print(f"\n{'='*60}")
            print(f"✅ Round {state['current_round']} complete")
            print(f"{'='*60}\n")
            
            state['current_round'] += 1
            state['current_speaker_index'] = 0
            self.logger.info(f"Round {state['current_round'] - 1} complete")
            
            if state['current_round'] <= self.max_rounds:
                print(f"🔄 Starting Round {state['current_round']} of {self.max_rounds}\n")
                self._write_status_to_transcript(f"🔄 Starting Round {state['current_round']} of {self.max_rounds}")
        
        return state
    
    def _should_continue(self, state: ConversationState) -> str:
        """Determine next step in the flow."""
        if state['current_round'] > self.max_rounds:
            return "end"
        elif state['current_speaker_index'] == 0 and state['current_round'] > 1:
            # New round starting
            return "new_round"
        else:
            return "continue"
    
    def _summarize_debate(self, state: ConversationState) -> ConversationState:
        """Generate final summary."""
        self.logger.info("Generating final summary...")
        self._show_summary_indicator()
        
        # Write status to transcript with model params
        model_params = self.summarizer.get_model_params()
        status_msg = (f"📊 Generating comprehensive analysis and summary with OpenAI "
                     f"({model_params['model']}, temp={model_params['temperature']}, "
                     f"top_p={model_params['top_p']})...")
        self._write_status_to_transcript(status_msg)
        
        summary_data = self.summarizer.summarize_debate(
            state['problem_statement'],
            state['messages'],
            state['expert_names']
        )
        
        # Write summary to transcript
        if 'executive_summary' in summary_data:
            self._write_to_transcript(
                "FINAL SUMMARY",
                summary_data['executive_summary'],
                {"type": "summary", "components": list(summary_data.keys())}
            )
        
        state['metadata']['summary'] = summary_data
        state['metadata']['end_time'] = datetime.now()
        
        print("\n✅ Analysis complete!")
        
        return state
    
    def run_debate(self, problem_statement: str) -> Dict[str, Any]:
        """Run the complete debate.
        
        Args:
            problem_statement: The problem to debate
            
        Returns:
            Dictionary with results including summary and transcript
        """
        # Initialize state
        initial_state = {
            'messages': [],
            'current_round': 1,
            'current_speaker_index': 0,
            'problem_statement': problem_statement,
            'expert_names': [e.name for e in self.experts],
            'metadata': {'start_time': datetime.now()}
        }
        
        # Show start message
        self._show_debate_start(problem_statement[:100] + "...")
        
        # Write problem statement to transcript
        self._write_to_transcript(
            "PROBLEM STATEMENT",
            problem_statement,
            {"type": "initial_problem"}
        )
        
        self._write_status_to_transcript("🚀 Starting AI Expert Council debate...")
        
        # Run the graph
        config = {"configurable": {"thread_id": "debate-1"}}
        final_state = self.graph.invoke(initial_state, config)
        
        # Prepare results
        results = {
            'summary': final_state['metadata'].get('summary', {}),
            'transcript': self._format_transcript(final_state['messages']),
            'metadata': {
                'experts': final_state['expert_names'],
                'rounds': final_state['current_round'] - 1,
                'start_time': final_state['metadata'].get('start_time'),
                'end_time': final_state['metadata'].get('end_time'),
                'total_messages': len(final_state['messages'])
            }
        }
        
        return results
    
    def _format_transcript(self, messages: List[BaseMessage]) -> List[Dict[str, Any]]:
        """Format messages into structured transcript."""
        transcript = []
        
        for msg in messages:
            speaker = msg.additional_kwargs.get('speaker', 'Unknown')
            role = msg.additional_kwargs.get('role', 'unknown')
            round_num = msg.additional_kwargs.get('round', 0)
            
            transcript.append({
                'speaker': speaker,
                'role': role,
                'round': round_num,
                'content': msg.content
            })
        
        return transcript
    
    def _show_debate_start(self, problem_preview: str):
        """Display debate start message."""
        print("\n" + "="*60)
        print("AI Expert Council - Starting Debate")
        print("="*60)
        print(f"Problem: {problem_preview}")
        print(f"Experts: {', '.join([e.name for e in self.experts])}")
        print(f"Rounds: {self.max_rounds}")
        print("="*60 + "\n")
    
    def _show_thinking_indicator(self, expert_name: str):
        """Show that an expert is thinking."""
        print(f"\n💭 {expert_name} is analyzing the problem...", flush=True)
    
    def _show_completion(self, expert_name: str):
        """Show that an expert has completed."""
        print(f"✓ {expert_name} has shared their perspective\n")
    
    def _show_summary_indicator(self):
        """Show summary generation progress."""
        print("\n📊 Generating comprehensive analysis...", end='', flush=True)
    
    def _init_transcript_file(self):
        """Initialize the live transcript files."""
        # Initialize timestamped transcript in outputs
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.transcript_file = Path("outputs") / f"live_transcript_{timestamp}.txt"
        self.transcript_file.parent.mkdir(exist_ok=True)
        
        # Clear and initialize root transcript.log
        with open(self.root_transcript, 'w') as f:
            f.write(f"AI Expert Council - Live Transcript\n")
            f.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
        
        # Write same header to timestamped file
        with open(self.transcript_file, 'w') as f:
            f.write(f"AI Expert Council - Live Transcript\n")
            f.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
        
        print(f"\n📝 Live transcript: tail -f transcript.log")
        print(f"📁 Archive copy: {self.transcript_file}\n")
    
    def _write_to_transcript(self, speaker: str, content: str, metadata: Dict[str, Any] = None):
        """Write a message to both transcript files."""
        transcript_content = f"\n[{datetime.now().strftime('%H:%M:%S')}] {speaker}:\n"
        transcript_content += "-" * 40 + "\n"
        transcript_content += content + "\n"
        if metadata:
            transcript_content += f"\n[Metadata: {metadata}]\n"
        transcript_content += "\n" + "="*80 + "\n"
        
        # Write to both files
        with open(self.transcript_file, 'a') as f:
            f.write(transcript_content)
            f.flush()
        
        with open(self.root_transcript, 'a') as f:
            f.write(transcript_content)
            f.flush()  # Ensure it's written immediately for tail -f
    
    def _write_status_to_transcript(self, status: str):
        """Write a status update to transcript files for real-time monitoring."""
        status_content = f"\n>>> {datetime.now().strftime('%H:%M:%S')} - {status}\n\n"
        
        # Write to both files
        with open(self.transcript_file, 'a') as f:
            f.write(status_content)
            f.flush()
        
        with open(self.root_transcript, 'a') as f:
            f.write(status_content)
            f.flush()