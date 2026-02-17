"""
Module: expert_registry
Purpose: Manage and access loaded expert personas
Author: AI Expert Council Team
"""

from typing import Dict, List, Optional, Set
from .prompt_loader import ExpertPersona, PromptLoader


class ExpertRegistry:
    """Central registry for managing expert personas."""
    
    def __init__(self, experts_dir: str = "experts", metadata_dir: str = "experts"):
        """Initialize the expert registry.
        
        Args:
            experts_dir: Path to the directory containing expert files
            metadata_dir: Path to the directory containing metadata files
        """
        self.experts_dir = experts_dir
        self.loader = PromptLoader(experts_dir, metadata_dir)
        self._experts: Dict[str, ExpertPersona] = {}
        self._loaded = False
    
    def load_all(self) -> None:
        """Load all available experts into the registry."""
        experts = self.loader.load_all_experts()
        
        for expert in experts:
            self._experts[expert.name] = expert
        
        self._loaded = True
        print(f"Loaded {len(self._experts)} experts into registry")
    
    def load_specific(self, names: List[str]) -> None:
        """Load specific experts by name.
        
        Args:
            names: List of expert names to load
        """
        for name in names:
            try:
                expert = self.loader.load_expert(name)
                self._experts[name] = expert
            except Exception as e:
                print(f"Failed to load expert '{name}': {e}")
        
        self._loaded = True
    
    def get(self, name: str) -> Optional[ExpertPersona]:
        """Get an expert by name.
        
        Args:
            name: The name of the expert
            
        Returns:
            ExpertPersona if found, None otherwise
        """
        return self._experts.get(name)
    
    def get_all(self) -> List[ExpertPersona]:
        """Get all loaded experts.
        
        Returns:
            List of all loaded ExpertPersona objects
        """
        return list(self._experts.values())
    
    def get_by_priority(self, max_priority: Optional[int] = None) -> List[ExpertPersona]:
        """Get experts filtered by priority.
        
        Args:
            max_priority: Maximum priority value (inclusive)
            
        Returns:
            List of experts sorted by priority
        """
        experts = self.get_all()
        
        if max_priority is not None:
            experts = [e for e in experts if e.priority <= max_priority]
        
        return sorted(experts, key=lambda e: e.priority)
    
    def get_names(self) -> List[str]:
        """Get names of all loaded experts.
        
        Returns:
            List of expert names
        """
        return list(self._experts.keys())
    
    def is_loaded(self, name: str) -> bool:
        """Check if an expert is loaded.
        
        Args:
            name: The name of the expert
            
        Returns:
            True if the expert is loaded, False otherwise
        """
        return name in self._experts
    
    def remove(self, name: str) -> bool:
        """Remove an expert from the registry.
        
        Args:
            name: The name of the expert to remove
            
        Returns:
            True if removed, False if not found
        """
        if name in self._experts:
            del self._experts[name]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all experts from the registry."""
        self._experts.clear()
        self._loaded = False
    
    def reload(self, name: str) -> bool:
        """Reload a specific expert from disk.
        
        Args:
            name: The name of the expert to reload
            
        Returns:
            True if successfully reloaded, False otherwise
        """
        try:
            expert = self.loader.load_expert(name)
            self._experts[name] = expert
            return True
        except Exception as e:
            print(f"Failed to reload expert '{name}': {e}")
            return False
    
    def validate_all(self) -> Dict[str, List[str]]:
        """Validate all loaded experts.
        
        Returns:
            Dictionary mapping expert names to lists of warnings
        """
        validations = {}
        
        for name, expert in self._experts.items():
            warnings = self.loader.validate_expert(expert)
            if warnings:
                validations[name] = warnings
        
        return validations
    
    def get_by_model(self, model: str) -> List[ExpertPersona]:
        """Get experts that use a specific model.
        
        Args:
            model: The model name to filter by
            
        Returns:
            List of experts using the specified model
        """
        return [
            expert for expert in self.get_all()
            if expert.model == model
        ]
    
    def get_available_experts(self) -> List[str]:
        """Get names of all available experts (loaded or not).
        
        Returns:
            List of available expert names
        """
        return self.loader.get_available_experts()
    
    def get_unloaded_experts(self) -> Set[str]:
        """Get names of experts that are available but not loaded.
        
        Returns:
            Set of unloaded expert names
        """
        available = set(self.get_available_experts())
        loaded = set(self.get_names())
        return available - loaded
    
    def __len__(self) -> int:
        """Get the number of loaded experts."""
        return len(self._experts)
    
    def __repr__(self) -> str:
        """String representation of the registry."""
        return f"ExpertRegistry({len(self)} experts loaded)"