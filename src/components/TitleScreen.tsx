import { useState } from "react";
import { SKINS, PixelUnicornBadge } from "./PixelUnicornBadge";

type Props = {
  onPlay: (skin: string) => void;
  best: number;
};

export function TitleScreen({ onPlay, best }: Props) {
  const [skin, setSkin] = useState(() => {
    try { return localStorage.getItem("unipix_skin") || "pink"; } catch { return "pink"; }
  });
  const skinColor = SKINS.find((s) => s.id === skin)?.color ?? "#ff1493";

  const select = (id: string) => {
    setSkin(id);
    try { localStorage.setItem("unipix_skin", id); } catch {}
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 py-6 overflow-hidden scanlines">
      {/* starfield */}
      <Stars />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-end gap-3">
          <PixelUnicornBadge color={skinColor} size={96} />
        </div>

        <h1 className="text-glow-pink text-2xl sm:text-4xl tracking-widest text-center leading-tight">
          UNIPIX
          <br />
          <span className="text-glow-cyan text-xl sm:text-2xl">PIXEL DASH</span>
        </h1>

        <p className="text-[10px] sm:text-xs text-glow-pink tracking-wider mt-1">
          STOP ASKING. START DASHING.
        </p>

        {best > 0 && (
          <div className="text-[10px] text-glow-cyan tracking-wider mt-1">
            BEST: {best}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="text-[9px] text-muted-foreground tracking-widest">SELECT HORN</div>
          <div className="flex gap-2">
            {SKINS.map((s) => (
              <button
                key={s.id}
                onClick={() => select(s.id)}
                className="w-10 h-10 border-2 border-black flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: s.color,
                  boxShadow: skin === s.id
                    ? `0 0 0 3px #fff, 0 0 16px ${s.color}`
                    : `0 0 8px ${s.color}66`,
                  outline: skin === s.id ? `2px solid ${s.color}` : "none",
                }}
                aria-label={s.label}
              >
                {skin === s.id && <span className="text-black text-[8px] font-bold">●</span>}
              </button>
            ))}
          </div>
        </div>

        <button className="pixel-btn text-sm sm:text-base mt-4" onClick={() => onPlay(skin)}>
          ▶ PLAY
        </button>

        <div className="text-[8px] text-muted-foreground mt-2 tracking-wider text-center">
          SPACE / TAP = JUMP
        </div>

        <div className="text-[8px] text-glow-pink mt-4 tracking-wider">
          EARN YOUR HORNS 🦄
        </div>
      </div>
    </div>
  );
}

function Stars() {
  // Decorative starfield using divs (small count, GPU-friendly)
  const stars = Array.from({ length: 40 }).map((_, i) => {
    const x = (i * 137) % 100;
    const y = (i * 73) % 100;
    const s = (i % 3) + 1;
    return (
      <div
        key={i}
        className="absolute bg-white"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: s,
          height: s,
          opacity: 0.4 + ((i % 5) / 10),
          boxShadow: i % 7 === 0 ? "0 0 4px #ff1493" : "none",
        }}
      />
    );
  });
  return <div className="absolute inset-0 pointer-events-none">{stars}</div>;
}
