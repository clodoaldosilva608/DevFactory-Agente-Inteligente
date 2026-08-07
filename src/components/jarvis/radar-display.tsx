"use client";

import { motion } from "framer-motion";

/**
 * RadarDisplay — central holographic radar with rotating sweep,
 * pulse rings and crosshair. Cyan + red dual color scheme.
 */
export function RadarDisplay({ status }: { status: "active" | "idle" | "alert" }) {
  const color = status === "alert" ? "#ff3333" : status === "active" ? "#00f0ff" : "#5c6b7a";

  return (
    <div className="relative aspect-square w-full max-w-[420px] mx-auto">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: `${color}40` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {/* Tick marks */}
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 origin-bottom"
            style={{
              transform: `rotate(${i * 10}deg)`,
              transformOrigin: "center 200%",
            }}
          >
            <div
              className={`w-px ${i % 9 === 0 ? "h-3" : "h-1.5"}`}
              style={{ background: `${color}${i % 9 === 0 ? "cc" : "55"}` }}
            />
          </div>
        ))}
      </motion.div>

      {/* Middle ring */}
      <div
        className="absolute inset-[12%] rounded-full border"
        style={{ borderColor: `${color}30` }}
      />

      {/* Inner ring */}
      <div
        className="absolute inset-[28%] rounded-full border-2"
        style={{ borderColor: `${color}50` }}
      />

      {/* Pulse rings (expanding) */}
      <div className="absolute inset-[28%] rounded-full">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: color }}
            animate={{
              scale: [1, 2.2],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Center core (red glow) */}
      <motion.div
        className="absolute inset-[42%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, ${color}80 40%, transparent 70%)`,
          filter: "blur(2px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating sweep beam */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute left-1/2 top-1/2 origin-left h-1/2"
          style={{
            width: "50%",
            background: `linear-gradient(to right, ${color}00, ${color}80, ${color}00)`,
            transformOrigin: "0% 50%",
            filter: "blur(1px)",
            opacity: 0.7,
          }}
        />
      </motion.div>

      {/* Crosshair lines */}
      <div
        className="absolute left-0 right-0 top-1/2 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }}
      />
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${color}60, transparent)` }}
      />

      {/* Target dots (random blips) */}
      <Blip angle={35} distance={0.7} color="#39ff14" delay={0.5} />
      <Blip angle={145} distance={0.55} color="#39ff14" delay={1.5} />
      <Blip angle={225} distance={0.8} color={color} delay={2.5} />
      <Blip angle={300} distance={0.65} color="#ffae00" delay={3} />

      {/* Center label */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[60%] text-center">
        <div
          className="font-mono-cyber text-[9px] uppercase tracking-[0.3em]"
          style={{ color }}
        >
          {status === "alert" ? "PROTOCOL: RED" : status === "active" ? "SCANNING" : "STANDBY"}
        </div>
      </div>

      {/* Compass labels */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono-cyber text-[9px] text-slate-500">N</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 font-mono-cyber text-[9px] text-slate-500">E</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono-cyber text-[9px] text-slate-500">S</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 font-mono-cyber text-[9px] text-slate-500">W</div>
    </div>
  );
}

function Blip({
  angle,
  distance,
  color,
  delay,
}: {
  angle: number;
  distance: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: 6,
        height: 6,
        background: color,
        boxShadow: `0 0 10px ${color}`,
        transform: `rotate(${angle}deg) translateX(${distance * 50}%) rotate(-${angle}deg)`,
      }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.5] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 4 }}
    />
  );
}
