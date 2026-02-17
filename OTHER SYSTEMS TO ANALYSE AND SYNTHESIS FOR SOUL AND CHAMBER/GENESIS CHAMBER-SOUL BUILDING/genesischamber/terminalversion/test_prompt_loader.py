#!/usr/bin/env python3
"""
Simple test script to verify the prompt loader and expert registry work correctly.
"""

from utils.prompt_loader import PromptLoader, ExpertPersona
from utils.expert_registry import ExpertRegistry


def test_prompt_loader():
    """Test the PromptLoader functionality."""
    print("Testing PromptLoader...")
    print("-" * 50)
    
    try:
        # Initialize loader
        loader = PromptLoader("experts")
        
        # Test getting available experts
        available = loader.get_available_experts()
        print(f"Available experts: {available}")
        
        # Test loading a specific expert
        if available:
            expert_name = available[0]
            expert = loader.load_expert(expert_name)
            print(f"\nLoaded expert: {expert}")
            print(f"Temperature: {expert.temperature}")
            print(f"Priority: {expert.priority}")
            print(f"Model: {expert.model}")
            print(f"Max tokens: {expert.max_tokens}")
            print(f"Prompt preview: {expert.prompt[:100]}...")
            
            # Validate the expert
            warnings = loader.validate_expert(expert)
            if warnings:
                print(f"\nValidation warnings: {warnings}")
            else:
                print("\nNo validation warnings")
        
        # Test loading all experts
        all_experts = loader.load_all_experts()
        print(f"\nLoaded {len(all_experts)} experts total")
        
    except Exception as e:
        print(f"Error: {e}")


def test_expert_registry():
    """Test the ExpertRegistry functionality."""
    print("\n\nTesting ExpertRegistry...")
    print("-" * 50)
    
    try:
        # Initialize registry
        registry = ExpertRegistry("experts")
        
        # Get available experts
        available = registry.get_available_experts()
        print(f"Available experts: {available}")
        
        # Load all experts
        registry.load_all()
        print(f"Registry: {registry}")
        
        # Get all loaded experts
        experts = registry.get_all()
        print(f"\nLoaded experts: {[e.name for e in experts]}")
        
        # Get experts by priority
        high_priority = registry.get_by_priority(max_priority=5)
        print(f"High priority experts: {[e.name for e in high_priority]}")
        
        # Validate all experts
        validations = registry.validate_all()
        if validations:
            print(f"\nValidation issues: {validations}")
        else:
            print("\nAll experts validated successfully")
            
        # Test getting unloaded experts
        unloaded = registry.get_unloaded_experts()
        if unloaded:
            print(f"\nUnloaded experts: {unloaded}")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_prompt_loader()
    test_expert_registry()