import Phaser from "phaser";
import { PlayScene } from "./PlayScene";

export function createGame(parent: HTMLElement, skin: string) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 480,
    height: 270,
    backgroundColor: "#1a0530",
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    fps: { target: 60, forceSetTimeOut: false },
    scene: [PlayScene],
    audio: { noAudio: true },
    banner: false,
  });
  game.scene.start("Play", { skin });
  return game;
}
