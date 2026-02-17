"""
Moderator agent for facilitating expert discussions.
Ensures productive debate and prevents repetition.
"""

from typing import List, Optional, Dict, Any

from langchain_core.messages import BaseMessage

from agents.base_agent import BaseCouncilAgent


MODERATOR_PROMPT = """You are a skilled debate moderator facilitating a discussion between business experts with distinct personalities and philosophies.

Your role is to:
1. Introduce topics clearly and set up tension points for debate
2. ACTIVELY encourage disagreement and challenge consensus when experts agree too easily
3. Push experts to directly respond to and challenge each other's specific claims
4. Highlight contradictions between expert positions
5. Demand concrete examples and evidence when claims are made
6. Prevent generic business-speak - push for each expert's unique perspective
7. Create productive conflict that reveals deeper insights

Be professional but provocative. Your goal is vigorous debate, not polite agreement.
Use pointed questions to expose weaknesses in arguments and force experts to defend their positions."""


class ModeratorAgent(BaseCouncilAgent):
    """Agent that moderates the expert discussion."""
    
    def __init__(self, config: dict):
        """Initialize moderator agent.
        
        Args:
            config: Configuration dictionary
        """
        # Override temperature and top_p for moderator - should be more consistent
        moderator_config = config.copy()
        moderator_config['temperature'] = 0.3
        moderator_config['top_p'] = 0.75  # Balanced - focused but flexible
        
        super().__init__(
            name="Moderator",
            system_prompt=MODERATOR_PROMPT,
            config=moderator_config
        )
    
    def get_model_params(self) -> Dict[str, Any]:
        """Get the model parameters for this agent."""
        return getattr(self, 'model_params', {
            'model': 'unknown',
            'temperature': 0.3,
            'top_p': 1.0
        })
    
    def introduce_problem(self, problem_statement: str) -> str:
        """Create initial introduction for the debate.
        
        Args:
            problem_statement: The problem to discuss
            
        Returns:
            Moderator's introduction
        """
        prompt = f"""
Introduce this business problem to the expert panel in a way that sets up productive conflict and debate.
Highlight 2-3 specific tension points or controversial aspects that experts might disagree on.
Keep it punchy (3-4 sentences max) and end with a provocative question.

Problem:
{problem_statement}
"""
        
        messages = self._create_messages(prompt)
        return self._call_model(messages)
    
    def facilitate_transition(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage],
        next_speaker: str,
        round_number: int,
        is_final_speaker: bool
    ) -> str:
        """Create transition prompt between speakers.
        
        Args:
            problem_statement: Original problem
            conversation_history: Discussion so far
            next_speaker: Name of next expert
            round_number: Current round number
            is_final_speaker: Whether this is the last speaker in round
            
        Returns:
            Transition prompt for next speaker
        """
        prompt = f"""
Based on the discussion so far about this problem:
{problem_statement}

We are in round {round_number} of the discussion.
"""
        
        if is_final_speaker:
            prompt += f"\n\nThe previous experts have shared their views. Now I need you to create a CHALLENGING prompt for {next_speaker} that:"
            prompt += "\n- Points out specific contradictions or weaknesses in previous arguments"
            prompt += "\n- Challenges any easy consensus that may be forming"
            prompt += "\n- Forces {next_speaker} to defend their unique position against the others"
        else:
            prompt += f"\n\nCreate a PROVOCATIVE prompt for {next_speaker} that:"
            prompt += "\n- Directly challenges a specific claim made by a previous expert"
            prompt += "\n- Sets up a philosophical conflict between their worldview and what's been said"
            prompt += "\n- Demands they address a controversial aspect others have avoided"
        
        prompt += "\n\nYour prompt should be 1-3 sentences, pointed, and designed to generate disagreement and deeper analysis."
        
        messages = self._create_messages(prompt, conversation_history)
        return self._call_model(messages)
    
    def respond(
        self,
        problem_statement: str,
        conversation_history: Optional[List[BaseMessage]] = None
    ) -> str:
        """Generate moderator intervention if needed.
        
        Args:
            problem_statement: The problem being discussed
            conversation_history: Previous conversation
            
        Returns:
            Moderator's intervention or guidance
        """
        if not conversation_history:
            return self.introduce_problem(problem_statement)
        
        # Analyze conversation for issues
        prompt = f"""
The experts are discussing: {problem_statement}

Review the conversation and determine if any intervention is needed.
If the discussion is becoming repetitive, too abstract, or missing key points, provide a brief intervention (1-2 sentences).
If the discussion is productive, simply say "Continue."
"""
        
        messages = self._create_messages(prompt, conversation_history)
        return self._call_model(messages)