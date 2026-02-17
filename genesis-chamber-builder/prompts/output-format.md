# Output Format Templates

## Concept Output (Stage 1)

```
===CONCEPT_START===
PERSONA: {persona_name}
ROUND: {round_number}
NAME: {concept_name}
TAGLINE: {one_line_tagline}
IDEA: {core_idea_2_3_sentences}
HEADLINE: {primary_headline}
SUBHEAD: {supporting_line}
BODY_COPY: {3_5_lines_of_supporting_text}
VISUAL_DIRECTION: {50_100_words_describing_look_and_feel}
COLOR_MOOD: {primary_colors_and_emotional_tone}
TYPOGRAPHY_FEEL: {font_style_description}
RATIONALE: {why_this_works_in_persona_voice}
IMAGE_PROMPT: {detailed_prompt_for_nano_banana_pro}
VIDEO_PROMPT: {scene_description_for_kling_or_veo}
EVOLUTION_NOTES: {what_changed_from_last_round_if_applicable}
===CONCEPT_END===
```

## Critique Output (Stage 2)

```
===CRITIQUE_START===
CRITIC: {persona_name}
CONCEPT: {concept_label_A_B_C}
SCORE: {1_to_10}
STRENGTHS:
- {strength_1}
- {strength_2}
- {strength_3}
WEAKNESSES:
- {weakness_1}
- {weakness_2}
FATAL_FLAW: {the_one_thing_that_could_kill_this_concept_or_NONE}
ONE_CHANGE: {if_you_could_change_one_thing}
WOULD_YOU_CHAMPION_THIS: {yes_no_and_why}
===CRITIQUE_END===
```

## Moderator Direction (Stage 3)

```
===DIRECTION_START===
MODERATOR: {name}
ROUND: {round_number}
SURVIVING:
- {concept_name}: {why_it_survives}
- {concept_name}: {why_it_survives}
ELIMINATED:
- {concept_name}: {why_it_dies}
- {concept_name}: {why_it_dies}
MERGE_OPPORTUNITIES:
- Take {element} from {eliminated_concept} → add to {surviving_concept}
NEW_CONSTRAINTS:
- {constraint_1}
- {constraint_2}
DIRECTION: {paragraph_setting_the_direction_for_next_round}
ONE_MORE_THING: {surprise_requirement_or_NONE}
===DIRECTION_END===
```

## Evaluator Assessment (Stage 3 addition)

```
===EVALUATION_START===
EVALUATOR: {name}
ROUND: {round_number}
PER_CONCEPT:
- {concept_name}:
  INTENTIONALITY: {score_1_10} — {comment}
  CONSIDERATION: {score_1_10} — {comment}
  EMOTIONAL_TRUTH: {score_1_10} — {comment}
  POLISH: {score_1_10} — {comment}
  VERDICT: {ready / needs_work / not_considered}
OVERALL: {paragraph_on_craft_quality_of_this_round}
===EVALUATION_END===
```

## Presentation Output (Stage 5)

```
===PRESENTATION_START===
PERSONA: {persona_name}
ROUND: {round_number}
CONCEPT: {concept_name}
ONE_SENTENCE: {the_entire_concept_in_one_sentence}
EVOLUTION: {what_changed_and_why_2_3_sentences}
FULL_CONCEPT:
  HEADLINE: {final_headline}
  SUBHEAD: {final_subhead}
  HERO_COPY: {4_6_lines}
  VISUAL: {detailed_visual_description}
  USE_CASE_1: {how_this_works_in_scenario_1}
  USE_CASE_2: {how_this_works_in_scenario_2}
WHY_THIS_WINS: {closing_argument_in_persona_voice}
===PRESENTATION_END===
```

## Final Winner Specification

```
===WINNER_START===
CONCEPT_NAME: {name}
ORIGINAL_CREATOR: {persona}
FINAL_VERSION: {round}
WINNING_SCORE: {aggregate}

CORE_MESSAGE:
  HEADLINE: {final}
  SUBHEAD: {final}
  ELEVATOR: {30_second_version}
  TWEET: {280_chars}

VISUAL_SYSTEM:
  PRIMARY_COLORS: {hex_codes}
  SECONDARY_COLORS: {hex_codes}
  TYPOGRAPHY: {font_families_and_usage}
  IMAGERY_STYLE: {description}
  LOGO_DIRECTION: {description}

COPY_SYSTEM:
  HERO: {main_page_copy}
  PROOF_POINTS: {3_5_key_claims}
  CTA_PRIMARY: {main_call_to_action}
  CTA_SECONDARY: {alternative_cta}
  OBJECTION_HANDLERS: {3_common_objections_and_responses}

PRODUCTION_PROMPTS:
  HERO_IMAGE: {nano_banana_prompt}
  SUPPORTING_IMAGE_1: {prompt}
  SUPPORTING_IMAGE_2: {prompt}
  VIDEO_SCENE_1: {kling_prompt}
  VIDEO_SCENE_2: {veo_prompt}
  VIDEO_SCENE_3: {prompt}
  VOICEOVER_SCRIPT: {elevenlabs_text}
  MUSIC_PROMPT: {elevenlabs_music_description}

SLIDE_DECK:
  SLIDE_1: {title_slide_content + image_prompt + video_prompt}
  SLIDE_2: {problem_slide + prompts}
  SLIDE_3: {solution_slide + prompts}
  SLIDE_4: {proof_slide + prompts}
  SLIDE_5: {cta_slide + prompts}
===WINNER_END===
```

## Parsing Notes

All output blocks use `===TAG_START===` and `===TAG_END===` delimiters for reliable regex parsing. Fields use `KEY: value` format on single lines or `KEY:\n  value` for multi-line content.

```python
import re

def parse_concept(text: str) -> dict:
    match = re.search(r'===CONCEPT_START===(.*?)===CONCEPT_END===', text, re.DOTALL)
    if not match:
        return None
    block = match.group(1)
    result = {}
    for line in block.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            result[key.strip()] = value.strip()
    return result
```
