type Skin = { id: string; label: string; color: string };

export const SKINS: Skin[] = [
  { id: "pink", label: "PINK", color: "#ff1493" },
  { id: "cyan", label: "CYAN", color: "#00e5ff" },
  { id: "purple", label: "PURPLE", color: "#9333ea" },
  { id: "gold", label: "GOLD", color: "#ffe14a" },
];

export function PixelUnicornBadge({ color = "#ff1493", size = 80 }: { color?: string; size?: number }) {
  // Tiny CSS pixel-art unicorn (decorative)
  const s = size / 16;
  const cell = (x: number, y: number, c: string) => (
    <div
      key={`${x}-${y}`}
      style={{
        position: "absolute",
        left: x * s,
        top: y * s,
        width: s,
        height: s,
        background: c,
      }}
    />
  );
  const K = "#1a0820";
  const W = "#ffffff";
  const Y = "#ffe14a";
  const C = "#00e5ff";
  const P = color;
  // 16x16 simple unicorn head
  const grid: (string | null)[][] = [
    [null,null,null,null,null,null,null,null,null,null,Y,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,Y,C,Y,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,K,Y,K,null,null,null,null],
    [null,null,null,null,null,null,null,null,K,P,P,P,K,null,null,null],
    [null,null,null,null,null,null,null,K,P,P,P,P,P,K,null,null],
    [null,null,null,null,null,null,K,P,P,P,W,W,P,P,K,null],
    [null,null,null,null,null,K,P,P,P,W,W,W,W,P,P,K],
    [null,null,null,null,K,W,P,P,P,P,P,P,P,P,P,K],
    [null,null,null,K,W,W,P,P,P,P,P,P,P,P,K,null],
    [null,null,K,W,W,W,P,P,P,P,P,P,P,P,K,null],
    [null,K,W,W,W,W,P,P,P,P,P,P,P,K,null,null],
    [null,null,K,K,K,K,P,P,P,P,P,P,K,null,null,null],
    [null,null,null,null,null,K,P,K,K,P,K,K,null,null,null,null],
    [null,null,null,null,null,K,P,K,null,K,P,K,null,null,null,null],
    [null,null,null,null,null,K,P,K,null,K,P,K,null,null,null,null],
    [null,null,null,null,null,K,K,K,null,K,K,K,null,null,null,null],
  ];
  const out: React.ReactNode[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      if (c) out.push(cell(x, y, c));
    }
  }
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      {out}
    </div>
  );
}
