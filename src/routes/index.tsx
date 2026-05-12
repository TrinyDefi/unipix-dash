import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TitleScreen } from "@/components/TitleScreen";
import { GameCanvas } from "@/components/GameCanvas";
import { GameOverScreen } from "@/components/GameOverScreen";
import type { GameOverPayload } from "@/game/PlayScene";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "UniPix Pixel Dash 🦄" },
      { name: "description", content: "Run, jump, collect orbs and earn your horns. A retro pixel-art endless runner for the UniPix community." },
      { property: "og:title", content: "UniPix Pixel Dash" },
      { property: "og:description", content: "Stop asking. Start dashing." },
    ],
  }),
});

type Mode = "title" | "play" | "over";

function Index() {
  const [mode, setMode] = useState<Mode>("title");
  const [skin, setSkin] = useState("pink");
  const [result, setResult] = useState<GameOverPayload | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      setBest(parseInt(localStorage.getItem("unipix_best") ?? "0", 10) || 0);
    } catch {}
  }, [mode]);

  const startGame = useCallback((s: string) => {
    setSkin(s);
    setResult(null);
    setMode("play");
  }, []);

  const handleGameOver = useCallback((p: GameOverPayload) => {
    setResult(p);
    setMode("over");
  }, []);

  const retry = useCallback(() => {
    setResult(null);
    setMode("play");
  }, []);

  const menu = useCallback(() => {
    setResult(null);
    setMode("title");
  }, []);

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-background p-2 sm:p-4">
      <div
        className="relative w-full max-w-[920px] aspect-[16/9] bg-black border-2 border-black"
        style={{
          boxShadow:
            "0 0 0 3px #ff1493, 0 0 0 6px #000, 0 0 40px rgba(255,20,147,0.45), 0 0 80px rgba(147,51,234,0.3)",
        }}
      >
        {mode === "title" && <TitleScreen onPlay={startGame} best={best} />}
        {mode === "play" && <GameCanvas skin={skin} onGameOver={handleGameOver} />}
        {mode === "over" && result && (
          <GameOverScreen result={result} onRetry={retry} onMenu={menu} />
        )}
      </div>
    </main>
  );
}
