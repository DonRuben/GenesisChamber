"""
Module: prompt_loader
Purpose: Load expert personas from text files with optional metadata
Author: AI Expert Council Team
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Any
import toml
from dataclasses import dataclass, field


@dataclass
class ExpertPersona:
    """Represents an expert persona with their prompt and metadata."""
    
    name: str
    prompt: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def temperature(self) -> Optional[float]:
        """Get the temperature setting for this expert."""
        return self.metadata.get('temperature', None)
    
    @property
    def priority(self) -> int:
        """Get the priority for this expert (lower number = higher priority)."""
        return self.metadata.get('priority', 999)
    
    @property
    def model(self) -> Optional[str]:
        """Get the specific model to use for this expert."""
        return self.metadata.get('model', None)
    
    @property
    def max_tokens(self) -> Optional[int]:
        """Get the max tokens setting for this expert."""
        return self.metadata.get('max_tokens', None)
    
    def __repr__(self) -> str:
        """String representation of the expert."""
        return f"ExpertPersona(name='{self.name}', priority={self.priority})"


class PromptLoader:
    """Handles loading of expert personas from the filesystem."""
    
    def __init__(self, experts_dir: str = "experts", metadata_dir: str = "experts"):
        """Initialize the prompt loader.
        
        Args:
            experts_dir: Path to the directory containing expert files
            metadata_dir: Path to the directory containing metadata files
        """
        self.experts_dir = Path(experts_dir)
        self.metadata_dir = Path(metadata_dir)
        if not self.experts_dir.exists():
            raise ValueError(f"Experts directory not found: {self.experts_dir}")
        if not self.metadata_dir.exists():
            raise ValueError(f"Metadata directory not found: {self.metadata_dir}")
    
    def load_all_experts(self) -> List[ExpertPersona]:
        """Load all available expert personas.
        
        Returns:
            List of ExpertPersona objects sorted by priority
            
        Raises:
            ValueError: If the experts directory doesn't exist
            IOError: If there's an error reading expert files
        """
        experts = []
        
        # Find all .txt files in the experts directory
        for txt_file in self.experts_dir.glob("*.txt"):
            # Skip metadata files
            if txt_file.stem.endswith('.meta'):
                continue
                
            try:
                expert = self.load_expert(txt_file.stem)
                experts.append(expert)
            except Exception as e:
                print(f"Warning: Failed to load expert {txt_file.stem}: {e}")
                continue
        
        # Sort by priority (lower number = higher priority)
        experts.sort(key=lambda x: x.priority)
        
        return experts
    
    def load_expert(self, name: str) -> ExpertPersona:
        """Load a specific expert persona by name.
        
        Args:
            name: The name of the expert (without file extension)
            
        Returns:
            ExpertPersona object with loaded prompt and metadata
            
        Raises:
            FileNotFoundError: If the expert file doesn't exist
            IOError: If there's an error reading the files
        """
        # Construct file paths
        prompt_file = self.experts_dir / f"{name}.txt"
        meta_file = self.metadata_dir / f"{name}.meta.toml"
        
        # Check if prompt file exists
        if not prompt_file.exists():
            raise FileNotFoundError(f"Expert prompt file not found: {prompt_file}")
        
        # Load the prompt
        try:
            with open(prompt_file, 'r', encoding='utf-8') as f:
                prompt = f.read().strip()
        except Exception as e:
            raise IOError(f"Error reading prompt file {prompt_file}: {e}")
        
        # Load metadata if it exists
        metadata = {}
        if meta_file.exists():
            try:
                with open(meta_file, 'r', encoding='utf-8') as f:
                    metadata = toml.load(f)
            except Exception as e:
                print(f"Warning: Error reading metadata file {meta_file}: {e}")
                # Continue with empty metadata rather than failing
        
        # Create and return the persona
        return ExpertPersona(
            name=name,
            prompt=prompt,
            metadata=metadata
        )
    
    def get_available_experts(self) -> List[str]:
        """Get a list of available expert names.
        
        Returns:
            List of expert names (without file extensions)
        """
        experts = []
        
        for txt_file in self.experts_dir.glob("*.txt"):
            # Skip metadata files
            if txt_file.stem.endswith('.meta'):
                continue
            experts.append(txt_file.stem)
        
        return sorted(experts)
    
    def validate_expert(self, persona: ExpertPersona) -> List[str]:
        """Validate an expert persona for common issues.
        
        Args:
            persona: The ExpertPersona to validate
            
        Returns:
            List of warning messages (empty if no issues)
        """
        warnings = []
        
        # Check prompt length
        if len(persona.prompt) < 50:
            warnings.append(f"Expert '{persona.name}' has a very short prompt ({len(persona.prompt)} chars)")
        
        # Check for required metadata fields
        if persona.temperature is not None:
            if not (0.0 <= persona.temperature <= 2.0):
                warnings.append(f"Expert '{persona.name}' has invalid temperature: {persona.temperature}")
        
        if persona.max_tokens is not None:
            if persona.max_tokens < 1:
                warnings.append(f"Expert '{persona.name}' has invalid max_tokens: {persona.max_tokens}")
        
        # Check for empty prompt
        if not persona.prompt.strip():
            warnings.append(f"Expert '{persona.name}' has an empty prompt")
        
        return warnings