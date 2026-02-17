# Technical Implementation Plan - AI Expert Council Simulator

## Overview

This document provides a detailed technical roadmap for implementing the AI Expert Council Simulator. It includes architecture details, implementation steps, task allocation for sub-agents, and specific technical decisions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         main.py                              │
│  (Entry point - CLI argument parsing and orchestration)     │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│                    Core Engine                               │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Config Manager  │  │ Prompt Loader │  │ State Manager │ │
│  │ (config.toml)   │  │ (experts/)    │  │ (LangGraph)   │ │
│  └─────────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Agent Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │   Expert     │  │  Moderator  │  │   Summarizer    │  │
│  │   Agents     │  │    Agent    │  │     Agent       │  │
│  │ (LangChain)  │  │ (LangChain) │  │  (LangChain)    │  │
│  └─────────────┘  └─────────────┘  └───────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Output Layer                              │
│  ┌──────────────────┐  ┌────────────────┐                  │
│  │ Console Renderer │  │ File Writer    │                  │
│  │ (Rich library)   │  │ (Markdown)     │                  │
│  └──────────────────┘  └────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Project Foundation (Sub-Agent 1: Setup Specialist)

**Objective**: Create project structure and basic configuration system

**Tasks**:
1. Initialize project structure
2. Set up Python environment with uv
3. Create configuration management
4. Implement logging system

**Deliverables**:
```
ai_expert_council/
├── pyproject.toml          # Project metadata (if using uv)
├── requirements.txt        # Dependencies
├── .env.example           # Template for API keys
├── .gitignore             # Git ignore rules
├── config.toml            # Default configuration
├── main.py                # Entry point (skeleton)
├── utils/
│   ├── __init__.py
│   ├── config_manager.py  # TOML and env loading
│   └── logger.py          # Logging configuration
├── experts/               # Expert persona directory
├── problems/              # Problem statements directory
└── outputs/               # Output storage directory
```

**Key Code Components**:

```python
# utils/config_manager.py
class ConfigManager:
    def __init__(self, config_path="config.toml"):
        self.config = self._load_config(config_path)
        self._load_env()
    
    def _load_config(self, path):
        # Load TOML configuration
        pass
    
    def _load_env(self):
        # Load environment variables
        pass
    
    def get(self, key, default=None):
        # Get configuration value
        pass
```

### Phase 2: Expert System (Sub-Agent 2: Expert System Specialist)

**Objective**: Implement expert persona management and loading

**Tasks**:
1. Create expert persona files
2. Implement prompt loader with metadata support
3. Create expert registry system
4. Build persona validation

**Deliverables**:
```
experts/
├── steve_jobs.txt
├── steve_jobs.meta.toml
├── jeff_bezos.txt
├── jeff_bezos.meta.toml
├── warren_buffett.txt
└── warren_buffett.meta.toml

utils/
├── prompt_loader.py       # Expert loading logic
└── expert_registry.py     # Expert management
```

**Key Code Components**:

```python
# utils/prompt_loader.py
class ExpertPersona:
    def __init__(self, name, prompt, metadata=None):
        self.name = name
        self.prompt = prompt
        self.metadata = metadata or {}
    
    @property
    def temperature(self):
        return self.metadata.get('temperature', None)
    
    @property
    def priority(self):
        return self.metadata.get('priority', 999)

class PromptLoader:
    def __init__(self, experts_dir="experts"):
        self.experts_dir = experts_dir
    
    def load_all_experts(self):
        # Scan directory and load all experts
        pass
    
    def load_expert(self, name):
        # Load specific expert with metadata
        pass
```

### Phase 3: LLM Integration (Sub-Agent 3: AI Integration Specialist)

**Objective**: Implement LangChain agents and basic LLM communication

**Tasks**:
1. Set up OpenAI client with error handling
2. Create LangChain agent wrappers
3. Implement token counting and management
4. Build retry logic for API calls

**Deliverables**:
```
agents/
├── __init__.py
├── base_agent.py          # Abstract base for all agents
├── expert_agent.py        # Expert persona agents
├── moderator_agent.py     # Discussion facilitator
└── summarizer_agent.py    # Summary generator

utils/
├── llm_client.py          # OpenAI/LLM interface
└── token_manager.py       # Token counting/budgeting
```

**Key Code Components**:

```python
# agents/base_agent.py
from abc import ABC, abstractmethod
from langchain.agents import Agent

class BaseCouncilAgent(ABC):
    def __init__(self, name, system_prompt, config):
        self.name = name
        self.system_prompt = system_prompt
        self.config = config
        self.agent = self._create_agent()
    
    @abstractmethod
    def _create_agent(self):
        # Create LangChain agent
        pass
    
    @abstractmethod
    def respond(self, conversation_history, problem_statement):
        # Generate response
        pass

# agents/expert_agent.py
class ExpertAgent(BaseCouncilAgent):
    def __init__(self, persona, config):
        super().__init__(
            name=persona.name,
            system_prompt=persona.prompt,
            config=config
        )
        self.persona = persona
    
    def _create_agent(self):
        # Create LangChain agent with persona
        pass
    
    def respond(self, conversation_history, problem_statement):
        # Generate expert response
        pass
```

### Phase 4: Orchestration Engine (Sub-Agent 4: Orchestration Specialist)

**Objective**: Implement conversation flow management with LangGraph

**Tasks**:
1. Design state graph for conversation flow
2. Implement turn management system
3. Create moderator logic
4. Build conversation memory

**Deliverables**:
```
orchestration/
├── __init__.py
├── debate_orchestrator.py  # Main orchestration logic
├── state_manager.py        # LangGraph state management
└── conversation_memory.py  # History tracking
```

**Key Code Components**:

```python
# orchestration/debate_orchestrator.py
from langgraph.graph import Graph, Node

class DebateOrchestrator:
    def __init__(self, experts, moderator, config):
        self.experts = experts
        self.moderator = moderator
        self.config = config
        self.graph = self._build_graph()
    
    def _build_graph(self):
        # Create LangGraph state machine
        graph = Graph()
        
        # Add nodes for each expert
        for expert in self.experts:
            graph.add_node(
                Node(
                    name=f"expert_{expert.name}",
                    function=expert.respond
                )
            )
        
        # Add moderator node
        graph.add_node(
            Node(
                name="moderator",
                function=self.moderator.facilitate
            )
        )
        
        # Define edges (conversation flow)
        # ...
        
        return graph
    
    def run_debate(self, problem_statement):
        # Execute the debate
        pass
```

### Phase 5: Output System (Sub-Agent 5: Output Specialist)

**Objective**: Implement output formatting and file management

**Tasks**:
1. Create markdown formatter
2. Implement console renderer with progress indicators
3. Build file output system
4. Add summary extraction logic

**Deliverables**:
```
output/
├── __init__.py
├── markdown_formatter.py   # Markdown generation
├── console_renderer.py     # Rich console output
└── file_manager.py         # Output file handling
```

**Key Code Components**:

```python
# output/markdown_formatter.py
class MarkdownFormatter:
    def __init__(self):
        self.template = self._load_template()
    
    def format_debate(self, debate_data):
        # Format complete debate as markdown
        pass
    
    def format_summary(self, summary_data):
        # Format executive summary
        pass
    
    def format_transcript(self, transcript):
        # Format conversation transcript
        pass

# output/console_renderer.py
from rich.console import Console
from rich.progress import Progress

class ConsoleRenderer:
    def __init__(self):
        self.console = Console()
    
    def show_expert_thinking(self, expert_name, progress):
        # Display thinking indicator
        pass
    
    def show_completion(self, expert_name):
        # Show completion message
        pass
```

### Phase 6: Integration & Testing (All Sub-Agents Collaborate)

**Objective**: Integrate all components and create comprehensive tests

**Tasks**:
1. Wire all components together in main.py
2. Create integration tests
3. Add example problems
4. Implement end-to-end testing

**Deliverables**:
```
tests/
├── __init__.py
├── test_config.py
├── test_experts.py
├── test_orchestration.py
├── test_output.py
└── test_integration.py

problems/
├── example_startup.txt
├── example_expansion.txt
└── example_pivot.txt
```

---

## Sub-Agent Task Allocation

### Sub-Agent 1: Setup Specialist
**Focus**: Project infrastructure and configuration
**Files to create**:
- Project structure
- `requirements.txt`
- `config.toml`
- `utils/config_manager.py`
- `utils/logger.py`
- `.env.example`
- `.gitignore`

### Sub-Agent 2: Expert System Specialist
**Focus**: Persona management and loading
**Files to create**:
- All expert persona files
- `utils/prompt_loader.py`
- `utils/expert_registry.py`

### Sub-Agent 3: AI Integration Specialist
**Focus**: LLM communication and agents
**Files to create**:
- `agents/` directory and all agent classes
- `utils/llm_client.py`
- `utils/token_manager.py`

### Sub-Agent 4: Orchestration Specialist
**Focus**: Conversation flow and state management
**Files to create**:
- `orchestration/` directory and all components
- Integration with LangGraph

### Sub-Agent 5: Output Specialist
**Focus**: Results formatting and presentation
**Files to create**:
- `output/` directory and all formatters
- Console rendering logic

---

## Technical Decisions

### 1. Dependency Management
- Use `uv` for modern Python packaging
- Pin all dependencies with exact versions
- Separate dev dependencies

### 2. Configuration Strategy
- TOML for human-readable config
- Environment variables for secrets only
- Layered configuration (defaults → file → env → CLI)

### 3. Error Handling Pattern
```python
class APIError(Exception):
    """Base exception for API-related errors"""
    pass

class TokenLimitError(APIError):
    """Raised when token limit exceeded"""
    pass

class ExpertResponseError(APIError):
    """Raised when expert fails to respond"""
    pass

# Retry decorator
def retry_with_backoff(max_attempts=3, backoff_factor=2):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except APIError as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(backoff_factor ** attempt)
            return None
        return wrapper
    return decorator
```

### 4. State Management
- Use LangGraph's built-in state persistence
- Implement checkpointing for long debates
- Memory-efficient conversation history

### 5. Testing Strategy
- Unit tests for each component
- Integration tests for agent interactions
- End-to-end tests with mock LLM responses
- Performance tests for token usage

---

## Development Checkpoints

### Checkpoint 1: Basic Setup ✓
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Config system working
- [ ] Can load a test configuration

### Checkpoint 2: Expert Loading ✓
- [ ] Expert files created
- [ ] Prompt loader working
- [ ] Can list all available experts
- [ ] Metadata parsing functional

### Checkpoint 3: LLM Communication ✓
- [ ] OpenAI client configured
- [ ] Can send/receive basic prompts
- [ ] Error handling works
- [ ] Token counting accurate

### Checkpoint 4: Basic Debate ✓
- [ ] Experts can speak in turns
- [ ] Conversation history maintained
- [ ] Basic output generated
- [ ] No crashes in full cycle

### Checkpoint 5: Full System ✓
- [ ] Moderator functioning
- [ ] Summarizer working
- [ ] Beautiful console output
- [ ] Markdown reports generated

### Checkpoint 6: Production Ready ✓
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance optimized
- [ ] Error handling robust

---

## Performance Considerations

### Token Optimization
1. Implement sliding window for long conversations
2. Summarize older rounds for context
3. Use token-aware truncation
4. Cache common prompts

### API Rate Limiting
1. Implement request queuing
2. Add configurable delays
3. Track API usage metrics
4. Provide cost estimates

### Memory Management
1. Stream responses when possible
2. Clean up completed rounds
3. Use generators for large outputs
4. Implement conversation pruning

---

## Code Style Guidelines

### Python Standards
- Follow PEP 8
- Use type hints throughout
- Docstrings for all public methods
- Black for formatting

### Project Conventions
```python
# File header template
"""
Module: {module_name}
Purpose: {brief_description}
Author: AI Expert Council Team
"""

# Class template
class ExampleClass:
    """Brief description of class purpose."""
    
    def __init__(self, param: str) -> None:
        """Initialize ExampleClass.
        
        Args:
            param: Description of parameter
        """
        self.param = param
    
    def public_method(self) -> str:
        """Brief description of method.
        
        Returns:
            Description of return value
        """
        pass
```

---

## Security Considerations

### API Key Management
- Never hardcode keys
- Use `.env` file locally
- Document secure deployment methods
- Implement key rotation support

### Input Validation
- Sanitize file paths
- Validate configuration values
- Limit file sizes
- Prevent prompt injection

### Output Security
- Sanitize generated content
- Prevent directory traversal
- Validate output paths
- Implement access controls

---

## Deployment Considerations

### Local Development
```bash
# Setup
git clone <repo>
cd ai_expert_council
uv venv
source .venv/bin/activate  # or Windows equivalent
uv pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API key

# Run
python main.py problems/example.txt
```

### Production Deployment
- Container-based deployment recommended
- Environment-specific configs
- Centralized logging
- Monitoring and alerting

---

## Next Steps

1. **Immediate**: Start with Sub-Agent 1 tasks (project setup)
2. **Parallel Work**: Sub-Agents 2-5 can work simultaneously after setup
3. **Integration**: Bring components together incrementally
4. **Testing**: Continuous testing during development
5. **Documentation**: Update docs as implementation progresses

This plan provides a clear roadmap for building the AI Expert Council Simulator with well-defined boundaries for sub-agent collaboration.