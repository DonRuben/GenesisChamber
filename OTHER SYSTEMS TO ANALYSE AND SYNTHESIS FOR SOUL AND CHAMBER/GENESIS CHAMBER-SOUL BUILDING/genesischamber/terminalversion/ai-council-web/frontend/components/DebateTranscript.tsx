'use client'

import { useEffect, useRef, useState } from 'react'
import { DebateWebSocket } from '@/lib/websocket'
import { DebateTurn, WebSocketMessage, FinalAnalysis } from '@/types/debate'
import ExpertTurn from './ExpertTurn'
import FinalAnalysisComponent from './FinalAnalysis'

interface DebateTranscriptProps {
  debateId: string
  problem: string
}

export default function DebateTranscript({ debateId, problem }: DebateTranscriptProps) {
  const [turns, setTurns] = useState<DebateTurn[]>([])
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<DebateWebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns, finalAnalysis])

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage) => {
      switch (message.type) {
        case 'expert_turn':
          if (message.expert_name && message.turn_number) {
            setTurns(prev => [...prev, {
              id: `turn-${message.turn_number}`,
              expertName: message.expert_name!,
              message: '',
              isStreaming: true,
              turnNumber: message.turn_number!
            }])
          }
          break

        case 'text_chunk':
          if (message.text && message.turn_number) {
            setTurns(prev => prev.map(turn => 
              turn.turnNumber === message.turn_number
                ? { 
                    ...turn, 
                    message: turn.message + message.text!,
                    isStreaming: !message.is_final
                  }
                : turn
            ))
          }
          break

        case 'debate_complete':
          setIsComplete(true)
          break

        case 'final_analysis':
          if (message.analysis) {
            setFinalAnalysis(message.analysis)
          }
          break
      }
    }

    // Initialize WebSocket connection
    wsRef.current = new DebateWebSocket(
      debateId,
      handleMessage,
      (error) => console.warn('WebSocket error - ensure backend is running'),
      () => console.log('WebSocket connection closed'),
      (connected) => setIsConnected(connected)
    )

    wsRef.current.connect()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [debateId])

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">
              ⚠️ Connecting to debate server... Make sure the backend is running on port 8000
            </p>
          </div>
        )}
        
        {/* Problem Statement */}
        <div className="mb-12 pb-8 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Business Problem</h2>
          <p className="text-gray-300">{problem}</p>
        </div>

        {/* Live Transcript */}
        <div 
          ref={scrollRef}
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-4"
        >
          <h2 className="text-2xl font-bold text-orange-500 mb-6">Expert Council Discussion</h2>
          
          {turns.map(turn => (
            <ExpertTurn key={turn.id} turn={turn} />
          ))}

          {isComplete && !finalAnalysis && (
            <div className="text-center py-8">
              <p className="text-gray-500 animate-pulse">Generating final analysis...</p>
            </div>
          )}

          {finalAnalysis && (
            <FinalAnalysisComponent analysis={finalAnalysis} />
          )}
        </div>
      </div>
    </div>
  )
}