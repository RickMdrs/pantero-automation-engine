"use client"

import { useEffect, useState } from "react"

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  glowColor: string
  label: string
  value: string
  sublabel?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  glowColor,
  label,
  value,
  sublabel,
}: ProgressRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedPercentage / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsla(260, 15%, 20%, 0.4)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {sublabel && (
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
