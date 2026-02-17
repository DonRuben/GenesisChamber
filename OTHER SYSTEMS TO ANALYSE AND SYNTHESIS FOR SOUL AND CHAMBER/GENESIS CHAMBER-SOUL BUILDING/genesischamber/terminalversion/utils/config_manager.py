"""
Module: config_manager
Purpose: Configuration management with TOML and environment variable support
Author: AI Expert Council Team
"""

import os
import toml
from pathlib import Path
from typing import Any, Dict, Optional, Union
from dotenv import load_dotenv


class ConfigManager:
    """Manages application configuration from TOML files and environment variables.
    
    Configuration is loaded in layers:
    1. Default configuration from config.toml
    2. Environment-specific overrides
    3. Environment variables
    4. Runtime overrides
    """
    
    def __init__(self, config_path: str = "config.toml", model: Optional[str] = None):
        """Initialize ConfigManager.
        
        Args:
            config_path: Path to the configuration file
            model: Specific model to load configuration for
        """
        self.config_path = Path(config_path)
        self.config: Dict[str, Any] = {}
        self.env_vars: Dict[str, str] = {}
        self.model = model
        
        # Load environment variables from .env file with override=True
        # This ensures .env values take precedence over system env vars
        load_dotenv(override=True)
        
        # Load configuration
        self._load_config()
        self._load_env_vars()
        self._apply_env_overrides()
        
        # Apply model-specific overrides if model is specified
        if self.model:
            self._apply_model_overrides()
    
    def _load_config(self) -> None:
        """Load configuration from TOML file."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        
        try:
            with open(self.config_path, 'r') as f:
                self.config = toml.load(f)
        except toml.TomlDecodeError as e:
            raise ValueError(f"Invalid TOML in configuration file: {e}")
    
    def _load_env_vars(self) -> None:
        """Load relevant environment variables."""
        # Define environment variables to check
        env_mappings = {
            'OPENAI_API_KEY': 'openai_api_key',
            'LLM_MODEL': 'llm.model',
            'ENVIRONMENT': 'environment',
            'OUTPUT_DIR': 'general.output_dir',
            'VERBOSE': 'general.debug',
            'CONFIG_PATH': 'config_path',
        }
        
        for env_var, config_key in env_mappings.items():
            value = os.getenv(env_var)
            if value is not None:
                self.env_vars[config_key] = value
    
    def _apply_env_overrides(self) -> None:
        """Apply environment variable overrides to configuration."""
        for key, value in self.env_vars.items():
            if '.' in key:
                # Handle nested configuration keys
                parts = key.split('.')
                current = self.config
                
                # Navigate to the parent of the target key
                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]
                
                # Set the value, converting types as needed
                final_key = parts[-1]
                current[final_key] = self._convert_value(value)
            else:
                # Top-level configuration
                self.config[key] = self._convert_value(value)
    
    def _convert_value(self, value: str) -> Union[str, int, float, bool]:
        """Convert string values to appropriate types.
        
        Args:
            value: String value to convert
            
        Returns:
            Converted value in appropriate type
        """
        # Try to convert to boolean
        if value.lower() in ('true', 'yes', '1'):
            return True
        elif value.lower() in ('false', 'no', '0'):
            return False
        
        # Try to convert to number
        try:
            if '.' in value:
                return float(value)
            else:
                return int(value)
        except ValueError:
            pass
        
        # Return as string
        return value
    
    def _apply_model_overrides(self) -> None:
        """Apply model-specific configuration overrides."""
        model_config_key = f"models.{self.model}"
        model_config = self.get(model_config_key)
        
        if not model_config:
            raise ValueError(f"Model configuration not found for: {self.model}")
        
        # Apply model-specific settings to llm section
        if 'llm' not in self.config:
            self.config['llm'] = {}
        
        # Apply all model-specific settings
        for key, value in model_config.items():
            if key != 'description':  # Skip description field
                self.config['llm'][key] = value
        
        # Set the model name in llm config
        self.config['llm']['model'] = self.model
    
    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """Get configuration value by key.
        
        Supports nested keys using dot notation (e.g., 'llm.model').
        
        Args:
            key: Configuration key (supports dot notation)
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        parts = key.split('.')
        current = self.config
        
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return default
        
        return current
    
    def set(self, key: str, value: Any) -> None:
        """Set configuration value at runtime.
        
        Args:
            key: Configuration key (supports dot notation)
            value: Value to set
        """
        parts = key.split('.')
        current = self.config
        
        # Navigate to the parent of the target key
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        # Set the value
        current[parts[-1]] = value
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """Get entire configuration section.
        
        Args:
            section: Section name
            
        Returns:
            Configuration section as dictionary
        """
        return self.config.get(section, {})
    
    def get_api_key(self, provider: str = "openai") -> Optional[str]:
        """Get API key for specified provider.
        
        Args:
            provider: LLM provider name
            
        Returns:
            API key or None if not found
        """
        env_var_map = {
            "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
            "cohere": "COHERE_API_KEY",
        }
        
        env_var = env_var_map.get(provider.lower())
        if env_var:
            return os.getenv(env_var)
        
        return None
    
    def validate(self) -> bool:
        """Validate configuration for required fields.
        
        Returns:
            True if configuration is valid
            
        Raises:
            ValueError: If configuration is invalid
        """
        # Check for required API key
        if not self.get_api_key():
            raise ValueError("No API key found. Please set OPENAI_API_KEY in .env file")
        
        # Check for required directories
        required_dirs = [
            self.get('general.output_dir', 'outputs'),
            self.get('experts.experts_dir', 'experts')
        ]
        
        for dir_path in required_dirs:
            if not Path(dir_path).exists():
                raise ValueError(f"Required directory not found: {dir_path}")
        
        return True
    
    def save_preferences(self) -> None:
        """Save UI preferences back to config.toml file."""
        try:
            with open(self.config_path, 'w') as f:
                toml.dump(self.config, f)
        except Exception as e:
            raise RuntimeError(f"Failed to save preferences: {e}")
    
    def load_deliverable_config(self, config_name: str = "business_analysis") -> Dict[str, Any]:
        """Load deliverable configuration from prompts directory.
        
        Args:
            config_name: Name of the deliverable config (without .toml extension)
            
        Returns:
            Dictionary containing deliverable configuration
        """
        config_path = Path("prompts") / f"{config_name}.toml"
        
        if not config_path.exists():
            # Return default if specific config not found
            return {
                "metadata": {
                    "name": "Default Analysis",
                    "description": "Default analysis configuration"
                },
                "system_prompt": {
                    "content": "You are an expert analyst."
                },
                "sections": {}
            }
        
        try:
            with open(config_path, 'r') as f:
                return toml.load(f)
        except toml.TomlDecodeError as e:
            raise ValueError(f"Invalid TOML in deliverable config: {e}")
    
    def __repr__(self) -> str:
        """String representation of ConfigManager."""
        return f"ConfigManager(config_path='{self.config_path}')"