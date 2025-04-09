"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  )
}
