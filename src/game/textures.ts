// Procedural pixel-art texture generation. Keeps bundle tiny and avoids asset loading.
import * as Phaser from "phaser";

type Px = string | null;

function drawPixels(g: Phaser.GameObjects.Graphics, grid: Px[][], scale = 1, ox = 0, oy = 0) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      if (!c) continue;
      g.fillStyle(Phaser.Display.Color.HexStringToColor(c).color, 1);
      g.fillRect(ox + x * scale, oy + y * scale, scale, scale);
    }
  }
}

export function buildTextures(scene: Phaser.Scene) {
  const make = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
    const g = scene.add.graphics().setVisible(false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // ---------- Unicorn (32x24) ----------
  // colors
  const P = "#ff1493"; // hot pink body
  const PL = "#ff66c4"; // light pink
  const PD = "#c70080"; // dark pink
  const W = "#ffffff"; // white
  const C = "#00e5ff"; // cyan horn glow
  const Y = "#ffe14a"; // yellow horn
  const K = "#1a0820"; // outline
  const E = "#ffffff"; // eye white
  const EB = "#000000"; // eye black

  // 32 wide x 24 tall unicorn
  const _ = null as Px;
  const U: Px[][] = [
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,Y,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,Y,Y,Y,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,Y,C,Y,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,Y,K,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,PL,PL,K,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,P,P,P,PL,K,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,P,P,EB,P,P,PL,K,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,P,P,P,P,P,P,P,PL,K,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,P,P,P,W,W,P,P,P,P,PL,K,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,K,PL,P,P,P,W,W,W,W,P,P,P,P,PL,K,_,_],
    [_,_,_,_,_,K,K,_,_,_,_,_,_,_,K,PL,P,P,P,P,P,P,P,P,P,P,P,P,P,PL,K,_],
    [_,_,_,_,K,W,W,K,_,_,_,_,_,K,PL,P,P,P,PD,PD,P,P,P,PD,P,P,P,P,P,P,K,_],
    [_,_,_,_,K,W,W,W,W,K,_,_,_,K,PL,P,P,P,P,P,P,P,P,P,P,P,P,P,PL,K,_,_],
    [_,_,K,W,W,W,W,W,W,K,K,K,PL,P,P,P,P,P,P,P,P,P,P,P,P,P,PL,K,_,_,_,_],
    [_,K,W,W,W,W,W,W,W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,K,_,_,_,_,_],
    [_,K,W,W,W,W,W,W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,K,_,_,_,_,_,_],
    [_,_,K,W,W,W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,K,_,_,_,_,_,_,_],
    [_,_,_,K,K,K,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,K,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,P,P,K,_,_,K,P,P,K,_,_,K,P,P,K,K,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,P,P,K,_,_,K,P,P,K,_,_,K,P,P,K,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,P,P,K,_,_,K,P,P,K,_,_,K,P,P,K,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,W,W,K,_,_,K,W,W,K,_,_,K,W,W,K,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,W,W,K,_,_,K,W,W,K,_,_,K,W,W,K,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,K,K,K,K,_,_,K,K,K,K,_,_,K,K,K,K,_,_,_,_,_,_,_,_,_,_],
  ];

  // Frame 1 (legs neutral) - 32x24
  make("unicorn0", 32, 24, (g) => drawPixels(g, U, 1));

  // Frame 2 (legs running) - shift back legs forward
  const U2: Px[][] = U.map((row) => row.slice());
  // Modify legs rows 18-23: alternate stride
  for (let y = 18; y < 24; y++) {
    for (let x = 0; x < 32; x++) U2[y][x] = null;
  }
  // Front legs forward
  const fl = (y: number, sx: number, col: Px) => { U2[y][sx] = col; U2[y][sx+1] = col; };
  // Leg 1 (front): bent
  for (let y = 18; y <= 22; y++) { U2[y][8]=K; U2[y][9]=(y>=21?W:P); U2[y][10]=(y>=21?W:P); U2[y][11]=K; }
  U2[23][8]=K;U2[23][9]=K;U2[23][10]=K;U2[23][11]=K;
  // Leg 2: lifted
  for (let y = 19; y <= 21; y++) { U2[y][13]=K; U2[y][14]=P; U2[y][15]=K; }
  U2[22][13]=K;U2[22][14]=K;U2[22][15]=K;
  // Leg 3: extended back
  for (let y = 18; y <= 22; y++) { U2[y][18]=K; U2[y][19]=(y>=21?W:P); U2[y][20]=(y>=21?W:P); U2[y][21]=K; }
  U2[23][18]=K;U2[23][19]=K;U2[23][20]=K;U2[23][21]=K;
  // Leg 4: tucked
  for (let y = 19; y <= 21; y++) { U2[y][23]=K; U2[y][24]=P; U2[y][25]=K; }
  U2[22][23]=K;U2[22][24]=K;U2[22][25]=K;

  make("unicorn1", 32, 24, (g) => drawPixels(g, U2, 1));

  // Jump frame: legs together tucked
  const U3: Px[][] = U.map((row) => row.slice());
  for (let y = 18; y < 24; y++) for (let x = 0; x < 32; x++) U3[y][x] = null;
  for (let y = 18; y <= 20; y++) { U3[y][9]=K; U3[y][10]=P; U3[y][11]=P; U3[y][12]=K; }
  for (let y = 18; y <= 20; y++) { U3[y][18]=K; U3[y][19]=P; U3[y][20]=P; U3[y][21]=K; }
  U3[21][9]=K;U3[21][10]=W;U3[21][11]=W;U3[21][12]=K;
  U3[21][18]=K;U3[21][19]=W;U3[21][20]=W;U3[21][21]=K;
  make("unicorn2", 32, 24, (g) => drawPixels(g, U3, 1));

  // ---------- Coin / Pink Orb (10x10) ----------
  make("orb", 12, 12, (g) => {
    g.fillStyle(0xff1493, 1);
    g.fillCircle(6, 6, 5);
    g.fillStyle(0xff66c4, 1);
    g.fillCircle(4, 4, 2);
    g.lineStyle(1, 0xffffff, 0.8);
    g.strokeCircle(6, 6, 5);
  });

  // ---------- Crate (24x24) ----------
  make("crate", 24, 24, (g) => {
    g.fillStyle(0x6b3a1a, 1);
    g.fillRect(0, 0, 24, 24);
    g.fillStyle(0x8b4a22, 1);
    g.fillRect(2, 2, 20, 20);
    g.fillStyle(0x4a2510, 1);
    g.fillRect(0, 11, 24, 2);
    g.fillRect(11, 0, 2, 24);
    g.lineStyle(1, 0x2a1808, 1);
    g.strokeRect(0, 0, 24, 24);
  });

  // ---------- Glitch Block (20x20) ----------
  make("glitch", 20, 20, (g) => {
    g.fillStyle(0x9333ea, 1);
    g.fillRect(0, 0, 20, 20);
    g.fillStyle(0x00e5ff, 1);
    g.fillRect(2, 4, 16, 2);
    g.fillRect(4, 10, 12, 2);
    g.fillRect(2, 14, 14, 2);
    g.fillStyle(0xff1493, 1);
    g.fillRect(6, 6, 8, 2);
    g.lineStyle(1, 0x000000, 1);
    g.strokeRect(0, 0, 20, 20);
  });

  // ---------- Low beam (40x10) ----------
  make("beam", 40, 10, (g) => {
    g.fillStyle(0x9333ea, 1);
    g.fillRect(0, 0, 40, 10);
    g.fillStyle(0x00e5ff, 1);
    g.fillRect(0, 2, 40, 1);
    g.fillRect(0, 7, 40, 1);
    g.lineStyle(1, 0x000000, 1);
    g.strokeRect(0, 0, 40, 10);
  });

  // ---------- Power-up icons (14x14) ----------
  make("pu_shield", 16, 16, (g) => {
    g.fillStyle(0x00e5ff, 1);
    g.fillTriangle(8, 1, 15, 5, 8, 15);
    g.fillTriangle(8, 1, 1, 5, 8, 15);
    g.fillStyle(0xffffff, 1);
    g.fillRect(7, 5, 2, 5);
  });
  make("pu_magnet", 16, 16, (g) => {
    g.fillStyle(0xff1493, 1);
    g.fillRect(2, 2, 4, 10);
    g.fillRect(10, 2, 4, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(2, 2, 4, 3);
    g.fillRect(10, 2, 4, 3);
    g.fillRect(2, 12, 12, 2);
  });
  make("pu_mult", 16, 16, (g) => {
    g.fillStyle(0xffe14a, 1);
    g.fillRect(2, 5, 12, 6);
    g.fillStyle(0x000000, 1);
    g.fillRect(4, 7, 2, 2);
    g.fillRect(10, 7, 2, 2);
  });

  // ---------- Particle (4x4) ----------
  make("spark_pink", 4, 4, (g) => { g.fillStyle(0xff1493, 1); g.fillRect(0, 0, 4, 4); });
  make("spark_cyan", 4, 4, (g) => { g.fillStyle(0x00e5ff, 1); g.fillRect(0, 0, 4, 4); });
  make("spark_white", 4, 4, (g) => { g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 4, 4); });

  // ---------- Floor tile (32x16) ----------
  make("floor", 32, 16, (g) => {
    g.fillStyle(0x3a1f0a, 1);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(0x5a2f15, 1);
    g.fillRect(0, 0, 32, 3);
    g.fillStyle(0x2a1505, 1);
    g.fillRect(0, 7, 32, 1);
    g.fillRect(0, 12, 32, 1);
    // wood grain stripes
    g.fillStyle(0x4a2510, 1);
    g.fillRect(8, 1, 1, 14);
    g.fillRect(20, 1, 1, 14);
  });

  // ---------- Star (3x3) for parallax ----------
  make("star", 3, 3, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillRect(1, 0, 1, 3);
    g.fillRect(0, 1, 3, 1);
  });

  // ---------- Mountain silhouette (160x80) ----------
  make("mountains", 240, 80, (g) => {
    g.fillStyle(0x2a0a3a, 1);
    g.fillTriangle(0, 80, 60, 20, 120, 80);
    g.fillTriangle(80, 80, 140, 10, 200, 80);
    g.fillTriangle(160, 80, 220, 30, 240, 80);
    g.fillStyle(0x4a1a5a, 1);
    g.fillTriangle(40, 80, 90, 40, 140, 80);
    g.fillTriangle(150, 80, 200, 45, 240, 80);
  });

  // ---------- Cloud / nebula (80x40) ----------
  make("nebula", 100, 50, (g) => {
    g.fillStyle(0x9333ea, 0.4);
    g.fillCircle(30, 25, 22);
    g.fillCircle(60, 20, 18);
    g.fillStyle(0xff1493, 0.3);
    g.fillCircle(50, 30, 16);
    g.fillCircle(75, 28, 14);
  });
}
