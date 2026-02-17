"""
Expert agent implementation for council debates.
Represents individual expert personas.
"""

from typing import List, Optional, Dict, Any

from langchain_core.messages import BaseMessage, HumanMessage

from agents.base_agent import BaseCouncilAgent
from utils.prompt_loader import ExpertPersona


class ExpertAgent(BaseCouncilAgent):
    """Agent representing an expert persona."""
    
    def __init__(self, persona: ExpertPersona, config: dict):
        """Initialize expert agent.
        
        Args:
            persona: ExpertPersona object with prompt and metadata
            config: Configuration dictionary
        """
        super().__init__(
            name=persona.name,
            system_prompt=persona.prompt,
            config=config
        )
        self.persona = persona
    
    def get_model_params(self) -> Dict[str, Any]:
        """Get the model parameters for this agent."""
        return getattr(self, 'model_params', {
            'model': 'unknown',
            'temperature': 0.7,
            'top_p': 1.0
        })
    
    def respond(
        self,
        problem_statement: str,
        conversation_history: Optional[List[BaseMessage]] = None
    ) -> str:
        """Generate expert's response to the problem.
        
        Args:
            problem_statement: The business problem to analyze
            conversation_history: Previous conversation messages
            
        Returns:
            Expert's analysis and recommendations
        """
        # Build context-aware prompt
        if conversation_history:
            # Expert should respond to previous speakers
            context_prompt = self._build_context_prompt(
                problem_statement,
                conversation_history
            )
        else:
            # First speaker just analyzes the problem
            context_prompt = f"""
As {self.name}, analyze the following business problem through YOUR unique lens and philosophy:

{problem_statement}

Provide your DISTINCTIVE analysis and recommendations. Let your personality, communication style, and signature frameworks shine through. This is not generic advice - this is YOUR perspective as {self.name}.
"""
        
        # Extract key problem details for enhanced context
        problem_context = self._extract_problem_context(problem_statement)
        
        # Create messages and get response with enhanced context
        messages = self._create_messages(
            context_prompt, 
            conversation_history,
            problem_context=problem_context
        )
        response = self._call_model(messages)
        
        self.logger.info(f"{self.name} has responded")
        return response
    
    def _build_context_prompt(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage]
    ) -> str:
        """Build a context-aware prompt for responding to others.
        
        Args:
            problem_statement: The original problem
            conversation_history: Previous messages
            
        Returns:
            Formatted prompt for the expert
        """
        # Extract recent speaker names and key points
        recent_speakers = []
        for msg in conversation_history[-3:]:  # Last 3 messages
            if isinstance(msg, HumanMessage) and hasattr(msg, 'additional_kwargs'):
                speaker = msg.additional_kwargs.get('speaker', 'Unknown')
                if speaker not in recent_speakers and speaker != self.name:
                    recent_speakers.append(speaker)
        
        prompt = f"""
As {self.name}, you're participating in an expert council discussing this business problem:

{problem_statement}

"""
        if recent_speakers:
            prompt += f"You've heard from {', '.join(recent_speakers)}. Now it's YOUR turn.\n\n"
            prompt += f"As {self.name}, respond with YOUR distinctive voice and approach. You may:\n"
            prompt += "- Challenge their assumptions using your unique frameworks\n"
            prompt += "- Build on their ideas through your particular lens\n"
            prompt += "- Offer a completely different angle based on your philosophy\n\n"
        
        prompt += f"Remember: You are {self.name}. Use your signature phrases, thinking models, and communication style. Make it unmistakably YOU."
        
        return prompt
    
    def _extract_problem_context(self, problem_statement: str) -> str:
        """Extract key details from problem statement for context.
        
        Args:
            problem_statement: The full problem description
            
        Returns:
            Condensed context string
        """
        # Extract key elements like company type, industry, challenges
        context_parts = []
        
        # Look for industry/domain indicators
        tech_keywords = ['AI', 'crypto', 'software', 'platform', 'app', 'digital', 'tech']
        finance_keywords = ['investment', 'fund', 'capital', 'financial', 'trading']
        
        for keyword in tech_keywords:
            if keyword.lower() in problem_statement.lower():
                context_parts.append(f"This is a technology/digital business problem")
                break
        
        for keyword in finance_keywords:
            if keyword.lower() in problem_statement.lower():
                context_parts.append(f"This involves financial/investment considerations")
                break
                
        # Look for scale indicators
        if any(word in problem_statement.lower() for word in ['startup', 'early-stage', 'seed']):
            context_parts.append("Early-stage venture")
        elif any(word in problem_statement.lower() for word in ['scaling', 'growth', 'expansion']):
            context_parts.append("Growth-stage company")
            
        # Look for urgency
        if any(word in problem_statement.lower() for word in ['urgent', 'immediate', 'crisis', 'critical']):
            context_parts.append("Time-sensitive decision required")
            
        return " | ".join(context_parts) if context_parts else "Business strategy problem"