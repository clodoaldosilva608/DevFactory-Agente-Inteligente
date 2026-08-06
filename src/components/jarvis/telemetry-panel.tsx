"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, MemoryStick, Gauge, Thermometer, Activity, Wifi } from "lucide-react";

type Metric = {
  icon: typeof Cpu;
  label: string;
  unit: string;
  value: number;
  max: number;
  color: string;
};

const initialMetrics: Metric[] = [
  { icon: Cpu, label: "CPU", unit: "%", value: 24, max: 100, color: "#00f0ff" },
  { icon: MemoryStick, label: "RAM", unit: "MB/s", value: 205, max: 500, color: "#39ff14" },
  { icon: Gauge, label: "GPU", unit: "%", value: 18, max: 100, color: "#b400ff" },
  { icon: Thermometer, label: "TEMP", unit: "°C", value: 47, max: 90, color: "#ffae00" },
  { icon: Activity, label: "LATÊNCIA", unit: "ms", value: 32, max: 200, color: "#00f0ff" },
  { icon: Wifi, label: "REDE", unit: "Mbps", value: 154, max: 1000, color: "#39ff14" },
];

export function TelemetryPanel() {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.5) * (m.max * 0.08);
          let newValue = Math.max(0, Math.min(m.max, m.value + delta));
          // round
          newValue = newValue < 10 ? Math.round(newValue * 10) / 10 : Math.round(newValue);
          return { ...m, value: newValue };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
            Telemetria
          </span>
        </div>
        <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-green-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-2.5">
        {metrics.map((m, idx) => {
          const pct = (m.value / m.max) * 100;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono-cyber">
                <span className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider">
                  <m.icon className="h-3 w-3" style={{ color: m.color }} />
                  {m.label}
                </span>
                <span className="font-bold" style={{ color: m.color }}>
                  {m.value}
                  <span className="text-slate-500 ml-1 font-normal">{m.unit}</span>
                </span>
              </div>
              <div className="relative h-1.5 bg-cyan-500/5 overflow-hidden clip-cyber-sm">
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{
                    background: `linear-gradient(to right, ${m.color}80, ${m.color})`,
                    boxShadow: `0 0 8px ${m.color}80`,
                  }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                {/* Animated data flow */}
                <div
                  className="absolute inset-y-0 w-12 animate-data-flow opacity-50"
                  style={{
                    background: `linear-gradient(to right, transparent, ${m.color}80, transparent)`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status grid */}
      <div className="mt-3 pt-3 border-t border-cyan-500/20 grid grid-cols-2 gap-2">
        <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
          <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">
            Sistema
          </div>
          <div className="font-mono-cyber text-xs text-green-400 font-bold mt-0.5">
            ATIVO
          </div>
        </div>
        <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
          <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">
            WhatsApp
          </div>
          <div className="font-mono-cyber text-xs text-cyan-400 font-bold mt-0.5">
            3 CONTAS
          </div>
        </div>
        <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
          <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">
            Microfone
          </div>
          <div className="font-mono-cyber text-xs text-red-400 font-bold mt-0.5">
            MUTE
          </div>
        </div>
        <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
          <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">
            Uptime
          </div>
          <div className="font-mono-cyber text-xs text-cyan-400 font-bold mt-0.5">
            14:32:08
          </div>
        </div>
      </div>
    </div>
  );
}
