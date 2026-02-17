'use client'

import { DebateTurn } from '@/types/debate'
import { clsx } from 'clsx'

interface ExpertTurnProps {
  turn: DebateTurn
}

export default function ExpertTurn({ turn }: ExpertTurnProps) {
  return (
    <div className="mb-8 animate-fade-in">
      <span className="font-bold text-orange-500">
        {turn.expertName}:
      </span>
      <span className="ml-2 text-gray-300">
        {turn.message}
        {turn.isStreaming && (
          <span className="text-orange-500 animate-pulse-subtle ml-0.5">|</span>
        )}
      </span>
    </div>
  )
}