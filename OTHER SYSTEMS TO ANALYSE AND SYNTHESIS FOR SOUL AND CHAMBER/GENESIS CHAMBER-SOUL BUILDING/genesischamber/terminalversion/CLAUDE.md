# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the AI Expert Council Simulator - a Python application that simulates roundtable debates between AI personas (experts) to analyze business problems.

## Essential Commands

### Package Management
- **ALWAYS use `uv` for Python package management**, never use plain `pip`
- Install dependencies: `uv pip install -r requirements.txt`
- Add new dependency: `uv pip install <package>`
- Create virtual environment: `uv venv`
- Activate virtual environment: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)

### Running the Application

**IMPORTANT: Always use the `./run` script** - it handles environment setup and dependencies automatically.

**Interactive Terminal UI (recommended):**
- `./run` - Launches interactive UI when called with no parameters
- Automatically selects appropriate model based on complexity
- Remembers your last used settings

**Command line mode:**
- `./run problems/<problem_file>.txt -simple -model gpt-4.1-nano` - Fast testing with simple prompts
- `./run problems/<problem_file>.txt -complex -model gpt-4.1` - Deep analysis with complex prompts

**Note**: The run script is the only supported entry point. It ensures:
- Virtual environment is properly activated
- All dependencies are installed
- Environment variables are loaded correctly
- Proper error handling and user guidance

### Required Flags
- **`-simple` or `-complex`**: Determines which expert prompt versions to use
- **`-model <model_name>`**: Specifies the AI model (e.g., `gpt-4.1-nano`, `gpt-4.1`)

### Maintenance Scripts
- `./run` - The ONLY entry point for the application. Handles virtual environment setup and dependency installation
  - When called without parameters: Launches interactive terminal UI
  - When called with parameters: Runs in command-line mode
- `./clean` - Removes all auto-generated files (venv, caches, outputs)

### Development
- Run tests: `python -m pytest tests/` (when tests are implemented)
- Check types: `python -m mypy .` (if type checking is set up)
- Format code: `python -m black .` (if black is installed)

## Project Structure

```
/home/julz/code/omnipresence/02/  (project root)
├── agents/              # LangChain agent implementations
├── documentation/       # Project specifications and plans
├── experts_simple/      # Simple expert persona text files
├── experts_complex/     # Complex expert persona text files
├── experts/            # Original experts folder (contains metadata .toml files)
├── orchestration/      # Debate flow management with LangGraph
├── output/             # Output formatting utilities
├── problems/           # Problem statement files for analysis
├── prompts/            # Configurable deliverable prompts (NEW)
│   └── business_analysis.toml  # Business analysis configuration
├── outputs/            # Generated debate reports (gitignored)
├── utils/              # Configuration, logging, and persona loading
├── config.toml         # Main configuration file with model-specific settings
├── main.py            # Application entry point
├── ui.py              # Terminal UI for easy interaction (NEW)
└── requirements.txt    # Python dependencies
```

## Recent System Improvements

### New Features (June 2025)
1. **Terminal UI**: Interactive terminal interface launched by running `./run` with no parameters
2. **Abstracted Deliverables**: Business analysis prompts now in `prompts/business_analysis.toml` for easy tuning
3. **Preference Storage**: UI remembers last used settings in `config.toml`
4. **Unified Entry Point**: The `./run` script is now the only way to start the program

### Fixed Issues (June 2025)
1. **Identity Confusion**: System now correctly identifies experts by name (not company names)
2. **Expert Distinctiveness**: Enhanced prompting ensures each expert maintains unique voice
3. **Debate Dynamics**: Moderator actively encourages disagreement and challenges consensus
4. **Formatting**: Cleaned up duplicate headers and nested summaries in output
5. **Context Awareness**: Experts better understand problem specifics (industry, scale, urgency)

### Model Configuration
The system supports model-specific configurations in `config.toml`:
- **gpt-4.1-nano**: Fast, simple model with small token limits for testing
- **gpt-4.1**: Advanced model with 1M context window for deep analysis

## Architecture Notes

1. **Expert System**: 
   - Simple prompts in `experts_simple/` for quick testing
   - Complex prompts in `experts_complex/` for detailed analysis
   - Metadata files remain in original `experts/` directory

2. **Agent Architecture**: 
   - `BaseCouncilAgent` is the abstract base for all agents
   - `ExpertAgent` represents individual expert personas with enhanced personality
   - `ModeratorAgent` actively facilitates debate and encourages disagreement
   - `SummarizerAgent` creates actionable summaries with proper expert attribution

3. **State Management**: Uses LangGraph for conversation state and turn management in `DebateOrchestrator`.

4. **Configuration**: TOML-based configuration with environment variable overrides and model-specific settings.

## Important Development Practices

1. **Environment Variables**: 
   - Never commit `.env` files
   - API keys go in `.env`, not in code
   - Use `.env.example` as template

2. **Dependencies**:
   - Main dependencies: langchain, langgraph, openai, python-dotenv, toml, rich
   - Always use exact version pinning in requirements.txt

3. **Error Handling**:
   - Retry logic implemented for LLM API calls
   - Graceful degradation if token limits approached
   - Clear error messages for missing files/config/model specifications

4. **Adding New Experts**:
   - Add simple version: `experts_simple/new_expert.txt`
   - Add complex version: `experts_complex/new_expert.txt`
   - Optionally add metadata: `experts/new_expert.meta.toml`
   - No code changes needed

5. **Output Management**:
   - Reports saved to `outputs/` directory (created automatically)
   - Markdown format with structured sections
   - Console shows progress indicators and summary
   - Live transcript available in `transcript.log`

## Common Tasks

### Add a New Expert
1. Create `experts_simple/new_expert.txt` with simple persona
2. Create `experts_complex/new_expert.txt` with detailed persona
3. Optionally create `experts/new_expert.meta.toml` for metadata
4. Expert automatically loaded on next run

### Create a Problem Statement
1. Write problem description in a `.txt` file
2. Save to `problems/` directory
3. Run with: `./run` (then select in UI) or `./run problems/your_problem.txt -simple -model gpt-4.1-nano`

### Modify Debate Behavior
1. Edit `config.toml` for rounds, temperature, model settings
2. Model-specific settings in `[models.gpt-4.1-nano]` or `[models.gpt-4.1]`
3. Per-expert overrides in metadata files
4. Changes take effect on next run

### Customize Business Analysis Output
1. Edit `prompts/business_analysis.toml` to modify:
   - System prompt for the summarizer
   - Individual section prompts (executive summary, insights, etc.)
   - Enable/disable specific sections
2. Changes take effect immediately on next run

## Testing Reminders

- Ensure `.env` has valid `OPENAI_API_KEY` before testing
- Start with included `problems/startup_scaling.txt` for testing
- Use `-simple -model gpt-4.1-nano` for quick tests
- Use `-complex -model gpt-4.1` for full analysis
- Check `outputs/` directory for generated reports
- Monitor console for progress and any errors
- View live debate in `transcript.log`