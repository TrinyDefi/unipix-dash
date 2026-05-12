import { useEffect, useRef } from "react";
import type { GameOverPayload } from "@/game/PlayScene";

type Props = {
  skin: string;
  onGameOver: (p: GameOverPayload) => void;
};

export function GameCanvas({ skin, onGameOver }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    let destroyed = false;
    let gameInstance: import("phaser").Game | null = null;

    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (destroyed || !ref.current) return;
      gameInstance = createGame(ref.current, skin);
      gameInstance.events.on("gameover", (p: GameOverPayload) => {
        onGameOverRef.current(p);
      });
    })();

    return () => {
      destroyed = true;
      if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
      }
    };
  }, [skin]);

  return (
    <div
      ref={ref}
      className="relative w-full h-full bg-black overflow-hidden scanlines"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
