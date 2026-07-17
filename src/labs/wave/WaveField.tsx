import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { cn } from '@/lib/utils'

/** Garden accent — matches plant pink */
const GARDEN_ROSE = 0xfd6b94

export type WaveFieldProps = {
  /** Lower particle count, no orbit, pointer-events none */
  ambient?: boolean
  /** Stop the animation loop */
  paused?: boolean
  className?: string
}

export function WaveField({
  ambient = false,
  paused = false,
  className,
}: WaveFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const amountX = ambient ? 20 : 50
    const amountY = ambient ? 20 : 50
    const separation = ambient ? 120 : 100
    const total = amountX * amountY

    const positions = new Float32Array(total * 3)
    const scales = new Float32Array(total)
    const intensities = new Float32Array(total)
    let i = 0
    let p = 0
    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        positions[i] = ix * separation - (amountX * separation) / 2
        positions[i + 1] = 0
        positions[i + 2] = iy * separation - (amountY * separation) / 2
        scales[p] = ambient ? 5 : 8
        intensities[p] = ambient ? 0.35 : 0.6
        i += 3
        p += 1
      }
    }

    const scene = new THREE.Scene()
    scene.background = ambient ? null : new THREE.Color(0x15161a)

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      10000,
    )
    camera.position.set(0, ambient ? 520 : 400, ambient ? 1500 : 1200)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: !ambient,
      alpha: true,
      powerPreference: ambient ? 'low-power' : 'default',
    })
    renderer.setClearColor(0x000000, ambient ? 0 : 1)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ambient ? 1.25 : 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = ambient ? 0.65 : 1
    renderer.domElement.style.cssText =
      'display:block;width:100%;height:100%;touch-action:none;'
    mount.appendChild(renderer.domElement)

    requestAnimationFrame(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w > 0 && h > 0) {
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
    })

    let controls: OrbitControls | undefined
    if (!ambient) {
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.target.set(0, 0, 0)
    }

    scene.add(
      new THREE.HemisphereLight(
        ambient ? 0xffc0d4 : 0xb7c8ff,
        0x2a2532,
        ambient ? 0.12 : 0.25,
      ),
    )
    scene.add(new THREE.AmbientLight(0xffffff, ambient ? 0.06 : 0.12))

    const sun = new THREE.DirectionalLight(
      ambient ? 0xffe0ea : 0xfff2de,
      ambient ? 0.55 : 1.6,
    )
    sun.position.set(8, 12, 7)
    scene.add(sun)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute(
      'intensity',
      new THREE.BufferAttribute(intensities, 1),
    )

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: {
          value: new THREE.Color(ambient ? GARDEN_ROSE : 0x66ccff),
        },
        uOpacity: { value: ambient ? 0.42 : 1 },
      },
      vertexShader: `
        attribute float scale;
        attribute float intensity;
        varying float vIntensity;
        void main() {
          vIntensity = intensity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform float uOpacity;
        varying float vIntensity;
        void main() {
          vec2 c = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(c, c);
          if (r2 > 1.0) discard;
          vec3 color = uBaseColor * vIntensity;
          float alpha = (1.0 - r2) * (0.25 + vIntensity * 0.55) * uOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      // Normal blending — additive cyan was punching through the music column
      blending: ambient ? THREE.NormalBlending : THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let waveCount = 0
    let rafId = 0

    const renderFrame = () => {
      rafId = requestAnimationFrame(renderFrame)
      if (pausedRef.current) return

      const pos = geometry.attributes.position.array as Float32Array
      const scl = geometry.attributes.scale.array as Float32Array
      const ints = geometry.attributes.intensity.array as Float32Array
      let ptr = 0
      let idx = 0
      const amp = ambient ? 0.4 : 1
      for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
          const phase = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453
          const rand = phase - Math.floor(phase)
          const wave =
            (Math.sin((ix + waveCount * 1.05) * 0.16 + rand * 1) * 72 +
              Math.sin((iy + waveCount * 0.9) * 0.23 + rand * 2.3) * 42 +
              Math.sin((ix + iy + waveCount * 0.35) * 0.08) * 20) *
            amp
          pos[ptr + 1] = wave
          const t = THREE.MathUtils.clamp((wave + 140) / 280, 0, 1)
          scl[idx] = THREE.MathUtils.lerp(
            ambient ? 12 : 28,
            ambient ? 22 : 42,
            t,
          )
          ints[idx] = THREE.MathUtils.lerp(
            ambient ? 0.3 : 0.65,
            ambient ? 0.75 : 1.85,
            t,
          )
          ptr += 3
          idx += 1
        }
      }
      geometry.attributes.position.needsUpdate = true
      geometry.attributes.scale.needsUpdate = true
      geometry.attributes.intensity.needsUpdate = true
      waveCount += ambient ? 0.07 : 0.2
      controls?.update()
      renderer.render(scene, camera)
    }
    renderFrame()

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      controls?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [ambient])

  return (
    <div
      ref={mountRef}
      className={cn(
        'absolute inset-0 h-full w-full overflow-hidden',
        ambient && 'pointer-events-none',
        className,
      )}
    />
  )
}
