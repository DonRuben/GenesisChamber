# State Machine — Round & Simulation Management

## Simulation States

```
INITIALIZED → RUNNING → PAUSED_AT_GATE → RUNNING → COMPLETED
                ↓                                      ↓
              FAILED                              OUTPUT_READY
```

## Round States

```
ROUND_STARTING
  → STAGE_1_CREATING (parallel, all participants)
  → STAGE_1_COMPLETE
  → STAGE_2_CRITIQUING (parallel, all participants critique all concepts)
  → STAGE_2_COMPLETE
  → STAGE_3_SYNTHESIZING (moderator + evaluator)
  → STAGE_3_COMPLETE
  → STAGE_4_REFINING (parallel, surviving participants)
  → STAGE_4_COMPLETE
  → STAGE_5_PRESENTING (sequential)
  → STAGE_5_COMPLETE
  → ROUND_COMPLETE
  → [QUALITY_GATE if configured for this round]
  → NEXT_ROUND or SIMULATION_COMPLETE
```

## Concept States

```
DRAFT → SUBMITTED → ANONYMIZED → CRITIQUED → SCORED
  → SURVIVING | ELIMINATED | MERGED
  → REFINED → PRESENTED
  → WINNER | RUNNER_UP | FINALIST
```

## State Schema (JSON)

```json
{
  "simulation": {
    "id": "sim_2026_olivia_001",
    "type": "message_lab",
    "status": "running",
    "created_at": "2026-02-17T14:30:00Z",
    "config": {
      "rounds": 6,
      "participants": ["ogilvy", "hopkins", "burnett", "wells", "halbert"],
      "moderator": "jobs",
      "evaluator": "ive",
      "brief_path": "briefs/olivia-sales.md"
    },
    "current": {
      "round": 2,
      "stage": 3,
      "stage_name": "synthesis"
    },
    "rounds": [
      {
        "number": 1,
        "status": "complete",
        "concepts_created": 15,
        "concepts_surviving": 9,
        "concepts_eliminated": 6,
        "moderator_direction": "...",
        "stages": {
          "1": { "status": "complete", "outputs": [...] },
          "2": { "status": "complete", "outputs": [...] },
          "3": { "status": "complete", "outputs": [...] },
          "4": { "status": "complete", "outputs": [...] },
          "5": { "status": "complete", "outputs": [...] }
        }
      },
      {
        "number": 2,
        "status": "in_progress",
        "stages": { ... }
      }
    ],
    "quality_gates": [
      { "after_round": 3, "status": "pending" },
      { "after_round": 6, "status": "pending" }
    ],
    "concepts": {
      "active": [
        {
          "id": "concept_ogilvy_01",
          "persona": "ogilvy",
          "name": "The Proof Machine",
          "status": "surviving",
          "round_created": 1,
          "scores": { "round_1": 7.8, "round_2": 8.4 },
          "evolution_history": [
            { "round": 1, "version": "v1", "snapshot": "..." },
            { "round": 2, "version": "v2", "changes": "..." }
          ]
        }
      ],
      "eliminated": [ ... ],
      "merged": [ ... ]
    },
    "transcript": {
      "entries": [
        {
          "round": 1,
          "stage": 1,
          "persona": "ogilvy",
          "type": "concept",
          "content": "...",
          "timestamp": "2026-02-17T14:35:00Z"
        }
      ]
    }
  }
}
```

## Resume Capability

The state machine supports full resume from any point:

```python
def resume_simulation(sim_id: str):
    state = store.load_simulation(sim_id)

    if state.status == "paused_at_gate":
        # Wait for user approval
        return "Waiting for quality gate approval"

    if state.current.stage < 5:
        # Resume mid-round
        return continue_round(state)
    else:
        # Start next round
        return start_next_round(state)
```

## Event Log

Every state transition is logged:

```json
{
  "event": "concept_eliminated",
  "sim_id": "sim_2026_olivia_001",
  "round": 2,
  "concept_id": "concept_burnett_02",
  "reason": "Moderator: 'Too safe. We need boldness not warmth here.'",
  "timestamp": "2026-02-17T15:12:00Z"
}
```

This enables full replay and transcript generation.
