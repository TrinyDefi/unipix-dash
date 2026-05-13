import { useEffect, useState } from "react";
import { TitleScreen } from "./components/TitleScreen";
import { GameCanvas } from "./components/GameCanvas";
import { GameOverScreen } from "./components/GameOverScreen";
import { SettingsModal } from "./components/SettingsModal";
import { audio } from "./game/audio";
import type { GameOverPayload } from "./game/PlayScene";

type View = "title" | "play" | "over";

const BEST_KEY = "unipix_best";

export default function App() {
  const [view, setView] = useState<View>("title");
  const [skin, setSkin] = useState("pink");
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<GameOverPayload | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) setBest(v);
    } catch {}
  }, []);

  // Unlock audio on first user gesture
  useEffect(() => {
    const unlock = () => { audio.unlock(); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Music lifecycle
  useEffect(() => {
    if (view === "play") {
      audio.unlock().then(() => audio.startMusic());
    } else {
      audio.stopMusic();
    }
    return () => { audio.stopMusic(); };
  }, [view]);

  const handlePlay = (s: string) => {
    audio.unlock();
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
    <div className="fixed inset-0 flex items-center justify-center bg-background select-none">
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

        {/* Settings button (always visible) */}
        <button
          aria-label="Settings"
          onClick={() => { audio.unlock(); setSettingsOpen(true); }}
          className="absolute top-2 right-2 z-40 w-10 h-10 flex items-center justify-center border-2 border-black bg-black/60 text-white text-lg"
          style={{ boxShadow: "0 0 0 2px #ff1493, 0 0 12px rgba(255,20,147,.6)" }}
        >
          ⚙
        </button>

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  );
}
