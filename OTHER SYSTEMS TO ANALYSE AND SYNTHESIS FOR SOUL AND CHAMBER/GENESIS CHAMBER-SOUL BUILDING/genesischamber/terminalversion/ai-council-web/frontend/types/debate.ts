export interface Expert {
  name: string
  title: string
}

export interface DebateTurn {
  id: string
  expertName: string
  message: string
  isStreaming: boolean
  turnNumber: number
}

export interface WebSocketMessage {
  type: 'expert_turn' | 'text_chunk' | 'debate_complete' | 'final_analysis'
  expert_name?: string
  turn_number?: number
  text?: string
  is_final?: boolean
  analysis?: FinalAnalysis
}

export interface FinalAnalysis {
  executive_summary: string
  key_insights: string[]
  action_items: string[]
}

export interface DebateState {
  id: string
  problem: string
  turns: DebateTurn[]
  isActive: boolean
  isComplete: boolean
  finalAnalysis: FinalAnalysis | null
}