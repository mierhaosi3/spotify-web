declare module '@/labs/garden/GardenCanvas.jsx' {
  import type { FC } from 'react'

  export type ClearZone = {
    left: number
    right: number
    bottom: number
    top: number
  }

  export const GardenCanvas: FC<{
    clearZone?: ClearZone | null
    plantCount?: number
  }>
}
