"""
Module: logger
Purpose: Logging configuration and utilities for AI Expert Council Simulator
Author: AI Expert Council Team
"""

import logging
import sys
from pathlib import Path
from typing import Optional, Union
from logging.handlers import RotatingFileHandler
from datetime import datetime


# Global logger instance
_logger: Optional[logging.Logger] = None


def setup_logger(
    name: str = "ai_expert_council",
    log_level: Union[str, int] = "INFO",
    log_file: Optional[str] = "debate.log",
    log_to_console: bool = True,
    log_format: Optional[str] = None,
    max_file_size: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
) -> logging.Logger:
    """Set up and configure logger for the application.
    
    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (None to disable file logging)
        log_to_console: Whether to log to console
        log_format: Custom log format string
        max_file_size: Maximum size of log file before rotation
        backup_count: Number of backup files to keep
        
    Returns:
        Configured logger instance
    """
    global _logger
    
    # Create logger
    logger = logging.getLogger(name)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Set log level
    if isinstance(log_level, str):
        log_level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Create formatter
    if log_format is None:
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    formatter = logging.Formatter(log_format)
    
    # Add console handler if requested
    if log_to_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(log_level)
        logger.addHandler(console_handler)
    
    # Add file handler if requested
    if log_file:
        # Create log directory if it doesn't exist
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create rotating file handler
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_file_size,
            backupCount=backup_count
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        logger.addHandler(file_handler)
    
    # Store global logger instance
    _logger = logger
    
    # Log initialization
    logger.info(f"Logger initialized: {name}")
    logger.debug(f"Log level: {logging.getLevelName(log_level)}")
    if log_file:
        logger.debug(f"Logging to file: {log_file}")
    if log_to_console:
        logger.debug("Logging to console enabled")
    
    return logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get logger instance.
    
    If no logger has been set up, creates a default one.
    
    Args:
        name: Logger name (uses module name if None)
        
    Returns:
        Logger instance
    """
    global _logger
    
    if _logger is None:
        # Set up default logger if none exists
        _logger = setup_logger()
    
    if name:
        # Return child logger with specified name
        return _logger.getChild(name)
    
    return _logger


class DebateLogger:
    """Specialized logger for debate sessions with structured logging."""
    
    def __init__(self, logger: Optional[logging.Logger] = None):
        """Initialize DebateLogger.
        
        Args:
            logger: Logger instance to use (creates new one if None)
        """
        self.logger = logger or get_logger("debate")
        self.debate_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.round_number = 0
    
    def start_debate(self, problem: str, experts: list) -> None:
        """Log debate start.
        
        Args:
            problem: Problem statement
            experts: List of expert names
        """
        self.logger.info(f"=== DEBATE START: {self.debate_id} ===")
        self.logger.info(f"Problem: {problem[:100]}...")
        self.logger.info(f"Experts: {', '.join(experts)}")
    
    def start_round(self, round_num: int) -> None:
        """Log round start.
        
        Args:
            round_num: Round number
        """
        self.round_number = round_num
        self.logger.info(f"--- Round {round_num} ---")
    
    def log_expert_response(self, expert: str, response: str, tokens: int) -> None:
        """Log expert response.
        
        Args:
            expert: Expert name
            response: Expert's response
            tokens: Token count
        """
        self.logger.info(f"[{expert}] Response ({tokens} tokens)")
        self.logger.debug(f"[{expert}] {response[:200]}...")
    
    def log_moderator_action(self, action: str, details: str) -> None:
        """Log moderator action.
        
        Args:
            action: Action type
            details: Action details
        """
        self.logger.info(f"[Moderator] {action}: {details}")
    
    def log_error(self, error: Exception, context: str) -> None:
        """Log error with context.
        
        Args:
            error: Exception instance
            context: Error context
        """
        self.logger.error(f"Error in {context}: {type(error).__name__}: {str(error)}")
    
    def log_summary(self, summary: str) -> None:
        """Log debate summary.
        
        Args:
            summary: Summary text
        """
        self.logger.info("=== DEBATE SUMMARY ===")
        self.logger.info(summary)
    
    def end_debate(self, total_tokens: int, duration: float) -> None:
        """Log debate end.
        
        Args:
            total_tokens: Total tokens used
            duration: Debate duration in seconds
        """
        self.logger.info(f"=== DEBATE END: {self.debate_id} ===")
        self.logger.info(f"Total rounds: {self.round_number}")
        self.logger.info(f"Total tokens: {total_tokens}")
        self.logger.info(f"Duration: {duration:.2f} seconds")


class TokenLogger:
    """Logger for tracking token usage and costs."""
    
    def __init__(self, logger: Optional[logging.Logger] = None):
        """Initialize TokenLogger.
        
        Args:
            logger: Logger instance to use
        """
        self.logger = logger or get_logger("tokens")
        self.total_tokens = 0
        self.tokens_by_expert = {}
    
    def log_token_usage(
        self,
        expert: str,
        prompt_tokens: int,
        completion_tokens: int,
        model: str = "gpt-4"
    ) -> None:
        """Log token usage for an expert.
        
        Args:
            expert: Expert name
            prompt_tokens: Number of prompt tokens
            completion_tokens: Number of completion tokens
            model: Model name for cost calculation
        """
        total = prompt_tokens + completion_tokens
        self.total_tokens += total
        
        if expert not in self.tokens_by_expert:
            self.tokens_by_expert[expert] = 0
        self.tokens_by_expert[expert] += total
        
        # Calculate approximate cost (example rates)
        cost_per_1k_prompt = 0.03 if "gpt-4" in model else 0.002
        cost_per_1k_completion = 0.06 if "gpt-4" in model else 0.002
        
        cost = (prompt_tokens * cost_per_1k_prompt + 
                completion_tokens * cost_per_1k_completion) / 1000
        
        self.logger.info(
            f"[{expert}] Tokens: {prompt_tokens} + {completion_tokens} = {total} "
            f"(~${cost:.4f})"
        )
    
    def get_summary(self) -> str:
        """Get token usage summary.
        
        Returns:
            Summary string
        """
        summary_lines = ["Token Usage Summary:"]
        summary_lines.append(f"Total tokens: {self.total_tokens}")
        
        for expert, tokens in sorted(self.tokens_by_expert.items()):
            percentage = (tokens / self.total_tokens * 100) if self.total_tokens > 0 else 0
            summary_lines.append(f"  {expert}: {tokens} ({percentage:.1f}%)")
        
        return "\n".join(summary_lines)


# Convenience functions for common logging patterns
def log_debug(message: str) -> None:
    """Log debug message."""
    get_logger().debug(message)


def log_info(message: str) -> None:
    """Log info message."""
    get_logger().info(message)


def log_warning(message: str) -> None:
    """Log warning message."""
    get_logger().warning(message)


def log_error(message: str, exception: Optional[Exception] = None) -> None:
    """Log error message with optional exception."""
    logger = get_logger()
    logger.error(message)
    if exception:
        logger.exception("Exception details:", exc_info=exception)


def log_critical(message: str) -> None:
    """Log critical message."""
    get_logger().critical(message)