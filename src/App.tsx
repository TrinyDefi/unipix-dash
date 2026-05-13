import { useEffect, useState } from "react";
import { TitleScreen } from "./components/TitleScreen";
import { GameCanvas } from "./components/GameCanvas";
import { GameOverScreen } from "./components/GameOverScreen";
import type { GameOverPayload } from "./game/PlayScene";

type View = "title" | "play" | "over";

const BEST_KEY = "unipix_best";

export default function App() {
  const [view, setView] = useState<View>("title");
  const [skin, setSkin] = useState("pink");
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<GameOverPayload | null>(null);

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) setBest(v);
    } catch {}
  }, []);

  const handlePlay = (s: string) => {
    setSkin(s);
    setResult(null);
    setView("play");
  };

  const handleGameOver = (p: GameOverPayload) => {
    const newBest = Math.max(p.best, p.score, best);
    if (newBest > best) {
      setBest(newBest);
      try { localStorage.setItem(BEST_KEY, String(newBest)); } catch {}
    }
    setResult({ ...p, best: newBest });
    setView("over");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="relative w-full h-full max-w-[960px] max-h-[100dvh]">
        {view === "title" && <TitleScreen onPlay={handlePlay} best={best} />}
        {view === "play" && <GameCanvas skin={skin} onGameOver={handleGameOver} />}
        {view === "over" && result && (
          <GameOverScreen
            result={result}
            onRetry={() => handlePlay(skin)}
            onMenu={() => setView("title")}
          />
        )}
      </div>
    </div>
  );
}
