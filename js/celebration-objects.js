/**
 * celebration-objects.js
 * Interactive, lively, physics-based end-of-level celebration animations
 * for objects related to traced letters, numbers, and shapes.
 */

export class CelebrationObjectRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.activeObject = null;
    this.animTime = 0;
    this.bounceScale = 0;
    this.targetScale = 1;
    this.rot = 0;
    this.sparks = [];
    this.isInteractive = true;

    this.initInteractivity();
  }

  initInteractivity() {
    const handleTap = (e) => {
      if (!this.activeObject) return;
      // Trigger playful squash & bounce on tap/click
      this.bounceScale = 1.35;
      this.emitObjectSparks(this.canvas.width / 2, this.canvas.height / 2, 20);
    };
    this.canvas.addEventListener('click', handleTap);
    this.canvas.addEventListener('touchstart', handleTap, { passive: true });
  }

  // Start animated celebration for completed level
  start(item) {
    this.activeObject = item.celebrationObject || { type: 'star', title: item.word || 'Super Star!' };
    this.activeItem = item;
    this.animTime = 0;
    this.bounceScale = 0.1;
    this.targetScale = 1.0;
    this.sparks = [];

    // Initial burst of sparks
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.emitObjectSparks(cx, cy, 35);
  }

  stop() {
    this.activeObject = null;
    this.sparks = [];
  }

  emitObjectSparks(cx, cy, count = 25) {
    const colors = ['#FFD166', '#06D6A0', '#FF477E', '#4CC9F0', '#7209B7', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 3;
      this.sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  render() {
    if (!this.activeObject) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2 - 10;

    this.animTime += 0.04;
    // Spring physics for entrance bounce
    this.bounceScale += (this.targetScale - this.bounceScale) * 0.12;

    ctx.save();

    // 1. Render glowing radiant halo behind the object
    const haloRadius = 110 + Math.sin(this.animTime * 3) * 12;
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, haloRadius);
    grad.addColorStop(0, 'rgba(255, 209, 102, 0.45)');
    grad.addColorStop(0.6, 'rgba(255, 71, 126, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Render specific animated object
    ctx.save();
    ctx.translate(cx, cy);
    const squishY = this.bounceScale * (1 + Math.sin(this.animTime * 4) * 0.06);
    const squishX = this.bounceScale * (1 - Math.sin(this.animTime * 4) * 0.06);
    ctx.scale(squishX, squishY);

    const type = this.activeObject.type || 'star';
    this.drawSpecificObject(ctx, type);
    ctx.restore();

    // 3. Render sparks & fairy dust
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.12; // Gravity
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.color;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawSpecificObject(ctx, type) {
    ctx.shadowBlur = 20;

    switch (type) {
      case 'apple':
        this.drawApple(ctx);
        break;
      case 'butterfly':
        this.drawButterfly(ctx);
        break;
      case 'cat':
        this.drawCat(ctx);
        break;
      case 'sun':
        this.drawSun(ctx);
        break;
      case 'pizza':
        this.drawPizza(ctx);
        break;
      case 'balloons':
        this.drawBalloons(ctx);
        break;
      case 'heart':
        this.drawHeart(ctx);
        break;
      case 'star':
      default:
        this.drawMagicStar(ctx);
        break;
    }
  }

  // 🍎 Animated Apple: Slices open, drops seeds, cheerful wink
  drawApple(ctx) {
    ctx.shadowColor = 'rgba(239, 71, 111, 0.7)';

    // Apple body (Red gradient)
    const grad = ctx.createRadialGradient(-20, -20, 10, 0, 0, 75);
    grad.addColorStop(0, '#FF4D6D');
    grad.addColorStop(0.8, '#D90429');
    grad.addColorStop(1, '#9B0017');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, -35);
    // Left lobe
    ctx.bezierCurveTo(-50, -65, -80, -10, -75, 35);
    ctx.bezierCurveTo(-70, 75, -25, 80, 0, 65);
    // Right lobe
    ctx.bezierCurveTo(25, 80, 70, 75, 75, 35);
    ctx.bezierCurveTo(80, -10, 50, -65, 0, -35);
    ctx.fill();

    // Apple stalk / stem
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.quadraticCurveTo(8, -60, 20, -65);
    ctx.strokeStyle = '#6F4E37';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Cute green leaf
    ctx.beginPath();
    ctx.moveTo(5, -48);
    ctx.quadraticCurveTo(35, -70, 40, -45);
    ctx.quadraticCurveTo(20, -38, 5, -48);
    ctx.fillStyle = '#06D6A0';
    ctx.fill();

    // Cute kawaii eyes
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.arc(-24, 10, 7, 0, Math.PI * 2);
    ctx.arc(24, 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkle highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-26, 8, 2.5, 0, Math.PI * 2);
    ctx.arc(22, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute smile
    ctx.beginPath();
    ctx.arc(0, 22, 10, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Cheerful blush
    ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-38, 22, 8, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(38, 22, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🦋 Animated Butterfly: Flaps wings dynamically
  drawButterfly(ctx) {
    ctx.shadowColor = 'rgba(0, 180, 216, 0.8)';
    const flap = Math.sin(this.animTime * 10);
    const wingScaleX = 0.35 + 0.65 * Math.abs(flap);

    // Left Wing
    ctx.save();
    ctx.scale(wingScaleX, 1);
    const lGrad = ctx.createLinearGradient(-80, -60, 0, 60);
    lGrad.addColorStop(0, '#7209B7');
    lGrad.addColorStop(0.5, '#4361EE');
    lGrad.addColorStop(1, '#4CC9F0');
    ctx.fillStyle = lGrad;

    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-90, -85, -110, -20, -50, 10);
    ctx.bezierCurveTo(-90, 50, -40, 85, 0, 30);
    ctx.fill();

    // Wing yellow spots
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(-45, -25, 9, 0, Math.PI * 2);
    ctx.arc(-30, 40, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.scale(-wingScaleX, 1);
    ctx.fillStyle = lGrad;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-90, -85, -110, -20, -50, 10);
    ctx.bezierCurveTo(-90, 50, -40, 85, 0, 30);
    ctx.fill();

    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(-45, -25, 9, 0, Math.PI * 2);
    ctx.arc(-30, 40, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Butterfly body & head
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.ellipse(0, 8, 7, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -32, 10, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, -38);
    ctx.quadraticCurveTo(-18, -60, -22, -55);
    ctx.moveTo(4, -38);
    ctx.quadraticCurveTo(18, -60, 22, -55);
    ctx.stroke();
  }

  // 🐱 Animated Cat: Blinking eyes, twitching ears
  drawCat(ctx) {
    ctx.shadowColor = 'rgba(255, 183, 3, 0.8)';

    // Face circle
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    const earWiggle = Math.sin(this.animTime * 6) * 4;
    ctx.beginPath();
    ctx.moveTo(-50, -30);
    ctx.lineTo(-65 + earWiggle, -85);
    ctx.lineTo(-20, -55);
    ctx.fillStyle = '#FFAA00';
    ctx.fill();

    // Inner pink ear
    ctx.beginPath();
    ctx.moveTo(-45, -35);
    ctx.lineTo(-58 + earWiggle, -75);
    ctx.lineTo(-25, -52);
    ctx.fillStyle = '#FF477E';
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(50, -30);
    ctx.lineTo(65 - earWiggle, -85);
    ctx.lineTo(20, -55);
    ctx.fillStyle = '#FFAA00';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(45, -35);
    ctx.lineTo(58 - earWiggle, -75);
    ctx.lineTo(25, -52);
    ctx.fillStyle = '#FF477E';
    ctx.fill();

    // Eyes (blink every few seconds)
    const isBlinking = Math.sin(this.animTime * 2) > 0.94;
    ctx.fillStyle = '#1A1A2E';
    if (isBlinking) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1A1A2E';
      ctx.beginPath();
      ctx.moveTo(-32, -5);
      ctx.lineTo(-12, -5);
      ctx.moveTo(12, -5);
      ctx.lineTo(32, -5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(-22, -5, 8, 0, Math.PI * 2);
      ctx.arc(22, -5, 8, 0, Math.PI * 2);
      ctx.fill();

      // Eye glints
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-24, -8, 3, 0, Math.PI * 2);
      ctx.arc(20, -8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Little pink nose
    ctx.fillStyle = '#FF477E';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-7, 4);
    ctx.lineTo(7, 4);
    ctx.closePath();
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Left whiskers
    ctx.moveTo(-25, 12); ctx.lineTo(-65, 8);
    ctx.moveTo(-25, 18); ctx.lineTo(-65, 24);
    // Right whiskers
    ctx.moveTo(25, 12); ctx.lineTo(65, 8);
    ctx.moveTo(25, 18); ctx.lineTo(65, 24);
    ctx.stroke();
  }

  // ☀️ Animated Sun: Rotating rays and sunglasses
  drawSun(ctx) {
    ctx.shadowColor = 'rgba(255, 209, 102, 0.9)';

    // Rotating Sunbeams
    ctx.save();
    ctx.rotate(this.animTime * 0.8);
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      ctx.rotate((Math.PI * 2) / rays);
      ctx.fillStyle = i % 2 === 0 ? '#FFD166' : '#FF9F1C';
      ctx.beginPath();
      ctx.moveTo(-9, -60);
      ctx.lineTo(0, -92);
      ctx.lineTo(9, -60);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Main Sun Circle
    const sGrad = ctx.createRadialGradient(-15, -15, 10, 0, 0, 58);
    sGrad.addColorStop(0, '#FFF3B0');
    sGrad.addColorStop(0.7, '#FFD166');
    sGrad.addColorStop(1, '#FF9F1C');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();

    // Cool sunglasses
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.roundRect(-42, -18, 36, 22, 6);
    ctx.roundRect(6, -18, 36, 22, 6);
    ctx.fill();

    // Glasses bridge
    ctx.fillRect(-8, -12, 16, 5);

    // Glasses lens reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, -14); ctx.lineTo(-14, 0);
    ctx.moveTo(14, -14); ctx.lineTo(34, 0);
    ctx.stroke();

    // Cheerful big smile
    ctx.beginPath();
    ctx.arc(0, 20, 18, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#D90429';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // 🍕 Animated Pizza Slice: Gooey cheese & pepperonis
  drawPizza(ctx) {
    ctx.shadowColor = 'rgba(251, 133, 0, 0.8)';

    // Golden Crust on top
    ctx.fillStyle = '#C68B59';
    ctx.beginPath();
    ctx.ellipse(0, -60, 68, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Triangle cheesy body
    ctx.fillStyle = '#FFC000';
    ctx.beginPath();
    ctx.moveTo(-60, -60);
    ctx.lineTo(60, -60);
    ctx.lineTo(0, 68);
    ctx.closePath();
    ctx.fill();

    // Red sauce peeking through
    ctx.fillStyle = '#D90429';
    ctx.beginPath();
    ctx.arc(-22, -28, 12, 0, Math.PI * 2);
    ctx.arc(20, -18, 10, 0, Math.PI * 2);
    ctx.arc(-5, 18, 9, 0, Math.PI * 2);
    ctx.fill();

    // Cheerful face
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.arc(-14, -8, 5, 0, Math.PI * 2);
    ctx.arc(14, -8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#1A1A2E';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 🎈 Animated Floating Balloons
  drawBalloons(ctx) {
    const colors = ['#FF477E', '#06D6A0', '#4CC9F0'];
    const offsets = [
      { x: -32, y: -20, color: colors[0] },
      { x: 30, y: -25, color: colors[1] },
      { x: 0, y: -50, color: colors[2] }
    ];

    // Strings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    offsets.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + 26);
      ctx.quadraticCurveTo(b.x * 0.5, 20, 0, 50);
      ctx.stroke();
    });

    // Balloons
    offsets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, 24, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Balloon highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(b.x - 7, b.y - 12, 6, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ❤️ Animated Heart
  drawHeart(ctx) {
    ctx.shadowColor = 'rgba(239, 71, 111, 0.9)';
    ctx.fillStyle = '#EF476F';

    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.bezierCurveTo(-55, 0, -65, -45, -25, -55);
    ctx.bezierCurveTo(0, -60, 0, -25, 0, -25);
    ctx.bezierCurveTo(0, -25, 0, -60, 25, -55);
    ctx.bezierCurveTo(65, -45, 55, 0, 0, 40);
    ctx.fill();

    // Cute eyes & smile
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-14, -12, 6, 0, Math.PI * 2);
    ctx.arc(14, -12, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.arc(-13, -12, 3.5, 0, Math.PI * 2);
    ctx.arc(15, -12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ⭐ Animated Supernova Golden Star
  drawMagicStar(ctx) {
    ctx.shadowColor = 'rgba(255, 209, 102, 0.9)';
    ctx.fillStyle = '#FFD166';

    const spikes = 5;
    const outerRadius = 65;
    const innerRadius = 30;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(0, -outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = Math.cos(rot) * outerRadius;
      let y = Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();

    // Cute kawaii eyes
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.arc(-15, -2, 6, 0, Math.PI * 2);
    ctx.arc(15, -2, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-17, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(13, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Big happy smile
    ctx.beginPath();
    ctx.arc(0, 8, 12, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#1A1A2E';
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }
}
