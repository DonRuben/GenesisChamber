'use client'

import { use } from 'react'
import DebateTranscript from '@/components/DebateTranscript'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DebatePage({ params }: PageProps) {
  const { id } = use(params)
  
  // In a real app, you'd fetch the problem text from the backend
  const problem = "Business problem details would be fetched from the backend based on debate ID"

  return (
    <main className="min-h-screen bg-black">
      <DebateTranscript debateId={id} problem={problem} />
    </main>
  )
}