import { LabLayout } from '@/components/LabLayout'
import { GardenCanvas } from '@/labs/garden/GardenCanvas.jsx'

export function GardenLabPage() {
  return (
    <LabLayout
      title="Garden"
      description="Click plants to water them."
      immersive
    >
      <GardenCanvas />
    </LabLayout>
  )
}
