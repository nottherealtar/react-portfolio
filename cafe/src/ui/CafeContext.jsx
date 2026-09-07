import { createContext, useContext, useMemo, useState } from 'react'
import { stations } from '../content'

const CafeContext = createContext(null)

export function CafeProvider({ children }) {
  const [station, setStation] = useState('hero')
  const [hovered, setHovered] = useState(null)
  const value = useMemo(
    () => ({
      station,
      setStation,
      hovered,
      setHovered,
      index: Math.max(0, stations.findIndex((item) => item.id === station)),
    }),
    [station, hovered],
  )
  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>
}

export function useCafe() {
  const ctx = useContext(CafeContext)
  if (!ctx) throw new Error('useCafe must be used inside CafeProvider')
  return ctx
}
