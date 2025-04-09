"use client"

import { ReactNode, useEffect, useState } from "react"
import { motion, useAnimation, Variants } from "framer-motion"
import { useInView } from "react-intersection-observer"

type AnimationDirection =
  | "from-bottom"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "zoom"

interface ScrollAnimationProps {
  children: ReactNode
  direction?: AnimationDirection
  delay?: number
  duration?: number
  once?: boolean
  className?: string
  viewport?: { once?: boolean; amount?: number }
}

// Animation variants based on direction
const variants: Record<AnimationDirection, Variants> = {
  "from-bottom": {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  "from-top": {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  "from-left": {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  "from-right": {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  zoom: {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  }
}

export function ScrollAnimation({
  children,
  direction = "from-bottom",
  delay = 0,
  duration = 0.5,
  once = true,
  className = "",
  viewport = { once: true, amount: 0.3 }
}: ScrollAnimationProps) {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: viewport.once,
    threshold: viewport.amount
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else if (!viewport.once) {
      controls.start("hidden")
    }
  }, [controls, inView, viewport.once])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[direction]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0] // Improved easing function
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
