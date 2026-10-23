/**
 * particle-system.js
 * High-performance 60FPS particle system for glowing chalk dust, rainbow trails,
 * footprint ripples, starbursts, and celebration confetti.
 */

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.ripples = [];
    this.confetti = [];
    this.maxParticles = 600;
  }

  // Clear all active particles
  clear() {
    this.particles = [];
    this.ripples = [];
    this.confetti = [];
  }

  // Emit glowing chalk dust along finger / foot path
  emitChalkTrail(x, y, color = '#FFD166', size = 16, count = 3) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (size * 0.6) + size * 0.4,
        color: color,
        alpha: 0.95,
        decay: Math.random() * 0.02 + 0.015,
        type: 'dust'
      });
    }
  }

  // Emit starburst when a stroke or checkpoint is reached
  emitStarBurst(x, y, color = '#FFD166', count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 4 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 6,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.02,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'star'
      });
    }
  }

  // Emit expanding magic ripple when stepping on the floor (Stomp mode)
  emitRipple(x, y, color = '#00B4D8') {
    this.ripples.push({
      x,
      y,
      radius: 5,
      maxRadius: 80,
      color,
      alpha: 0.9,
      decay: 0.02
    });
  }

  // Trigger grand victory confetti shower
  triggerConfetti(count = 120) {
    const palette = ['#FF477E', '#00B4D8', '#FFB703', '#7209B7', '#06D6A0', '#FFD166', '#EF476F'];
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: Math.random() * w,
        y: Math.random() * -h * 0.5,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        sizeW: Math.random() * 12 + 8,
        sizeH: Math.random() * 8 + 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1.0,
        swaySpeed: Math.random() * 0.05 + 0.02,
        swayOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // Draw 5-pointed star helper
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, alpha, rotation = 0) {
    let rot = (Math.PI / 2) * 3 + rotation;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
  }

  // Update and render all particles
  render() {
    const ctx = this.ctx;
    const h = this.canvas.height;

    // 1. Render floor ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 2.2;
      r.alpha -= r.decay;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      // Draw elliptical ripple to match floor perspective
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = r.alpha;
      ctx.shadowBlur = 15;
      ctx.shadowColor = r.color;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Render chalk dust & stars with additive blending
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'star') {
        p.rotation += p.vRot;
        this.drawStar(ctx, p.x, p.y, 5, p.size, p.size * 0.45, p.color, p.alpha, p.rotation);
      } else {
        // Glowing chalk dust circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.fill();
      }
    }
    ctx.restore();

    // 3. Render celebratory confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx + Math.sin(c.swayOffset) * 1.5;
      c.y += c.vy;
      c.swayOffset += c.swaySpeed;
      c.rotation += c.vRot;

      if (c.y > h + 20) {
        this.confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.alpha;
      ctx.fillRect(-c.sizeW / 2, -c.sizeH / 2, c.sizeW, c.sizeH);
      ctx.restore();
    }
  }
}
