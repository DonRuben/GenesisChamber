#!/usr/bin/env python3
"""
Terminal UI for AI Expert Council Simulator
Simple interface for selecting complexity and problem files
"""

import sys
import subprocess
from pathlib import Path
from typing import Optional, Tuple

from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

from utils.config_manager import ConfigManager


console = Console()


class TerminalUI:
    """Simple terminal UI for the Expert Council."""
    
    def __init__(self):
        self.config_manager = ConfigManager("config.toml")
        self.problems_dir = Path("problems")
        self.last_complexity = self._get_last_preference("last_complexity", "simple")
        self.last_problem = self._get_last_preference("last_problem", None)
    
    def _get_last_preference(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get last used preference from config."""
        ui_prefs = self.config_manager.config.get("ui_preferences", {})
        return ui_prefs.get(key, default)
    
    def _save_preferences(self, complexity: str, problem: str):
        """Save user preferences to config.toml."""
        # Update the config in memory
        if "ui_preferences" not in self.config_manager.config:
            self.config_manager.config["ui_preferences"] = {}
        
        self.config_manager.config["ui_preferences"]["last_complexity"] = complexity
        self.config_manager.config["ui_preferences"]["last_problem"] = problem
        
        # Save to file
        self.config_manager.save_preferences()
    
    def _get_problem_files(self) -> list[Path]:
        """Get all problem files from the problems directory."""
        return sorted(self.problems_dir.glob("*.txt"))
    
    def _display_header(self):
        """Display the application header."""
        console.clear()
        header = Panel.fit(
            "[bold cyan]AI Expert Council Simulator[/bold cyan]\n"
            "[dim]Terminal Interface[/dim]",
            border_style="cyan"
        )
        console.print(header)
        console.print()
    
    def _select_complexity(self) -> str:
        """Let user select complexity mode."""
        # Create options table
        table = Table(show_header=False, box=None)
        table.add_column("Option", style="cyan", width=12)
        table.add_column("Description")
        table.add_column("Model", style="yellow")
        
        table.add_row(
            "1. Simple",
            "Quick analysis with concise responses",
            "gpt-4.1-nano"
        )
        table.add_row(
            "2. Complex",
            "Deep analysis with detailed insights",
            "gpt-4.1"
        )
        
        console.print("[bold]Select Complexity Mode:[/bold]")
        console.print(table)
        console.print()
        
        # Show last used
        if self.last_complexity:
            default = "1" if self.last_complexity == "simple" else "2"
            console.print(f"[dim]Last used: {self.last_complexity} (press Enter for default)[/dim]")
        else:
            default = "1"
        
        choice = Prompt.ask(
            "Enter choice",
            choices=["1", "2"],
            default=default
        )
        
        return "simple" if choice == "1" else "complex"
    
    def _select_problem(self) -> Tuple[str, str]:
        """Let user select a problem file."""
        problems = self._get_problem_files()
        
        if not problems:
            console.print("[red]No problem files found in problems/ directory![/red]")
            sys.exit(1)
        
        # Display problems
        console.print("\n[bold]Available Problems:[/bold]")
        table = Table(show_header=False, box=None)
        table.add_column("", style="cyan", width=4)
        table.add_column("Problem File", style="green")
        
        for i, problem in enumerate(problems, 1):
            table.add_row(f"{i}.", problem.name)
        
        console.print(table)
        console.print()
        
        # Find default
        default_idx = "1"
        if self.last_problem:
            for i, p in enumerate(problems, 1):
                if p.name == self.last_problem:
                    default_idx = str(i)
                    console.print(f"[dim]Last used: {self.last_problem} (press Enter for default)[/dim]")
                    break
        
        # Get choice
        choice = Prompt.ask(
            "Select problem",
            choices=[str(i) for i in range(1, len(problems) + 1)],
            default=default_idx
        )
        
        selected_problem = problems[int(choice) - 1]
        return str(selected_problem), selected_problem.name
    
    def _confirm_selection(self, complexity: str, problem_path: str, problem_name: str) -> bool:
        """Show confirmation of selections."""
        model = "gpt-4.1-nano" if complexity == "simple" else "gpt-4.1"
        
        # Create confirmation panel
        confirm_text = f"""
[bold]Your Selection:[/bold]
  • Complexity: [cyan]{complexity}[/cyan]
  • Model: [yellow]{model}[/yellow]
  • Problem: [green]{problem_name}[/green]
"""
        
        panel = Panel(confirm_text, title="Confirm", border_style="cyan")
        console.print()
        console.print(panel)
        
        return Confirm.ask("\nStart analysis?", default=True)
    
    def _run_analysis(self, complexity: str, problem_path: str):
        """Run the actual analysis."""
        model = "gpt-4.1-nano" if complexity == "simple" else "gpt-4.1"
        
        console.print()
        console.print(f"[bold green]Starting analysis...[/bold green]")
        console.print(f"[dim]Running: ./run {problem_path} -{complexity} -model {model}[/dim]")
        console.print()
        
        # Run the command
        try:
            subprocess.run(
                ["./run", problem_path, f"-{complexity}", "-model", model],
                check=True
            )
        except subprocess.CalledProcessError as e:
            console.print(f"[red]Error running analysis: {e}[/red]")
            sys.exit(1)
    
    def run(self):
        """Main UI loop."""
        try:
            self._display_header()
            
            # Select complexity
            complexity = self._select_complexity()
            
            # Select problem
            problem_path, problem_name = self._select_problem()
            
            # Confirm
            if self._confirm_selection(complexity, problem_path, problem_name):
                # Save preferences
                self._save_preferences(complexity, problem_name)
                
                # Run analysis
                self._run_analysis(complexity, problem_path)
            else:
                console.print("\n[yellow]Analysis cancelled.[/yellow]")
                
        except KeyboardInterrupt:
            console.print("\n\n[yellow]Cancelled by user.[/yellow]")
            sys.exit(0)
        except Exception as e:
            console.print(f"\n[red]Error: {e}[/red]")
            sys.exit(1)


def main():
    """Entry point."""
    ui = TerminalUI()
    ui.run()


if __name__ == "__main__":
    main()