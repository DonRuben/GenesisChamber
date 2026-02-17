"""
Base agent class for the AI Expert Council.
Provides common functionality for all agent types.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import logging
import time

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI
import os


class BaseCouncilAgent(ABC):
    """Abstract base class for all council agents."""
    
    def __init__(
        self,
        name: str,
        system_prompt: str,
        config: Dict[str, Any],
        model: Optional[BaseChatModel] = None
    ):
        """Initialize base agent.
        
        Args:
            name: Agent identifier
            system_prompt: System prompt defining agent behavior
            config: Configuration dictionary
            model: Optional pre-configured LLM model
        """
        self.name = name
        self.system_prompt = system_prompt
        self.config = config
        self.logger = logging.getLogger(f"agent.{name}")
        
        # Initialize LLM
        if model:
            self.model = model
        else:
            self.model = self._create_model()
    
    def _create_model(self) -> BaseChatModel:
        """Create LLM model based on configuration."""
        # Get default values from config - check both root and llm section
        llm_config = self.config.get('llm', {})
        model_name = llm_config.get('model', self.config.get('model', 'gpt-4-turbo-preview'))
        temperature = llm_config.get('temperature', self.config.get('temperature', 0.7))
        top_p = llm_config.get('top_p', self.config.get('top_p', 1.0))
        
        # Check for agent-specific overrides
        agent_config = self.config.get('experts', {}).get(self.name.lower(), {})
        if 'temperature' in agent_config:
            temperature = agent_config['temperature']
        if 'top_p' in agent_config:
            top_p = agent_config['top_p']
        
        # Store model params for logging
        self.model_params = {
            'model': model_name,
            'temperature': temperature,
            'top_p': top_p
        }
        
        # Get API key - ensuring we use the one from .env if available
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            top_p=top_p,
            max_retries=3,
            request_timeout=60,
            openai_api_key=api_key
        )
    
    def _create_messages(
        self,
        user_prompt: str,
        conversation_history: Optional[List[BaseMessage]] = None,
        problem_context: Optional[str] = None
    ) -> List[BaseMessage]:
        """Create message list for LLM.
        
        Args:
            user_prompt: The user's prompt
            conversation_history: Optional conversation history
            problem_context: Optional problem-specific context to prepend
            
        Returns:
            List of messages for the LLM
        """
        # Enhanced system prompt with problem context if available
        system_content = self.system_prompt
        if problem_context:
            system_content = f"{self.system_prompt}\n\nCURRENT CONTEXT:\n{problem_context}"
            
        messages = [SystemMessage(content=system_content)]
        
        if conversation_history:
            messages.extend(conversation_history)
        
        messages.append(HumanMessage(content=user_prompt))
        
        return messages
    
    @abstractmethod
    def respond(
        self,
        problem_statement: str,
        conversation_history: Optional[List[BaseMessage]] = None
    ) -> str:
        """Generate agent response.
        
        Args:
            problem_statement: The problem to analyze
            conversation_history: Previous conversation messages
            
        Returns:
            Agent's response as string
        """
        pass
    
    def _call_model(self, messages: List[BaseMessage]) -> str:
        """Call the LLM with error handling and timing.
        
        Args:
            messages: Messages to send to LLM
            
        Returns:
            Model response as string
        """
        # Calculate approximate token count for logging
        total_chars = sum(len(msg.content) for msg in messages)
        approx_tokens = total_chars // 4  # Rough approximation
        
        self.logger.info(f"🔵 Sending request to OpenAI for {self.name}")
        self.logger.info(f"   Model: {self.model.model_name}")
        self.logger.info(f"   Messages: {len(messages)} (≈{approx_tokens} tokens)")
        self.logger.info(f"   Temperature: {self.model.temperature}")
        
        start_time = time.time()
        
        try:
            response = self.model.invoke(messages)
            
            elapsed_time = time.time() - start_time
            response_tokens = len(response.content) // 4  # Rough approximation
            
            self.logger.info(f"✅ Received response from OpenAI for {self.name}")
            self.logger.info(f"   Response time: {elapsed_time:.2f} seconds")
            self.logger.info(f"   Response length: {len(response.content)} chars (≈{response_tokens} tokens)")
            
            return response.content
        except Exception as e:
            elapsed_time = time.time() - start_time
            self.logger.error(f"❌ Error calling OpenAI for {self.name} after {elapsed_time:.2f} seconds: {e}")
            raise