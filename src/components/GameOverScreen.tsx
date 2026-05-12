import { useEffect, useRef, useState } from "react";
import type { GameOverPayload } from "@/game/PlayScene";

type Props = {
  result: GameOverPayload;
  onRetry: () => void;
  onMenu: () => void;
};

export function GameOverScreen({ result, onRetry, onMenu }: Props) {
  const { score, distance, best } = result;
  const isNewBest = score >= best && score > 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawShareImage(c, score, distance, best);
    setShareUrl(c.toDataURL("image/png"));
  }, [score, distance, best]);

  const tweetText = `I just dashed ${score} pts (${distance}m) in UniPix Pixel Dash 🦄✨ Strong Contribution Detected. Stop asking. Start dashing. #UniPix`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const downloadImage = () => {
    if (!shareUrl) return;
    const a = document.createElement("a");
    a.href = shareUrl;
    a.download = `unipix-pixel-dash-${score}.png`;
    a.click();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 py-6 overflow-y-auto scanlines">
      <div className="relative z-10 flex flex-col items-center gap-3 max-w-md">
        <h2 className="text-glow-pink text-xl sm:text-2xl tracking-widest text-center">
          GAME OVER
        </h2>

        {isNewBest && (
          <div className="text-glow-cyan text-xs animate-pulse tracking-widest">
            ★ NEW BEST ★
          </div>
        )}

        <div className="text-glow-pink text-[10px] sm:text-xs tracking-wider text-center mt-1">
          STRONG CONTRIBUTION DETECTED 🦄
        </div>

        <div
          className="border-2 border-black mt-2"
          style={{ boxShadow: "0 0 0 2px #ff1493, 0 0 24px rgba(255,20,147,0.6)" }}
        >
          <canvas
            ref={canvasRef}
            width={360}
            height={180}
            className="block"
            style={{ imageRendering: "pixelated", width: "100%", maxWidth: 360 }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full max-w-sm text-center mt-2">
          <Stat label="SCORE" value={score} color="#ff1493" />
          <Stat label="DIST" value={`${distance}m`} color="#00e5ff" />
          <Stat label="BEST" value={best} color="#ffe14a" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-3">
          <button className="pixel-btn text-xs" onClick={onRetry}>↻ RETRY</button>
          <button className="pixel-btn pixel-btn-purple text-xs" onClick={onMenu}>← MENU</button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <a className="pixel-btn pixel-btn-cyan text-xs no-underline inline-block"
             href={tweetUrl} target="_blank" rel="noreferrer">
            ✦ TWEET SCORE
          </a>
          <button className="pixel-btn pixel-btn-cyan text-xs" onClick={downloadImage}>
            ⤓ SAVE IMAGE
          </button>
        </div>

        <div className="text-[9px] text-glow-pink tracking-widest mt-2 text-center">
          EARN YOUR HORNS 🦄
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div
      className="border-2 border-black p-2"
      style={{
        background: "rgba(0,0,0,0.5)",
        boxShadow: `inset 0 0 0 1px ${color}, 0 0 12px ${color}55`,
      }}
    >
      <div className="text-[8px] tracking-widest" style={{ color }}>{label}</div>
      <div className="text-sm sm:text-base text-white" style={{ textShadow: `0 0 6px ${color}` }}>
        {value}
      </div>
    </div>
  );
}

function drawShareImage(canvas: HTMLCanvasElement, score: number, distance: number, best: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1a0530");
  grad.addColorStop(1, "#3a0a4a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % W;
    const y = (i * 71) % H;
    const s = (i % 2) + 1;
    ctx.globalAlpha = 0.4 + ((i % 5) / 10);
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // Floor
  ctx.fillStyle = "#3a1f0a";
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = "#5a2f15";
  ctx.fillRect(0, H - 24, W, 3);

  // Title
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#ff1493";
  ctx.shadowColor = "#ff1493";
  ctx.shadowBlur = 12;
  ctx.textAlign = "center";
  ctx.fillText("UNIPIX PIXEL DASH", W / 2, 32);
  ctx.shadowBlur = 0;

  // Tagline
  ctx.font = "bold 9px monospace";
  ctx.fillStyle = "#00e5ff";
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 8;
  ctx.fillText("STRONG CONTRIBUTION DETECTED", W / 2, 50);
  ctx.shadowBlur = 0;

  // Score block
  ctx.font = "bold 32px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ff1493";
  ctx.shadowBlur = 16;
  ctx.fillText(String(score), W / 2, 100);
  ctx.shadowBlur = 0;

  ctx.font = "bold 9px monospace";
  ctx.fillStyle = "#ffe14a";
  ctx.fillText(`SCORE`, W / 2, 114);

  // Distance + best
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#ff66c4";
  ctx.fillText(`DIST ${distance}m   BEST ${best}`, W / 2, 134);

  // Footer
  ctx.font = "bold 8px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("EARN YOUR HORNS 🦄  STOP ASKING. START DASHING.", W / 2, 152);

  // Tiny pixel unicorn (left)
  drawTinyUnicorn(ctx, 30, H - 60);
}

function drawTinyUnicorn(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  const s = 2;
  const P = "#ff1493", K = "#1a0820", W = "#ffffff", Y = "#ffe14a", C = "#00e5ff";
  const grid: (string | null)[][] = [
    [null,null,null,null,null,null,null,null,null,Y,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,Y,C,Y,null,null,null,null,null],
    [null,null,null,null,null,null,null,K,P,P,P,K,null,null,null,null],
    [null,null,null,null,null,null,K,P,P,W,P,P,K,null,null,null],
    [null,null,null,null,null,K,P,P,P,W,W,P,P,K,null,null],
    [null,null,null,null,K,W,P,P,P,P,P,P,P,P,K,null],
    [null,null,null,K,W,W,P,P,P,P,P,P,P,P,K,null],
    [null,null,K,W,W,W,P,P,P,P,P,P,P,K,null,null],
    [null,null,null,K,K,K,P,P,P,P,P,P,K,null,null,null],
    [null,null,null,null,null,K,P,K,K,P,K,K,null,null,null,null],
    [null,null,null,null,null,K,P,K,null,K,P,K,null,null,null,null],
    [null,null,null,null,null,K,K,K,null,K,K,K,null,null,null,null],
  ];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(ox + x * s, oy + y * s, s, s);
    }
  }
}
