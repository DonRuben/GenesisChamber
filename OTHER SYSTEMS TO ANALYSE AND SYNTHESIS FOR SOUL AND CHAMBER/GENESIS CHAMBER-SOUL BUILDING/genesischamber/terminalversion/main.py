#!/usr/bin/env python3
"""
AI Expert Council Simulator
Main entry point for the application.
"""

import argparse
import sys
import logging
from pathlib import Path
from typing import Optional

from utils.config_manager import ConfigManager
from utils.logger import setup_logger
from utils.expert_registry import ExpertRegistry
from agents.expert_agent import ExpertAgent
from agents.moderator_agent import ModeratorAgent
from agents.summarizer_agent import SummarizerAgent
from orchestration.debate_orchestrator import DebateOrchestrator
from output.markdown_formatter import MarkdownFormatter


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="AI Expert Council Simulator - Multi-agent debate system"
    )
    parser.add_argument(
        "problem",
        type=str,
        help="Path to the problem statement file"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="config.toml",
        help="Path to configuration file (default: config.toml)"
    )
    parser.add_argument(
        "--no-log",
        action="store_true",
        help="Disable saving output to file"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="outputs",
        help="Directory for output files (default: outputs)"
    )
    parser.add_argument(
        "--complexity",
        type=str,
        choices=["simple", "complex"],
        required=True,
        help="Expert complexity level (simple or complex)"
    )
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        help="Model to use (e.g., gpt-4.1-nano, gpt-4.1)"
    )
    return parser.parse_args()


def load_problem_statement(file_path: str) -> str:
    """Load problem statement from file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Problem file not found: {file_path}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error reading problem file: {e}")
        sys.exit(1)


def main():
    """Main application entry point."""
    # Parse arguments
    args = parse_arguments()
    
    # Setup logging with more verbose output
    global logger
    logger = setup_logger("ai_expert_council", log_level="INFO")
    
    # Ensure all agent loggers also output to console
    logging.getLogger("agent").setLevel(logging.INFO)
    for handler in logger.handlers:
        logging.getLogger("agent").addHandler(handler)
    
    # Load configuration
    logger.info(f"Loading configuration for model: {args.model}")
    config = ConfigManager(args.config, model=args.model)
    
    # Override config with CLI arguments
    if args.no_log:
        config.config['log_output'] = False
    
    # Load problem statement
    logger.info(f"Loading problem statement from: {args.problem}")
    problem_statement = load_problem_statement(args.problem)
    
    # Load experts from appropriate directory based on complexity
    experts_dir = f"experts_{args.complexity}"
    metadata_dir = "experts"  # Metadata files stay in original experts directory
    logger.info(f"Loading expert personas from {experts_dir}...")
    expert_registry = ExpertRegistry(experts_dir, metadata_dir)
    expert_registry.load_all()
    
    experts = expert_registry.get_all()
    logger.info(f"Loaded {len(experts)} experts: {[e.name for e in experts]}")
    
    # Initialize agents
    logger.info("Initializing agents...")
    config_dict = config.config
    
    # Create expert agents
    expert_agents = []
    for persona in experts:
        agent = ExpertAgent(persona, config_dict)
        expert_agents.append(agent)
    
    # Create moderator and summarizer
    moderator = ModeratorAgent(config_dict)
    summarizer = SummarizerAgent(config_dict)
    
    # Create orchestrator
    logger.info("Setting up debate orchestrator...")
    orchestrator = DebateOrchestrator(
        experts=expert_agents,
        moderator=moderator,
        summarizer=summarizer,
        config=config_dict
    )
    
    # Run debate
    logger.info("Starting debate simulation...")
    try:
        results = orchestrator.run_debate(problem_statement)
    except Exception as e:
        logger.error(f"Error during debate: {e}")
        sys.exit(1)
    
    # Format and output results
    logger.info("Formatting results...")
    formatter = MarkdownFormatter(args.output_dir)
    
    # Extract problem title from filename
    problem_title = Path(args.problem).stem.replace('_', ' ').title()
    
    # Print to console
    print("\n" + "="*60)
    print("DEBATE COMPLETE - EXECUTIVE SUMMARY")
    print("="*60)
    print(results['summary'].get('executive_summary', 'No summary available'))
    print("="*60 + "\n")
    
    # Save to file if enabled
    if config_dict.get('log_output', True):
        output_path = formatter.save_report(results, problem_title)
        logger.info(f"Full report saved to: {output_path}")
        print(f"📄 Full report saved to: {output_path}")
    
    logger.info("Debate simulation complete!")


if __name__ == "__main__":
    main()