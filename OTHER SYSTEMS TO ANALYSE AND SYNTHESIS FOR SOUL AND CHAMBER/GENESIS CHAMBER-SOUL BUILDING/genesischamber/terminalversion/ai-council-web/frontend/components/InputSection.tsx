'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface InputSectionProps {
  onSubmit: (problem: string) => void
}

export default function InputSection({ onSubmit }: InputSectionProps) {
  const [problem, setProblem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldHide, setShouldHide] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem.trim() || isSubmitting) return

    setIsSubmitting(true)
    setShouldHide(true)
    
    // Wait for fade animation to complete
    setTimeout(() => {
      onSubmit(problem)
    }, 500)
  }

  return (
    <div className={clsx(
      'max-w-4xl mx-auto px-6 py-16 transition-all duration-500',
      shouldHide && 'animate-fade-out'
    )}>
      <h1 className="text-5xl font-bold text-orange-500 mb-8">
        AI Expert Council Simulator
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="problem" className="block text-lg text-gray-300 mb-3">
            Describe your business problem
          </label>
          <textarea
            id="problem"
            rows={8}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            placeholder="Example: We're a B2B SaaS startup that has achieved product-market fit with $10M ARR. We're struggling with the transition from founder-led sales to building a scalable sales organization. How do we maintain our growth momentum while building the right processes and team?"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={!problem.trim() || isSubmitting}
          className={clsx(
            'px-8 py-3 font-medium rounded-lg transition-all duration-200',
            'border border-orange-500 text-orange-500',
            'hover:bg-orange-500 hover:text-black',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black'
          )}
        >
          {isSubmitting ? 'Starting Debate...' : 'Begin the Debate'}
        </button>
      </form>
    </div>
  )
}