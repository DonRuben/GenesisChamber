'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InputSection from '@/components/InputSection'
import ExpertSelector from '@/components/ExpertSelector'
import DebateTranscript from '@/components/DebateTranscript'

type AppPhase = 'input' | 'selecting' | 'debate'

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [debateId, setDebateId] = useState<string | null>(null)
  const [problem, setProblem] = useState('')
  const router = useRouter()

  const handleStartDebate = async (problemText: string) => {
    // Store the problem and transition to expert selection
    setProblem(problemText)
    setPhase('selecting')
  }

  const handleExpertSelectionComplete = async () => {
    try {
      // Now call the API to actually start the debate
      const response = await fetch('http://localhost:8000/api/start-debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem }),
      })

      if (!response.ok) {
        throw new Error('Failed to start debate')
      }

      const data = await response.json()
      setDebateId(data.debate_id)
      setPhase('debate')
    } catch (error) {
      console.error('Error starting debate:', error)
      alert('Failed to start debate. Please ensure the backend server is running on http://localhost:8000')
      setPhase('input') // Go back to input on error
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {phase === 'input' && (
        <InputSection onSubmit={handleStartDebate} />
      )}
      
      {phase === 'selecting' && (
        <ExpertSelector onComplete={handleExpertSelectionComplete} />
      )}
      
      {phase === 'debate' && debateId && (
        <DebateTranscript debateId={debateId} problem={problem} />
      )}
    </main>
  )
}