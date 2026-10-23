/**
 * mascot-guide.js
 * "Show Me First" animated stroke demonstration and encouraging mascot guide.
 */

export class MascotGuide {
  constructor(floorAR, particleSystem, audioManager) {
    this.floorAR = floorAR;
    this.particles = particleSystem;
    this.audio = audioManager;

    this.isPlayingDemo = false;
    this.demoProgress = 0; // 0 to 1
    this.currentStrokeIdx = 0;
    this.demoSpeed = 0.007; // Speed of demonstration
    this.mascotPos = { x: 0, y: 0 };
    this.speechBubble = '';
    this.showSpeechBubble = false;
    this.bubbleTimer = null;
  }

  // Trigger automated demonstration for the current letter
  startDemo(letterItem, onComplete = null) {
    if (this.isPlayingDemo || !letterItem) return;

    this.isPlayingDemo = true;
    this.currentStrokeIdx = 0;
    this.demoProgress = 0;
    this.targetLetter = letterItem;
    this.onComplete = onComplete;

    this.say(`Watch me trace letter ${letterItem.letter}! ${letterItem.guide}`, 4000);
    this.audio.speak(`Watch me trace the letter ${letterItem.letter}! ${letterItem.guide}`);
  }

  // Display speech bubble
  say(text, duration = 3000) {
    this.speechBubble = text;
    this.showSpeechBubble = true;
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.showSpeechBubble = false;
    }, duration);
  }

  stopDemo() {
    this.isPlayingDemo = false;
    this.showSpeechBubble = false;
  }

  // Update animation frame
  update() {
    if (!this.isPlayingDemo || !this.targetLetter) return;

    const stroke = this.targetLetter.strokes[this.currentStrokeIdx];
    if (!stroke) {
      this.finishDemo();
      return;
    }

    const checkpoints = stroke.checkpoints;
    const totalPoints = checkpoints.length - 1;
    const currentFloatIndex = this.demoProgress * totalPoints;
    const idx = Math.floor(currentFloatIndex);
    const frac = currentFloatIndex - idx;

    const p0 = checkpoints[Math.min(idx, totalPoints)];
    const p1 = checkpoints[Math.min(idx + 1, totalPoints)];

    // Interpolate
    const normX = p0.x + (p1.x - p0.x) * frac;
    const normY = p0.y + (p1.y - p0.y) * frac;

    // Convert to canvas pixel position
    const cPos = this.floorAR.mapPointToCanvas(normX, normY);
    this.mascotPos.x = cPos.x;
    this.mascotPos.y = cPos.y;

    // Emit fairy sparkles along the demo path
    this.particles.emitChalkTrail(cPos.x, cPos.y, '#FFD166', 14, 2);
    this.audio.playSparkle();

    // Advance progress
    this.demoProgress += this.demoSpeed;

    if (this.demoProgress >= 1.0) {
      // Stroke complete
      this.particles.emitStarBurst(cPos.x, cPos.y, '#06D6A0', 16);
      this.audio.playStrokeSuccess();
      this.currentStrokeIdx++;
      this.demoProgress = 0;

      if (this.currentStrokeIdx >= this.targetLetter.strokes.length) {
        this.finishDemo();
      }
    }
  }

  finishDemo() {
    this.isPlayingDemo = false;
    this.say("Your turn! Reach down and trace on the floor!", 3500);
    this.audio.speak("Your turn! Trace on the floor!");
    if (this.onComplete) {
      this.onComplete();
    }
  }

  // Render mascot on canvas
  render(ctx) {
    if (!this.isPlayingDemo) return;

    ctx.save();
    const { x, y } = this.mascotPos;

    // Draw magical glowing wand / star mascot
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD166';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪄', x + 15, y - 15);

    // Speech bubble
    if (this.showSpeechBubble && this.speechBubble) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 14px Quicksand, sans-serif';
      const textWidth = ctx.measureText(this.speechBubble).width;
      const bW = Math.min(textWidth + 24, 320);
      const bH = 38;
      const bX = Math.max(20, Math.min(x - bW / 2, ctx.canvas.width - bW - 20));
      const bY = Math.max(20, y - 65);

      // Bubble rectangle
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 12);
      ctx.fill();

      // Bubble text
      ctx.fillStyle = '#1A1A2E';
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.speechBubble, bX + bW / 2, bY + bH / 2);
    }

    ctx.restore();
  }
}
