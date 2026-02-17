# AI Expert Council Simulator - Complete Project Specification

## Project Overview

The AI Expert Council Simulator is a Python-based command-line application designed to simulate a roundtable debate between multiple AI personas ("experts") to analyze user-defined business problems. Each expert has a distinct persona, style, and knowledge domain, producing rich, multi-faceted discussions.

This project follows a modular, scalable architecture built with modern tooling and simple file-based configuration.

---

## Key Features

* **Modular expert system**: Easily add or modify expert personas via simple text files
* **Configurable parameters**: System behavior controlled via `config.toml`
* **Multi-agent orchestration**: Uses LangChain and LangGraph to manage complex conversations
* **Intelligent summarization**: Dedicated summarizer agent provides actionable insights
* **Structured output**: Markdown reports with summaries, transcripts, and analysis tables
* **Modern Python setup**: Built with `uv` for clean dependency management
* **Robust error handling**: Retry mechanisms for API failures
* **Token usage tracking**: Visual indicators for context window management

---

## Project Structure

```
ai_expert_council/
├── main.py                 # Entry point, orchestrates debates
├── config.toml            # System-wide configuration
├── .env                   # Environment variables (API keys, secrets)
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore file
├── experts/              # Persona prompt files (one per expert)
│   ├── steve_jobs.txt
│   ├── jeff_bezos.txt
│   ├── warren_buffett.txt
│   └── ... (more experts)
├── problems/             # User-submitted problem statements
│   └── example_problem.txt
├── outputs/              # Saved transcripts and summaries
│   └── [timestamp]_output.md
└── utils/                # Helper modules
    ├── __init__.py
    ├── config_loader.py  # TOML and env parsing
    ├── prompt_loader.py  # Expert persona loading
    └── markdown_formatter.py  # Output formatting
```

---

## Workflow Summary

### 1. Setup Phase
* Install Python 3.x and `uv` package manager
* Clone repository
* Install dependencies: `uv pip install -r requirements.txt`
* Configure API keys in `.env` file:
  ```
  OPENAI_API_KEY=your_key_here
  ```

### 2. Running the System

```bash
python main.py problems/example_problem.txt
```

### 3. Core Execution Flow

1. **Configuration Loading**
   - Parse `config.toml` for system settings
   - Load environment variables from `.env`
   - Validate required API keys

2. **Expert Initialization**
   - Scan `experts/` directory for persona files
   - Load each expert's prompt and optional metadata
   - Initialize LangChain agents for each expert

3. **Problem Analysis**
   - Read user's problem statement from specified file
   - Pre-process for context and clarity

4. **Debate Orchestration**
   - Create LangGraph state machine for conversation flow
   - Initialize moderator agent to facilitate discussion
   - Execute turn-based debate system:
     - Each expert receives full conversation history
     - Experts directly respond to and challenge each other
     - Moderator ensures productive discussion
     - Visual progress indicators show token usage

5. **Summarization Phase**
   - After configured rounds complete, invoke summarizer agent
   - Generate structured analysis including:
     - Executive summary
     - Pros/cons analysis
     - Actionable recommendations
     - Key insights and disagreements

6. **Output Generation**
   - Format results as clean markdown
   - Print to console
   - Save to timestamped file in `outputs/`

---

## Configuration Details

### config.toml Structure

```toml
# Model Configuration
model = "gpt-4-turbo-preview"  # LLM model to use
temperature = 0.7               # Global creativity/randomness (0.0-1.0)
max_rounds = 2                  # Number of complete discussion rounds
log_output = true               # Save outputs to file

# Optional: Expert-specific overrides
[experts.steve_jobs]
temperature = 0.9              # Jobs is more creative/passionate

[experts.warren_buffett]
temperature = 0.3              # Buffett is more conservative/analytical

# Moderator Configuration
[moderator]
enabled = true
style = "socratic"             # Options: socratic, directive, minimal
```

---

## Expert Persona System

### Persona Definition Files

Each expert is defined by a plain text file in the `experts/` directory containing their complete system prompt. Example structure:

```text
# experts/steve_jobs.txt

You are Steve Jobs, the visionary co-founder and former CEO of Apple. Your approach to business and product development is characterized by:

CORE PHILOSOPHY:
- Relentless focus on user experience and simplicity
- Belief that technology should be at the intersection of liberal arts and sciences
- "It's better to be a pirate than to join the navy" - think different
- Products should be "insanely great" and delight customers

DECISION-MAKING STYLE:
- Trust intuition over market research
- Say "no" to 1000 things to focus on what truly matters
- Work backwards from the user experience to the technology
- Demand perfection and push teams beyond their perceived limits

COMMUNICATION STYLE:
- Direct, passionate, sometimes confrontational
- Use vivid metaphors and storytelling
- Challenge conventional thinking
- Dismiss mediocrity harshly

When analyzing business problems, you focus on:
- How to create products people don't yet know they need
- Building integrated experiences, not just products
- The importance of design and aesthetic beauty
- Creating a reality distortion field to achieve the impossible
```

### Optional Metadata Files

For advanced configuration, each expert can have a `.meta.toml` file:

```toml
# experts/steve_jobs.meta.toml

[persona]
role = "Visionary Product Creator"
expertise = ["product_design", "user_experience", "marketing", "leadership"]
priority = 1                    # Speaking order priority
color = "blue"                  # Console output color

[debate_style]
assertiveness = 0.9            # How strongly they defend positions
contrarian = 0.8               # Likelihood to challenge others
detail_oriented = 0.6          # Focus on specifics vs big picture
```

---

## Interaction & Debate Mechanics

### Turn-Based System
1. Moderator introduces the problem
2. Each expert speaks in priority order (or load order if no priority set)
3. Experts receive:
   - Original problem statement
   - Full conversation history
   - Direct prompts to respond to previous speakers
4. Process repeats for configured number of rounds

### Moderator Agent
The moderator ensures productive discussion by:
- Preventing repetition and circular arguments
- Encouraging experts to address specific points
- Prompting for concrete examples when needed
- Managing time/token budget per expert

### Response Quality Control
- Retry mechanism with exponential backoff for API failures
- Fallback to next expert if one fails repeatedly
- Graceful degradation if token limits approached

---

## Output Format

### Console Output
```
AI Expert Council - Analyzing: [Problem Title]
═══════════════════════════════════════════════

⚡ Steve Jobs is thinking... [████████░░] 82% tokens used
✓ Steve Jobs has spoken

💼 Jeff Bezos is thinking... [██████░░░░] 61% tokens used
✓ Jeff Bezos has spoken

[... continues for all experts and rounds ...]

📊 Generating final analysis...
```

### Markdown Report Structure
```markdown
# AI Expert Council Report - [Problem Title]
**Date**: 2024-01-15 10:30:00
**Experts**: Steve Jobs, Jeff Bezos, Warren Buffett
**Rounds**: 2

## Executive Summary

[Concise 2-3 paragraph overview of key findings and recommendations]

## Key Insights

### Points of Agreement
- All experts agreed that...
- Consensus emerged around...

### Points of Contention
- Jobs argued for X while Bezos preferred Y
- Buffett's conservative approach contrasted with...

## Pros and Cons Analysis

| Aspect | Pros | Cons |
|--------|------|------|
| Market Timing | • High growth potential<br>• First-mover advantage | • Uncertain demand<br>• Regulatory risks |
| Technology | • Proven solution exists<br>• Scalable architecture | • High initial investment<br>• Complexity |

## Recommended Actions

1. **Immediate (0-3 months)**
   - Action item 1 with specific steps
   - Action item 2 with metrics

2. **Short-term (3-6 months)**
   - Strategic initiative 1
   - Strategic initiative 2

3. **Long-term (6+ months)**
   - Vision and scaling plans

## Risk Mitigation

[Table of identified risks and mitigation strategies]

## Full Transcript

### Round 1

**Steve Jobs**: [Full response...]

**Jeff Bezos**: [Full response...]

**Warren Buffett**: [Full response...]

### Round 2

[Continued transcript...]
```

---

## Technical Implementation Details

### Technology Stack
- **Python 3.10+**: Core language
- **uv**: Modern Python package manager
- **LangChain**: LLM orchestration framework
- **LangGraph**: Conversation state management
- **OpenAI API**: GPT-4 or other models
- **python-dotenv**: Environment variable management
- **toml**: Configuration file parsing
- **rich**: Console output formatting (optional)

### Key Libraries
```python
langchain>=0.1.0
langgraph>=0.0.20
openai>=1.0.0
python-dotenv>=1.0.0
toml>=0.10.2
rich>=13.0.0  # Optional for better console output
```

### Error Handling Strategy
1. **API Failures**: Exponential backoff with max 3 retries
2. **Token Limits**: Warn at 80%, truncate context at 90%
3. **Missing Files**: Clear error messages with resolution steps
4. **Invalid Config**: Validate on startup with helpful diagnostics

---

## Development Roadmap

### Phase 1: Core Infrastructure ✓
- Project setup and structure
- Configuration management
- Basic prompt loading

### Phase 2: Agent System
- LangChain agent initialization
- Expert persona implementation
- Basic conversation flow

### Phase 3: Orchestration
- LangGraph state management
- Moderator implementation
- Turn-based debate system

### Phase 4: Intelligence Layer
- Summarizer agent
- Analysis generation
- Output formatting

### Phase 5: Polish & Extensions
- Token usage visualization
- Advanced error handling
- Performance optimizations
- Additional expert personas

---

## Usage Examples

### Basic Usage
```bash
# Analyze a business problem with default settings
python main.py problems/new_product_launch.txt
```

### Custom Configuration
```bash
# Use different config file
python main.py problems/market_analysis.txt --config custom_config.toml
```

### Output Management
```bash
# Disable file output
python main.py problems/quick_question.txt --no-log

# Specify output directory
python main.py problems/analysis.txt --output-dir results/
```

---

## Extension Points

The system is designed for easy extension:

1. **New Experts**: Drop a `.txt` file in `experts/`
2. **Custom Moderators**: Add moderator styles in config
3. **Analysis Modules**: Extend summarizer capabilities
4. **Output Formats**: Add new formatters (JSON, PDF, etc.)
5. **Model Providers**: Swap OpenAI for Anthropic, local models, etc.

---

## Best Practices

### Writing Expert Personas
- Focus on authentic voice and decision-making patterns
- Include specific frameworks or methodologies they use
- Balance personality with analytical capability
- Avoid caricatures - aim for nuanced perspectives

### Problem Statements
- Provide sufficient context and constraints
- Include specific metrics or goals when relevant
- Frame as genuine business challenges
- Avoid yes/no questions - seek strategic analysis

### Configuration Tuning
- Start with moderate temperatures (0.6-0.7)
- Increase rounds for complex problems
- Monitor token usage and adjust accordingly
- Use expert-specific overrides sparingly

---

## Security Considerations

- Never commit `.env` file (add to `.gitignore`)
- Validate all user inputs before processing
- Implement rate limiting for API calls
- Log errors without exposing sensitive data
- Sanitize problem statements if needed

---

## Future Enhancements

### Planned Features
- Web UI for easier interaction
- Real-time streaming of expert responses
- Integration with business intelligence tools
- Custom expert creation wizard
- Conversation branching and exploration
- Export to presentation formats

### Architectural Improvements
- Redis for conversation state persistence
- Async processing for parallel expert thinking
- Plugin system for custom analyzers
- Multi-language support
- Fine-tuned models for specific industries

---

This specification serves as the complete guide for implementing the AI Expert Council Simulator. The modular design ensures easy maintenance and extension while the clear architecture promotes rapid development and iteration.