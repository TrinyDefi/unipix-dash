import { useEffect, useState } from "react";
import { audio } from "@/game/audio";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState(audio.getSettings());

  useEffect(() => audio.subscribe(setS), []);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs border-2 border-black bg-[#1a0530] p-5 flex flex-col gap-4"
        style={{ boxShadow: "0 0 0 2px #ff1493, 0 0 24px rgba(255,20,147,.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-glow-pink text-base tracking-widest text-center">SETTINGS</h2>

        <Slider label="MUSIC" value={s.music} onChange={(v) => audio.setMusic(v)} color="#ff1493" />
        <Slider label="SFX" value={s.sfx} onChange={(v) => audio.setSfx(v)} color="#00e5ff" />

        <label className="flex items-center justify-between text-[10px] tracking-widest text-white">
          <span>MUTE ALL</span>
          <input
            type="checkbox"
            checked={s.muted}
            onChange={(e) => audio.setMuted(e.target.checked)}
            className="w-5 h-5 accent-pink-500"
          />
        </label>

        <button className="pixel-btn text-xs mt-2" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

function Slider({
  label, value, onChange, color,
}: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] tracking-widest" style={{ color }}>
        <span>{label}</span>
        <span>{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
