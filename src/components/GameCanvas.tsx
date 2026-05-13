import { useEffect, useRef } from "react";
import type { GameOverPayload } from "@/game/PlayScene";

type Props = {
  skin: string;
  onGameOver: (p: GameOverPayload) => void;
};

export function GameCanvas({ skin, onGameOver }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (destroyed || !ref.current) return;
      const g = createGame(ref.current, skin);
      gameRef.current = g;
      g.events.on("gameover", (p: GameOverPayload) => {
        onGameOverRef.current(p);
      });
    })();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [skin]);

  // Forward touch on the on-screen jump button as a Phaser pointerdown.
  const triggerJump = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    const game = gameRef.current;
    if (!game) return;
    const scene = game.scene.getScene("Play") as any;
    if (scene?.input) {
      scene.input.emit("pointerdown");
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden scanlines select-none">
      <div
        ref={ref}
        className="absolute inset-0"
        style={{ imageRendering: "pixelated", touchAction: "none" }}
      />

      {/* On-screen JUMP button — visible on touch devices */}
      <button
        aria-label="Jump"
        onPointerDown={triggerJump}
        className="touch-jump-btn absolute z-30 select-none"
        style={{
          right: "max(16px, env(safe-area-inset-right))",
          bottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >
        ▲<br /><span className="text-[10px]">JUMP</span>
      </button>
    </div>
  );
}
