export const labs = [
  {
    slug: 'garden',
    path: '/lab/garden',
    title: 'Garden',
    subtitle: 'ASCII sprinkle garden',
    description: 'Click plants to water them and watch ASCII flowers bloom.',
    accent: 'from-rose-500/25 via-fuchsia-500/10 to-transparent',
  },
  {
    slug: 'glass',
    path: '/lab/glass',
    title: 'Liquid Glass',
    subtitle: 'WebGL refraction lens',
    description: 'Move the lens over generative canvas and tune the optics.',
    accent: 'from-violet-500/25 via-sky-500/10 to-transparent',
  },
  {
    slug: 'wave',
    path: '/lab/wave',
    title: 'Wave Field',
    subtitle: 'Three.js particle sea',
    description: 'Orbit a shimmering wave field built from glowing points.',
    accent: 'from-cyan-500/25 via-blue-500/10 to-transparent',
  },
] as const

export type LabConfig = (typeof labs)[number]
