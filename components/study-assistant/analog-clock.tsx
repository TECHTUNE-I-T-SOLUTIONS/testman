"use client"

interface AnalogClockProps {
  timeRemaining: number // in seconds
  size?: number
  className?: string
}

export function AnalogClock({ timeRemaining, size = 120, className = "" }: AnalogClockProps) {
  // Calculate clock hands based on remaining time
  const totalSeconds = timeRemaining
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // Convert to clock angles (12-hour format)
  const hourAngle = ((hours % 12) + minutes / 60) * 30 // 30 degrees per hour
  const minuteAngle = minutes * 6 // 6 degrees per minute
  const secondAngle = seconds * 6 // 6 degrees per second

  // Format digital time
  const formatDigitalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Determine color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining < 300) return "text-red-500" // Less than 5 minutes
    if (timeRemaining < 600) return "text-orange-500" // Less than 10 minutes
    return "text-gray-900 dark:text-white"
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Analog Clock */}
      <div 
        className="relative rounded-full border-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl"
        style={{ width: size, height: size }}
      >
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full">
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30
            const markerSize = i % 3 === 0 ? 3 : 2
            const markerLength = i % 3 === 0 ? 8 : 6
            const x = size / 2 + (size / 2 - markerLength - 4) * Math.cos((angle - 90) * Math.PI / 180)
            const y = size / 2 + (size / 2 - markerLength - 4) * Math.sin((angle - 90) * Math.PI / 180)
            
            return (
              <div
                key={i}
                className="absolute bg-gray-600 dark:bg-gray-400 rounded-full"
                style={{
                  width: markerSize,
                  height: markerLength,
                  left: x - markerSize / 2,
                  top: y - markerLength / 2,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: `${markerSize / 2}px ${markerLength / 2}px`
                }}
              />
            )
          })}

          {/* Hour hand */}
          <div
            className="absolute bg-gray-800 dark:bg-gray-200 rounded-full origin-bottom transition-transform duration-1000 ease-out"
            style={{
              width: 4,
              height: size * 0.25,
              left: size / 2 - 2,
              top: size / 2 - size * 0.25,
              transform: `rotate(${hourAngle}deg)`,
              transformOrigin: "2px 100%"
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute bg-gray-600 dark:bg-gray-300 rounded-full origin-bottom transition-transform duration-1000 ease-out"
            style={{
              width: 3,
              height: size * 0.35,
              left: size / 2 - 1.5,
              top: size / 2 - size * 0.35,
              transform: `rotate(${minuteAngle}deg)`,
              transformOrigin: "1.5px 100%"
            }}
          />

          {/* Second hand */}
          <div
            className={`absolute rounded-full origin-bottom transition-transform duration-1000 ease-out ${getTimeColor()}`}
            style={{
              width: 2,
              height: size * 0.4,
              left: size / 2 - 1,
              top: size / 2 - size * 0.4,
              transform: `rotate(${secondAngle}deg)`,
              transformOrigin: "1px 100%",
              backgroundColor: timeRemaining < 300 ? "#ef4444" : timeRemaining < 600 ? "#f97316" : "#6b7280"
            }}
          />

          {/* Center dot */}
          <div className="absolute w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full shadow-md" 
               style={{ left: size / 2 - 6, top: size / 2 - 6 }} />
        </div>
      </div>

      {/* Digital Time */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</div>
        <div className={`text-xl font-mono font-bold ${getTimeColor()}`}>
          {formatDigitalTime(timeRemaining)}
        </div>
      </div>
    </div>
  )
} 