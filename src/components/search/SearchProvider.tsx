'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SearchProduct } from '@/lib/search'

const SearchIndexContext = createContext<SearchProduct[]>([])

export function SearchProvider({
  products,
  children,
}: {
  products: SearchProduct[]
  children: ReactNode
}) {
  return <SearchIndexContext.Provider value={products}>{children}</SearchIndexContext.Provider>
}

export function useSearchIndex(): SearchProduct[] {
  return useContext(SearchIndexContext)
}
