import { LabLayout } from '@/components/LabLayout'
import { WaveField } from '@/labs/wave/WaveField'

export function WaveLabPage() {
  return (
    <LabLayout
      title="Wave Field"
      description="Drag to orbit the particle sea."
      immersive
    >
      <WaveField />
    </LabLayout>
  )
}
