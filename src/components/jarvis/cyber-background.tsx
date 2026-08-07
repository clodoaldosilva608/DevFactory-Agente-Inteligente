"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * CyberBackground — animated cyberpunk backdrop
 * - Grid overlay
 * - Floating particles
 * - Scan line
 * - Vignette
 */
export function CyberBackground() {
  const [particles] = useState<
    { id: number; left: number; size: number; delay: number; duration: number; drift: number }[]
  >(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 60,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base radial gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.08) 0%, transparent 45%)," +
            "radial-gradient(circle at 80% 70%, rgba(255, 51, 51, 0.06) 0%, transparent 45%)," +
            "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: "0 0 6px rgba(0, 240, 255, 0.8)",
          }}
          animate={{
            y: [0, -1100],
            opacity: [0, 1, 1, 0],
            x: [0, p.drift],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Slow scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.7), transparent)",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
        }}
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5, 8, 17, 0.9) 100%)",
        }}
      />
    </div>
  );
}
