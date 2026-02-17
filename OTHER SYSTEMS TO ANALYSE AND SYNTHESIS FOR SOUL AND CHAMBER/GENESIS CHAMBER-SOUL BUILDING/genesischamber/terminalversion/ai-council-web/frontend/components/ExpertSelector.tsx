'use client'

import { useState, useEffect, useRef } from 'react'
import { loadExpertPhotos, slotToDebateExpertMap, ExpertPhoto } from '@/lib/expertPhotos'
import { clsx } from 'clsx'

interface ExpertSelectorProps {
  onComplete: () => void
}

interface SlotColumn {
  id: number
  currentIndex: number
  isSpinning: boolean
  isStopped: boolean
  finalIndex: number
}

export default function ExpertSelector({ onComplete }: ExpertSelectorProps) {
  const [experts, setExperts] = useState<ExpertPhoto[]>([])
  const [slots, setSlots] = useState<SlotColumn[]>([])
  const [allStopped, setAllStopped] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRefs = useRef<Record<number, NodeJS.Timeout>>({})
  const spinSpeed = useRef(80) // Faster for smoother animation

  // Load expert photos on mount
  useEffect(() => {
    loadExpertPhotos().then(loadedExperts => {
      setExperts(loadedExperts)
      
      // Initialize slots based on number of experts (max 5 for debate)
      const numSlots = Math.min(5, loadedExperts.length)
      const initialSlots: SlotColumn[] = []
      
      for (let i = 0; i < numSlots; i++) {
        initialSlots.push({
          id: i,
          currentIndex: Math.floor(Math.random() * loadedExperts.length),
          isSpinning: true,
          isStopped: false,
          finalIndex: Math.floor(Math.random() * loadedExperts.length)
        })
      }
      
      setSlots(initialSlots)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (isLoading || slots.length === 0) return

    // Small delay to ensure smooth transition
    const readyTimer = setTimeout(() => setIsReady(true), 100)
    
    // Start spinning all slots
    const startSpinning = () => {
      slots.forEach(slot => {
        intervalRefs.current[slot.id] = setInterval(() => {
          setSlots(prev => prev.map(s => 
            s.id === slot.id && s.isSpinning
              ? { ...s, currentIndex: (s.currentIndex + 1) % experts.length }
              : s
          ))
        }, spinSpeed.current)
      })
    }

    const spinTimer = setTimeout(startSpinning, 300)

    // Stop slots one by one
    const stopTimers = slots.map((slot, index) => 
      setTimeout(() => stopSlot(slot.id), 2000 + (index * 400))
    )

    // Complete animation
    const completeTimer = setTimeout(() => {
      setAllStopped(true)
      setTimeout(onComplete, 1000)
    }, 2000 + (slots.length * 400) + 1000)

    return () => {
      // Cleanup
      clearTimeout(readyTimer)
      clearTimeout(spinTimer)
      Object.values(intervalRefs.current).forEach(clearInterval)
      stopTimers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [isLoading, slots.length, experts.length, onComplete])

  const stopSlot = (slotId: number) => {
    // Clear the spinning interval
    if (intervalRefs.current[slotId]) {
      clearInterval(intervalRefs.current[slotId])
      delete intervalRefs.current[slotId]
    }

    // Gradually slow down before stopping
    let currentSpeed = 80
    const slowDownInterval = setInterval(() => {
      currentSpeed += 40
      
      setSlots(prev => {
        const slot = prev.find(s => s.id === slotId)
        if (!slot) return prev
        
        const newIndex = (slot.currentIndex + 1) % experts.length
        
        // Check if we should stop
        if (currentSpeed > 300 && newIndex === slot.finalIndex) {
          clearInterval(slowDownInterval)
          return prev.map(s => 
            s.id === slotId 
              ? { ...s, currentIndex: slot.finalIndex, isSpinning: false, isStopped: true }
              : s
          )
        }
        
        return prev.map(s => 
          s.id === slotId 
            ? { ...s, currentIndex: newIndex }
            : s
        )
      })
    }, currentSpeed)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading expert panel...</p>
      </div>
    )
  }

  // Calculate dynamic slot width based on number of slots
  const slotWidth = slots.length <= 3 ? 'w-48' : slots.length <= 4 ? 'w-40' : 'w-36'
  const slotHeight = slots.length <= 3 ? 'h-56' : slots.length <= 4 ? 'h-48' : 'h-44'
  const imageSize = slots.length <= 3 ? 'w-40 h-40' : slots.length <= 4 ? 'w-32 h-32' : 'w-28 h-28'

  return (
    <div className={clsx(
      "min-h-screen bg-black flex items-center justify-center px-6 transition-opacity duration-500",
      isReady ? 'opacity-100' : 'opacity-0'
    )}>
      <div className="max-w-7xl w-full">
        <h2 className="text-4xl font-bold text-orange-500 text-center mb-16">
          Assembling Expert Council
        </h2>
        
        <div className="flex justify-center gap-6">
          {slots.map(slot => {
            const currentExpert = experts[slot.currentIndex]
            
            return (
              <div key={slot.id} className="relative">
                {/* Slot machine column */}
                <div className={clsx(
                  slotWidth,
                  slotHeight,
                  'bg-gradient-to-b from-gray-950 to-gray-900 rounded-xl border-2 overflow-hidden relative transition-all duration-500',
                  slot.isStopped 
                    ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)]' 
                    : 'border-gray-800'
                )}>
                  {/* Photo display */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {currentExpert && (
                      <div className="relative">
                        <img
                          src={currentExpert.photoUrl}
                          alt={currentExpert.name}
                          className={clsx(
                            imageSize,
                            'rounded-lg object-cover transition-all duration-200',
                            slot.isSpinning ? 'blur-md scale-95' : 'blur-0 scale-100'
                          )}
                          onError={(e) => {
                            // Fallback to placeholder if image fails
                            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23374151"><rect width="200" height="200" fill="%23111827"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23f97316" font-family="sans-serif" font-size="48">${currentExpert.name.charAt(0)}</text></svg>`
                          }}
                        />
                        {/* Spinning effect overlay */}
                        {slot.isSpinning && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Gradient overlays for depth */}
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gray-950 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
                </div>
                
                {/* Expert info when stopped */}
                {slot.isStopped && slot.id < 5 && (
                  <div className="mt-4 text-center animate-fade-in">
                    <p className="text-orange-500 font-semibold text-lg">
                      {slotToDebateExpertMap[slot.id].name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {slotToDebateExpertMap[slot.id].title}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {allStopped && (
          <div className="mt-16 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <p>Expert council ready. Initiating debate...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}