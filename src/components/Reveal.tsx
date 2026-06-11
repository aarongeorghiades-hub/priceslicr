'use client'

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  createElement,
  type ElementType,
  type ReactNode,
} from 'react'

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface RevealProps {
  children: ReactNode
  delay?: number
  as?: ElementType
  className?: string
}

/**
 * Scroll-reveal wrapper. The server renders children fully visible (no opacity-0
 * in the SSR HTML — safe for SEO and no-JS). On the client, before paint, we apply
 * the hidden state, then an IntersectionObserver reveals it once. Reduced-motion
 * skips the whole thing.
 */
export default function Reveal({ children, delay = 0, as = 'div', className = '' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle')

  // Runs before paint on the client only. SSR keeps 'idle' → visible.
  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    setState(reduce ? 'shown' : 'hidden')
  }, [])

  useEffect(() => {
    if (state !== 'hidden') return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('shown')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [state])

  const stateClass = state === 'hidden' ? 'reveal-hidden' : state === 'shown' ? 'reveal-shown' : ''
  const cls = [className, stateClass].filter(Boolean).join(' ')

  return createElement(
    as,
    {
      ref,
      className: cls,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  )
}
