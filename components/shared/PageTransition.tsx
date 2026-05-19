"use client"

import { useEffect, useRef } from "react"

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ref.current?.classList.add("page-transition--visible")
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  )
}

export default PageTransition