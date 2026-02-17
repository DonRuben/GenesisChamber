"""
Markdown formatter for debate results.
Creates structured reports from debate data.
"""

from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List


class MarkdownFormatter:
    """Formats debate results as markdown documents."""
    
    def __init__(self, output_dir: str = "outputs"):
        """Initialize formatter.
        
        Args:
            output_dir: Directory for output files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def format_report(self, results: Dict[str, Any], problem_title: str = "Business Analysis") -> str:
        """Format complete debate results as markdown.
        
        Args:
            results: Debate results from orchestrator
            problem_title: Title for the report
            
        Returns:
            Formatted markdown string
        """
        metadata = results.get('metadata', {})
        summary = results.get('summary', {})
        transcript = results.get('transcript', [])
        
        # Build markdown
        md_lines = [
            f"# AI Expert Council Report - {problem_title}",
            "",
            f"**Date**: {metadata.get('start_time', datetime.now()).strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Experts**: {', '.join(metadata.get('experts', []))}",
            f"**Rounds**: {metadata.get('rounds', 0)}",
            "",
            "---",
            "",
            "## Executive Summary",
            "",
            self._clean_executive_summary(summary.get('executive_summary', 'No summary available.')),
            "",
            "## Key Insights",
            "",
            self._format_insights(summary.get('key_insights', {})),
            "",
            "## Pros and Cons Analysis",
            "",
            self._format_pros_cons(summary.get('pros_cons', [])),
            "",
            "## Recommended Actions",
            "",
            self._format_actions(summary.get('action_items', [])),
            "",
            "## Risk Analysis",
            "",
            self._format_risks(summary.get('risks', [])),
            "",
            "---",
            "",
            "## Full Transcript",
            "",
            self._format_transcript(transcript),
            "",
            "---",
            "",
            f"*Report generated on {datetime.now().strftime('%Y-%m-%d at %H:%M:%S')}*"
        ]
        
        return "\n".join(md_lines)
    
    def _clean_executive_summary(self, summary: str) -> str:
        """Clean executive summary to remove duplicate headers."""
        if "**Executive Summary**" in summary:
            # Remove the duplicate header
            lines = summary.split('\n')
            cleaned_lines = []
            for i, line in enumerate(lines):
                if "**Executive Summary**" in line:
                    # Skip this line and potentially the next empty line
                    continue
                cleaned_lines.append(line)
            return '\n'.join(cleaned_lines).strip()
        return summary
    
    def save_report(
        self,
        results: Dict[str, Any],
        problem_title: str = "Business Analysis",
        filename: str = None
    ) -> Path:
        """Save formatted report to file.
        
        Args:
            results: Debate results
            problem_title: Title for the report
            filename: Optional specific filename
            
        Returns:
            Path to saved file
        """
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"debate_report_{timestamp}.md"
        
        # Format and save
        report = self.format_report(results, problem_title)
        file_path = self.output_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return file_path
    
    def _format_insights(self, insights: Dict[str, Any]) -> str:
        """Format key insights section."""
        if 'raw' in insights:
            return insights['raw']
        
        # Structured format if available
        lines = []
        if 'agreements' in insights:
            lines.append("### Points of Agreement")
            for point in insights['agreements']:
                lines.append(f"- {point}")
            lines.append("")
        
        if 'contentions' in insights:
            lines.append("### Points of Contention")
            for point in insights['contentions']:
                lines.append(f"- {point}")
        
        return "\n".join(lines) if lines else "No structured insights available."
    
    def _format_pros_cons(self, pros_cons: List[Dict[str, str]]) -> str:
        """Format pros and cons table."""
        if not pros_cons:
            return "No pros/cons analysis available."
        
        # If raw format, clean it up to avoid duplication
        if len(pros_cons) == 1 and 'raw' in pros_cons[0]:
            raw_content = pros_cons[0]['raw']
            # Remove any duplicate headers or executive summary references
            if "Executive Summary" in raw_content or "executive-ready" in raw_content.lower():
                # Extract just the pros/cons content
                lines = raw_content.split('\n')
                cleaned_lines = []
                skip_next = False
                for line in lines:
                    if "Executive Summary" in line or "executive-ready" in line.lower():
                        skip_next = True
                        continue
                    if skip_next and line.strip() == "":
                        skip_next = False
                        continue
                    if not skip_next:
                        cleaned_lines.append(line)
                return '\n'.join(cleaned_lines).strip()
            return raw_content
        
        # Table format
        lines = [
            "| Aspect | Pros | Cons |",
            "|--------|------|------|"
        ]
        
        for item in pros_cons:
            aspect = item.get('aspect', 'Unknown')
            pros = item.get('pros', 'N/A')
            cons = item.get('cons', 'N/A')
            lines.append(f"| {aspect} | {pros} | {cons} |")
        
        return "\n".join(lines)
    
    def _format_actions(self, actions: List[Dict[str, str]]) -> str:
        """Format action items."""
        if not actions:
            return "No action items available."
        
        if len(actions) == 1 and 'raw' in actions[0]:
            return actions[0]['raw']
        
        lines = []
        for action in actions:
            timeframe = action.get('timeframe', 'Unspecified')
            description = action.get('description', 'No description')
            lines.append(f"**{timeframe}**: {description}")
        
        return "\n".join(lines)
    
    def _format_risks(self, risks: List[Dict[str, str]]) -> str:
        """Format risk analysis."""
        if not risks:
            return "No risk analysis available."
        
        if len(risks) == 1 and 'raw' in risks[0]:
            return risks[0]['raw']
        
        lines = []
        for i, risk in enumerate(risks, 1):
            risk_desc = risk.get('risk', 'Unknown risk')
            impact = risk.get('impact', 'Unknown impact')
            mitigation = risk.get('mitigation', 'No mitigation specified')
            
            lines.extend([
                f"### Risk {i}: {risk_desc}",
                f"**Impact**: {impact}",
                f"**Mitigation**: {mitigation}",
                ""
            ])
        
        return "\n".join(lines)
    
    def _format_transcript(self, transcript: List[Dict[str, Any]]) -> str:
        """Format conversation transcript."""
        if not transcript:
            return "No transcript available."
        
        lines = []
        current_round = 0
        
        for entry in transcript:
            round_num = entry.get('round', 0)
            
            # Add round header if new round
            if round_num > current_round:
                current_round = round_num
                lines.extend([
                    "",
                    f"### Round {round_num}",
                    ""
                ])
            
            speaker = entry.get('speaker', 'Unknown')
            content = entry.get('content', '')
            
            lines.extend([
                f"**{speaker}**:",
                "",
                content,
                ""
            ])
        
        return "\n".join(lines)