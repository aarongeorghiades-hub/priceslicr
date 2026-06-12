'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ConditionSegment } from '@/lib/conditionSlices'

interface ConditionContextValue {
  segment: ConditionSegment
  setSegment: (s: ConditionSegment) => void
}

const ConditionContext = createContext<ConditionContextValue | null>(null)

/**
 * Holds the selected condition segment for a product page. Initialised to the
 * server-resolved default segment so the client's first render matches the SSR
 * HTML exactly — no hydration mismatch, no layout shift.
 */
export function ConditionProvider({
  defaultSegment,
  children,
}: {
  defaultSegment: ConditionSegment
  children: ReactNode
}) {
  const [segment, setSegment] = useState<ConditionSegment>(defaultSegment)
  return (
    <ConditionContext.Provider value={{ segment, setSegment }}>
      {children}
    </ConditionContext.Provider>
  )
}

export function useCondition(): ConditionContextValue {
  const ctx = useContext(ConditionContext)
  if (!ctx) {
    throw new Error('useCondition must be used within a ConditionProvider')
  }
  return ctx
}
