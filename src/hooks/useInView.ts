import { useEffect, useRef, useState } from 'react'

type Options = {
  threshold?: number | number[]
  rootMargin?: string
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: Options = {},
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      {
        threshold: options.threshold ?? 0.35,
        rootMargin: options.rootMargin ?? '0px',
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return { ref, inView }
}
