"""
Summarizer agent for generating actionable insights from debates.
Creates structured summaries with recommendations.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path

from langchain_core.messages import BaseMessage

from agents.base_agent import BaseCouncilAgent
from utils.config_manager import ConfigManager


class SummarizerAgent(BaseCouncilAgent):
    """Agent that creates structured summaries of expert debates."""
    
    def __init__(self, config: dict, deliverable_config: Optional[Dict[str, Any]] = None):
        """Initialize summarizer agent.
        
        Args:
            config: Configuration dictionary
            deliverable_config: Optional deliverable configuration, loaded from file if not provided
        """
        # Load deliverable config if not provided
        if deliverable_config is None:
            config_manager = ConfigManager(config_path="config.toml")
            deliverable_config = config_manager.load_deliverable_config("business_analysis")
        
        self.deliverable_config = deliverable_config
        
        # Get system prompt from deliverable config
        system_prompt = deliverable_config.get("system_prompt", {}).get("content", 
            "You are an expert analyst tasked with synthesizing discussions into actionable insights.")
        
        # Override temperature and top_p for more consistent summaries
        summarizer_config = config.copy()
        summarizer_config['temperature'] = 0.3
        summarizer_config['top_p'] = 0.45  # Focused but can capture nuance
        
        super().__init__(
            name="Summarizer",
            system_prompt=system_prompt,
            config=summarizer_config
        )
    
    def get_model_params(self) -> Dict[str, Any]:
        """Get the model parameters for this agent."""
        return getattr(self, 'model_params', {
            'model': 'unknown',
            'temperature': 0.3,
            'top_p': 1.0
        })
    
    def respond(
        self,
        problem_statement: str,
        conversation_history: Optional[List[BaseMessage]] = None
    ) -> str:
        """This method is not used for summarizer - use summarize_debate instead."""
        raise NotImplementedError("Use summarize_debate method instead")
    
    def summarize_debate(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage],
        expert_names: List[str]
    ) -> Dict[str, Any]:
        """Generate comprehensive summary of the debate.
        
        Args:
            problem_statement: Original problem
            conversation_history: Complete debate transcript
            expert_names: List of participating experts
            
        Returns:
            Dictionary with summary components
        """
        summary_components = {}
        sections = self.deliverable_config.get("sections", {})
        
        # Only generate sections that are enabled in config
        if sections.get("executive_summary", {}).get("enabled", True):
            summary_components['executive_summary'] = self._generate_executive_summary(
                problem_statement, conversation_history, expert_names
            )
        
        if sections.get("key_insights", {}).get("enabled", True):
            summary_components['key_insights'] = self._extract_key_insights(
                problem_statement, conversation_history
            )
        
        if sections.get("pros_cons", {}).get("enabled", True):
            summary_components['pros_cons'] = self._analyze_pros_cons(
                problem_statement, conversation_history
            )
        
        if sections.get("action_items", {}).get("enabled", True):
            summary_components['action_items'] = self._generate_action_items(
                problem_statement, conversation_history
            )
        
        if sections.get("risks", {}).get("enabled", True):
            summary_components['risks'] = self._identify_risks(
                problem_statement, conversation_history
            )
        
        return summary_components
    
    def _generate_executive_summary(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage],
        expert_names: List[str]
    ) -> str:
        """Generate executive summary."""
        # Get prompt template from config
        section_config = self.deliverable_config.get("sections", {}).get("executive_summary", {})
        prompt_template = section_config.get("prompt", """
Based on the expert discussion about this problem:
{problem_statement}

Experts involved: {expert_names}

Write a concise executive summary.
""")
        
        # Format the prompt with actual values
        prompt = prompt_template.format(
            problem_statement=problem_statement,
            expert_names=', '.join(expert_names)
        )
        
        messages = self._create_messages(prompt, conversation_history)
        return self._call_model(messages)
    
    def _extract_key_insights(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage]
    ) -> Dict[str, List[str]]:
        """Extract key insights organized by agreement/disagreement."""
        # Extract actual expert names from conversation history
        expert_names = set()
        for msg in conversation_history:
            if msg.additional_kwargs.get('role') == 'expert':
                expert_names.add(msg.additional_kwargs.get('speaker', 'Unknown'))
        expert_names_list = sorted(list(expert_names))
        
        # Get prompt template from config
        section_config = self.deliverable_config.get("sections", {}).get("key_insights", {})
        prompt_template = section_config.get("prompt", """
Analyze the expert discussion about: {problem_statement}

The participating experts are: {expert_names}

Extract and organize key insights.
""")
        
        # Format the prompt with actual values
        prompt = prompt_template.format(
            problem_statement=problem_statement,
            expert_names=', '.join(expert_names_list)
        )
        
        messages = self._create_messages(prompt, conversation_history)
        response = self._call_model(messages)
        
        # Parse response into structured format
        # In production, this would use more sophisticated parsing
        return {'raw': response}
    
    def _analyze_pros_cons(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage]
    ) -> List[Dict[str, str]]:
        """Analyze pros and cons discussed."""
        # Get prompt template from config
        section_config = self.deliverable_config.get("sections", {}).get("pros_cons", {})
        prompt_template = section_config.get("prompt", """
Based on the expert discussion about: {problem_statement}

Create a balanced pros/cons analysis.
""")
        
        prompt = prompt_template.format(problem_statement=problem_statement)
        
        messages = self._create_messages(prompt, conversation_history)
        response = self._call_model(messages)
        
        # In production, parse into structured format
        return [{'raw': response}]
    
    def _generate_action_items(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage]
    ) -> List[Dict[str, str]]:
        """Generate prioritized action items."""
        # Get prompt template from config
        section_config = self.deliverable_config.get("sections", {}).get("action_items", {})
        prompt_template = section_config.get("prompt", """
Based on the expert recommendations for: {problem_statement}

Generate specific, actionable next steps.
""")
        
        prompt = prompt_template.format(problem_statement=problem_statement)
        
        messages = self._create_messages(prompt, conversation_history)
        response = self._call_model(messages)
        
        return [{'raw': response}]
    
    def _identify_risks(
        self,
        problem_statement: str,
        conversation_history: List[BaseMessage]
    ) -> List[Dict[str, str]]:
        """Identify risks and mitigation strategies."""
        # Get prompt template from config
        section_config = self.deliverable_config.get("sections", {}).get("risks", {})
        prompt_template = section_config.get("prompt", """
Based on the expert discussion about: {problem_statement}

Identify risks and mitigation strategies.
""")
        
        prompt = prompt_template.format(problem_statement=problem_statement)
        
        messages = self._create_messages(prompt, conversation_history)
        response = self._call_model(messages)
        
        return [{'raw': response}]