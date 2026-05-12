import * as Phaser from "phaser";
import { buildTextures } from "./textures";

const W = 480;
const H = 270;
const GROUND_Y = 230;
const GRAVITY = 1500;
const JUMP_VEL = -520;
const BASE_SPEED = 150;
const MAX_SPEED = 340;

type Obstacle = Phaser.Physics.Arcade.Sprite & { _kind?: string };

export type GameOverPayload = {
  score: number;
  distance: number;
  best: number;
};

export class PlayScene extends Phaser.Scene {
  private unicorn!: Phaser.Physics.Arcade.Sprite;
  private floor!: Phaser.GameObjects.TileSprite;
  private starsFar!: Phaser.GameObjects.TileSprite;
  private starsNear!: Phaser.GameObjects.TileSprite;
  private mountains!: Phaser.GameObjects.TileSprite;
  private nebula!: Phaser.GameObjects.TileSprite;

  private obstacles!: Phaser.Physics.Arcade.Group;
  private orbs!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trail!: Phaser.GameObjects.Particles.ParticleEmitter;

  private speed = BASE_SPEED;
  private score = 0;
  private distance = 0;
  private spawnTimer = 0;
  private orbTimer = 0;
  private powerTimer = 6000;
  private jumpsLeft = 1;
  private maxJumps = 1;
  private alive = true;

  private shieldUntil = 0;
  private magnetUntil = 0;
  private multUntil = 0;
  private doubleJumpUntil = 0;

  private hudText!: Phaser.GameObjects.BitmapText | Phaser.GameObjects.Text;
  private bestScore = 0;
  private skin: string = "pink";

  private flashRect!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("Play");
  }

  init(data: { skin?: string }) {
    this.skin = data?.skin ?? "pink";
    this.speed = BASE_SPEED;
    this.score = 0;
    this.distance = 0;
    this.spawnTimer = 1200;
    this.orbTimer = 600;
    this.powerTimer = 8000;
    this.jumpsLeft = 1;
    this.maxJumps = 1;
    this.alive = true;
    this.shieldUntil = 0;
    this.magnetUntil = 0;
    this.multUntil = 0;
    this.doubleJumpUntil = 0;
    try {
      this.bestScore = parseInt(localStorage.getItem("unipix_best") ?? "0", 10) || 0;
    } catch {
      this.bestScore = 0;
    }
  }

  preload() {
    buildTextures(this);
  }

  create() {
    // Sky gradient (drawn rect)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1a0530, 0x1a0530, 0x3a0a4a, 0x2a0a3a, 1);
    sky.fillRect(0, 0, W, H);

    // Stars (parallax)
    this.starsFar = this.add.tileSprite(0, 0, W, 140, "star").setOrigin(0).setAlpha(0.5);
    this.starsNear = this.add.tileSprite(0, 0, W, 140, "star").setOrigin(0).setAlpha(0.9);
    // Tile pattern manually by repeating - make a pattern texture
    this.makeStarField("starfield_far", 160, 140, 30);
    this.makeStarField("starfield_near", 200, 140, 18);
    this.starsFar.setTexture("starfield_far");
    this.starsNear.setTexture("starfield_near");

    // Nebula
    this.nebula = this.add.tileSprite(0, 30, W, 50, "nebula").setOrigin(0).setAlpha(0.7);

    // Mountains
    this.mountains = this.add.tileSprite(0, GROUND_Y - 60, W, 80, "mountains").setOrigin(0);

    // Floor
    this.floor = this.add.tileSprite(0, GROUND_Y, W, 16, "floor").setOrigin(0, 0);
    // Floor underlay
    this.add.rectangle(0, GROUND_Y + 16, W, H - GROUND_Y - 16, 0x1a0a05).setOrigin(0);

    // Unicorn
    this.unicorn = this.physics.add.sprite(80, GROUND_Y - 12, "unicorn0");
    this.unicorn.setOrigin(0.5, 1);
    this.unicorn.setSize(20, 20);
    this.unicorn.setOffset(6, 4);
    (this.unicorn.body as Phaser.Physics.Arcade.Body).setGravityY(GRAVITY);
    this.unicorn.setDepth(5);
    this.applySkinTint();

    // Run animation
    if (!this.anims.exists("run")) {
      this.anims.create({
        key: "run",
        frames: [{ key: "unicorn0" }, { key: "unicorn1" }],
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({ key: "jump", frames: [{ key: "unicorn2" }], frameRate: 1 });
    }
    this.unicorn.play("run");

    // Groups (object pooling via group max + recycle)
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true, maxSize: 20 });
    this.orbs = this.physics.add.group({ allowGravity: false, immovable: true, maxSize: 40 });
    this.powerups = this.physics.add.group({ allowGravity: false, immovable: true, maxSize: 6 });

    // Trail particles (light)
    this.trail = this.add.particles(0, 0, "spark_pink", {
      lifespan: 400,
      speed: { min: 10, max: 30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 80,
      follow: this.unicorn,
      followOffset: { x: -10, y: -8 },
      blendMode: "ADD",
    });
    this.trail.setDepth(4);

    // Burst particles emitter (manual)
    this.particles = this.add.particles(0, 0, "spark_cyan", {
      lifespan: 500,
      speed: { min: 60, max: 160 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: "ADD",
      emitting: false,
    });
    this.particles.setDepth(6);

    // Flash overlay
    this.flashRect = this.add.rectangle(0, 0, W, H, 0xffffff, 0).setOrigin(0).setDepth(100);

    // Collisions
    this.physics.add.overlap(this.unicorn, this.orbs, (_u, o) => this.collectOrb(o as Obstacle));
    this.physics.add.overlap(this.unicorn, this.powerups, (_u, p) => this.collectPowerup(p as Obstacle));
    this.physics.add.overlap(this.unicorn, this.obstacles, (_u, o) => this.hitObstacle(o as Obstacle));

    // Ground collider (invisible)
    const ground = this.add.rectangle(W / 2, GROUND_Y + 4, W, 8, 0x000000, 0);
    this.physics.add.existing(ground, true);
    this.physics.add.collider(this.unicorn, ground, () => {
      this.jumpsLeft = this.maxJumps;
      if ((this.unicorn.body as Phaser.Physics.Arcade.Body).velocity.y === 0) {
        if (this.unicorn.anims.currentAnim?.key !== "run") this.unicorn.play("run");
      }
    });

    // Input
    this.input.keyboard?.on("keydown-SPACE", () => this.tryJump());
    this.input.keyboard?.on("keydown-UP", () => this.tryJump());
    this.input.on("pointerdown", () => this.tryJump());

    // HUD
    this.hudText = this.add
      .text(8, 6, "", {
        fontFamily: "Press Start 2P, monospace",
        fontSize: "10px",
        color: "#ffffff",
        stroke: "#ff1493",
        strokeThickness: 2,
      })
      .setDepth(50);
    this.updateHud();

    // Brief intro flash
    this.flashRect.setFillStyle(0xff1493, 0.4);
    this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 400 });
  }

  private makeStarField(key: string, w: number, h: number, count: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics().setVisible(false);
    g.fillStyle(0xffffff, 1);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, w - 1);
      const y = Phaser.Math.Between(0, h - 1);
      const s = Phaser.Math.Between(1, 2);
      g.fillRect(x, y, s, s);
    }
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private applySkinTint() {
    if (this.skin === "cyan") this.unicorn.setTint(0x66f5ff);
    else if (this.skin === "purple") this.unicorn.setTint(0xc084ff);
    else if (this.skin === "gold") this.unicorn.setTint(0xffe14a);
    else this.unicorn.clearTint();
  }

  private tryJump() {
    if (!this.alive) return;
    if (this.jumpsLeft <= 0) return;
    const body = this.unicorn.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(JUMP_VEL);
    this.jumpsLeft--;
    this.unicorn.play("jump");
    this.particles.emitParticleAt(this.unicorn.x, this.unicorn.y, 6);
  }

  update(_time: number, delta: number) {
    if (!this.alive) return;
    const dt = delta / 1000;

    // Speed scaling
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.distance * 0.012);

    // Distance / score
    this.distance += this.speed * dt;
    const mult = this.time.now < this.multUntil ? 2 : 1;
    this.score += this.speed * dt * 0.05 * mult;

    // Parallax scroll
    this.starsFar.tilePositionX += this.speed * dt * 0.08;
    this.starsNear.tilePositionX += this.speed * dt * 0.18;
    this.nebula.tilePositionX += this.speed * dt * 0.25;
    this.mountains.tilePositionX += this.speed * dt * 0.5;
    this.floor.tilePositionX += this.speed * dt;

    // Move all spawned items
    const move = (s: Phaser.GameObjects.GameObject) => {
      const sp = s as Obstacle;
      if (!sp.active) return;
      sp.x -= this.speed * dt;
      if (sp.x < -40) {
        sp.disableBody(true, true);
      }
    };
    this.obstacles.children.iterate((c) => { move(c); return true; });
    this.orbs.children.iterate((c) => { move(c); return true; });
    this.powerups.children.iterate((c) => {
      move(c);
      const p = c as Obstacle;
      if (p.active && (p as any)._baseY != null) {
        p.y = (p as any)._baseY + Math.sin(this.time.now / 250 + (p as any)._bobPhase) * 6;
      }
      return true;
    });

    // Magnet effect: pull orbs toward unicorn
    if (this.time.now < this.magnetUntil) {
      this.orbs.children.iterate((c) => {
        const o = c as Obstacle;
        if (!o.active) return true;
        const dx = this.unicorn.x - o.x;
        const dy = this.unicorn.y - 16 - o.y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          o.x += (dx / d) * 220 * dt;
          o.y += (dy / d) * 220 * dt;
        }
        return true;
      });
    }

    // Spawn timers
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnObstacle();
      const minGap = Math.max(550, 1100 - this.distance * 0.05);
      this.spawnTimer = Phaser.Math.Between(minGap, minGap + 600);
    }
    this.orbTimer -= delta;
    if (this.orbTimer <= 0) {
      this.spawnOrbCluster();
      this.orbTimer = Phaser.Math.Between(800, 1800);
    }
    this.powerTimer -= delta;
    if (this.powerTimer <= 0) {
      this.spawnPowerup();
      this.powerTimer = Phaser.Math.Between(9000, 15000);
    }

    // Double jump expiry
    if (this.time.now >= this.doubleJumpUntil) this.maxJumps = 1;

    this.updateHud();
  }

  private spawnObstacle() {
    const kinds = ["crate", "glitch", "beam"];
    const kind = Phaser.Utils.Array.GetRandom(kinds);
    const x = W + 40;
    let s = this.obstacles.get(x, 0, kind) as Obstacle | null;
    if (!s) return;
    s._kind = kind;
    s.setTexture(kind);
    s.setOrigin(0.5, 1);
    if (kind === "crate") {
      s.setPosition(x, GROUND_Y - 12);
      this.activatePoolSprite(s, 20, 20, 2, 2);
      if (Math.random() < 0.25 && this.distance > 400) {
        const top = this.obstacles.get(x, 0, "crate") as Obstacle | null;
        if (top) {
          top._kind = "crate";
          top.setTexture("crate");
          top.setOrigin(0.5, 1);
          top.setPosition(x, GROUND_Y - 36);
          this.activatePoolSprite(top, 20, 20, 2, 2);
        }
      }
    } else if (kind === "glitch") {
      s.setPosition(x, GROUND_Y - 12);
      s.setAlpha(1);
      this.activatePoolSprite(s, 16, 16, 2, 2);
    } else if (kind === "beam") {
      s.setOrigin(0.5, 0.5);
      s.setPosition(x, GROUND_Y - 40);
      this.activatePoolSprite(s, 36, 8, 2, 1);
    }
  }

  private activatePoolSprite(s: Obstacle, w: number, h: number, ox: number, oy: number) {
    s.setActive(true).setVisible(true);
    const body = s.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.enable = true;
      body.setAllowGravity(false);
      body.setSize(w, h);
      body.setOffset(ox, oy);
      body.reset(s.x, s.y);
    }
  }

  private spawnOrbCluster() {
    const count = Phaser.Math.Between(3, 6);
    const baseY = Phaser.Math.Between(GROUND_Y - 80, GROUND_Y - 30);
    const startX = W + 20;
    for (let i = 0; i < count; i++) {
      const y = baseY + Math.sin(i * 0.7) * 6;
      const o = this.orbs.get(startX + i * 16, y, "orb") as Obstacle | null;
      if (!o) continue;
      o.setTexture("orb");
      o.setOrigin(0.5);
      o.setPosition(startX + i * 16, y);
      this.activatePoolSprite(o, 10, 10, 1, 1);
    }
  }

  private spawnPowerup() {
    const kinds = ["pu_shield", "pu_magnet", "pu_mult"];
    const kind = Phaser.Utils.Array.GetRandom(kinds);
    const p = this.powerups.get(W + 20, GROUND_Y - 60, kind) as Obstacle | null;
    if (!p) return;
    p._kind = kind;
    p.setTexture(kind);
    p.setOrigin(0.5);
    p.setPosition(W + 20, GROUND_Y - 60);
    this.activatePoolSprite(p, 14, 14, 1, 1);
    (p as any)._baseY = p.y;
    (p as any)._bobPhase = Math.random() * Math.PI * 2;
  }

  private collectOrb(o: Obstacle) {
    if (!o.active) return;
    o.disableBody(true, true);
    const mult = this.time.now < this.multUntil ? 2 : 1;
    this.score += 10 * mult;
    this.particles.setTexture("spark_pink");
    this.particles.emitParticleAt(o.x, o.y, 5);
  }

  private collectPowerup(p: Obstacle) {
    if (!p.active) return;
    const kind = p._kind;
    p.disableBody(true, true);
    this.particles.setTexture("spark_white");
    this.particles.emitParticleAt(p.x, p.y, 12);
    if (kind === "pu_shield") {
      this.shieldUntil = this.time.now + 6000;
      this.maxJumps = 2; // shield grants double jump too
      this.doubleJumpUntil = this.time.now + 6000;
    } else if (kind === "pu_magnet") {
      this.magnetUntil = this.time.now + 7000;
    } else if (kind === "pu_mult") {
      this.multUntil = this.time.now + 7000;
    }
    this.flashRect.setFillStyle(0x00e5ff, 0.35);
    this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 300 });
  }

  private hitObstacle(o: Obstacle) {
    if (!o.active || !this.alive) return;
    if (this.time.now < this.shieldUntil) {
      // Consume shield, destroy obstacle
      this.shieldUntil = 0;
      o.disableBody(true, true);
      this.particles.setTexture("spark_cyan");
      this.particles.emitParticleAt(o.x, o.y, 16);
      this.flashRect.setFillStyle(0x00e5ff, 0.5);
      this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 250 });
      return;
    }
    this.gameOver();
  }

  private updateHud() {
    const score = Math.floor(this.score);
    const dist = Math.floor(this.distance);
    const best = Math.max(this.bestScore, score);
    const buffs: string[] = [];
    if (this.time.now < this.shieldUntil) buffs.push("SHIELD");
    if (this.time.now < this.magnetUntil) buffs.push("MAGNET");
    if (this.time.now < this.multUntil) buffs.push("x2");
    this.hudText.setText(
      `SCORE ${score}   DIST ${dist}m\nBEST  ${best}${buffs.length ? "  " + buffs.join(" ") : ""}`
    );
  }

  private gameOver() {
    this.alive = false;
    this.physics.pause();
    this.unicorn.setTint(0xff4040);
    this.particles.setTexture("spark_pink");
    this.particles.emitParticleAt(this.unicorn.x, this.unicorn.y - 10, 30);
    this.flashRect.setFillStyle(0xff1493, 0.6);
    this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 600 });

    const finalScore = Math.floor(this.score);
    const finalDist = Math.floor(this.distance);
    const best = Math.max(this.bestScore, finalScore);
    try {
      localStorage.setItem("unipix_best", String(best));
    } catch {}

    this.time.delayedCall(700, () => {
      this.game.events.emit("gameover", { score: finalScore, distance: finalDist, best } as GameOverPayload);
    });
  }
}
