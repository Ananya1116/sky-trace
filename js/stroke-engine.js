/**
 * stroke-engine.js
 * Intelligent stroke progression engine with real-time green (correct)
 * vs red (incorrect) visual feedback, tolerance bounds, and checkpoint validation.
 */

export class StrokeEngine {
  constructor(floorAR, particleSystem, audioManager) {
    this.floorAR = floorAR;
    this.particles = particleSystem;
    this.audio = audioManager;

    this.currentLetter = null;
    this.currentStrokeIdx = 0;
    this.completedStrokeIndices = [];
    this.activeStrokeCheckpointsReached = [];
    this.userTrail = []; // Array of { x, y, isCorrect, time }
    this.isCompleted = false;

    // Tolerance settings (normalized distance)
    this.toleranceRadius = 0.085;
    this.pulsePhase = 0;

    // Real-time feedback state
    this.lastFeedbackState = 'idle'; // 'correct' | 'incorrect' | 'idle'
    this.lastIncorrectAudioTime = 0;
    this.offTrackCounter = 0;
    this.onTrackCounter = 0;
    this.lastStrayedPos = null;

    // Event callbacks
    this.onStrokeComplete = null;
    this.onLetterComplete = null;
    this.onProgressUpdate = null;
    this.onFeedbackChange = null;
  }

  // Load a new item (Letter, Number, or Shape)
  loadLetter(item) {
    this.currentLetter = item;
    this.reset();
  }

  // Reset progress
  reset() {
    this.currentStrokeIdx = 0;
    this.completedStrokeIndices = [];
    this.activeStrokeCheckpointsReached = [];
    this.userTrail = [];
    this.isCompleted = false;
    this.lastFeedbackState = 'idle';
    this.offTrackCounter = 0;
    this.onTrackCounter = 0;
    this.lastStrayedPos = null;

    if (this.onFeedbackChange) {
      this.onFeedbackChange('idle', 'Touch dot 1 to start tracing!');
    }

    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        strokeIndex: 0,
        totalStrokes: this.currentLetter ? this.currentLetter.strokes.length : 0,
        percent: 0,
        isCompleted: false
      });
    }
  }

  setTolerance(radius) {
    this.toleranceRadius = radius;
  }

  // Process detected cursor (cx, cy in canvas pixel coordinates)
  processCursor(cx, cy, isDrawing = true) {
    if (!this.currentLetter || this.isCompleted || !isDrawing) {
      this.lastFeedbackState = 'idle';
      return;
    }

    const activeStroke = this.currentLetter.strokes[this.currentStrokeIdx];
    if (!activeStroke) return;

    const checkpoints = activeStroke.checkpoints;
    const reachedCount = this.activeStrokeCheckpointsReached.length;
    const targetIdx = reachedCount;

    if (targetIdx >= checkpoints.length) return;

    // Target checkpoint
    const targetPoint = checkpoints[targetIdx];
    const targetCanvasPos = this.floorAR.mapPointToCanvas(targetPoint.x, targetPoint.y);

    // Compute distance to target checkpoint and to the nearest stroke segment
    const bounds = this.floorAR.getLetterPixelBounds();
    const pixelTolerance = this.toleranceRadius * Math.min(bounds.width, bounds.height);
    const distToTarget = Math.hypot(cx - targetCanvasPos.x, cy - targetCanvasPos.y);

    // ---------------------------------------------------------
    // REQUIRE STARTING NEAR THE DESIGNATED STARTING DOT
    // ---------------------------------------------------------
    if (reachedCount === 0) {
      if (distToTarget <= pixelTolerance * 1.6) {
        // Successfully started at the start dot!
        this.activeStrokeCheckpointsReached.push(0);
        this.lastFeedbackState = 'correct';
        this.particles.emitStarBurst(targetCanvasPos.x, targetCanvasPos.y, '#FBBF24', 12);
        this.audio.playCheckpoint();
        this.userTrail.push({
          x: cx,
          y: cy,
          isCorrect: true,
          color: '#FBBF24',
          glowColor: 'rgba(251, 191, 36, 0.6)'
        });
        if (this.onFeedbackChange) {
          this.onFeedbackChange('correct', '✨ Great start! Now trace along the arrows!');
        }
      } else {
        // Child hasn't reached the start dot yet
        this.lastFeedbackState = 'idle';
        if (this.onFeedbackChange) {
          this.onFeedbackChange('idle', `👉 Touch start dot ${activeStroke.label} to begin!`);
        }
      }
      return;
    }

    // Distance to the line between previous checkpoint and current target
    const prevIdx = Math.max(0, targetIdx - 1);
    const prevPoint = checkpoints[prevIdx];
    const prevCanvasPos = this.floorAR.mapPointToCanvas(prevPoint.x, prevPoint.y);
    const distToSegment = this.distancePointToSegment(cx, cy, prevCanvasPos.x, prevCanvasPos.y, targetCanvasPos.x, targetCanvasPos.y);

    const minEffectiveDist = Math.min(distToTarget, distToSegment);

    // ---------------------------------------------------------
    // 1. EVALUATE CORRECT VS INCORRECT TRACING
    // ---------------------------------------------------------
    if (minEffectiveDist <= pixelTolerance * 1.45) {
      // ✅ CORRECT TRACING: Warm amber-gold feedback
      this.lastFeedbackState = 'correct';
      this.onTrackCounter++;
      this.lastStrayedPos = null;

      // Add to user trail with soft warm-amber gradient
      const trailProgress = this.activeStrokeCheckpointsReached.length / Math.max(1, (this.currentLetter?.strokes[this.currentStrokeIdx]?.checkpoints?.length || 20));
      // Interpolate from warm amber (#FBBF24) to soft sky (#7DD3FC) as stroke progresses
      const r = Math.round(251 + (125 - 251) * trailProgress);
      const g = Math.round(191 + (211 - 191) * trailProgress);
      const b = Math.round(36  + (252 - 36)  * trailProgress);
      const trailColor = `rgb(${r},${g},${b})`;
      this.userTrail.push({
        x: cx,
        y: cy,
        isCorrect: true,
        color: trailColor,
        glowColor: `rgba(${r},${g},${b},0.55)`
      });

      // Emit soft warm sparkles
      this.particles.emitChalkTrail(cx, cy, '#FBBF24', 12, 1.5);
      this.audio.playSparkle();

      if (this.onFeedbackChange) {
        this.onFeedbackChange('correct', '✨ Super! Keep tracing along the line!');
      }

      // Check if target checkpoint is reached
      if (distToTarget <= pixelTolerance * 1.15) {
        this.activeStrokeCheckpointsReached.push(targetIdx);
        this.particles.emitStarBurst(targetCanvasPos.x, targetCanvasPos.y, '#00F5D4', 10);
        this.audio.playCheckpoint();

        if (this.activeStrokeCheckpointsReached.length >= checkpoints.length) {
          this.completeCurrentStroke();
        } else {
          this.notifyProgress();
        }
      }
    } else {
      // ❌ INCORRECT TRACING: Soft rose/blush feedback
      this.lastFeedbackState = 'incorrect';
      this.offTrackCounter++;
      this.lastStrayedPos = { x: cx, y: cy, targetX: targetCanvasPos.x, targetY: targetCanvasPos.y };

      // Add to user trail with soft rose-blush color (not harsh red)
      this.userTrail.push({
        x: cx,
        y: cy,
        isCorrect: false,
        color: 'rgba(251, 113, 133, 0.85)',
        glowColor: 'rgba(251, 113, 133, 0.35)'
      });

      // Emit soft blush warning dust
      this.particles.emitChalkTrail(cx, cy, '#FB7185', 8, 1.5);

      // Play soft "oops" sound (throttled every 500ms)
      const nowMs = performance.now();
      if (nowMs - this.lastIncorrectAudioTime > 500) {
        this.lastIncorrectAudioTime = nowMs;
        this.audio.playError();
      }

      if (this.onFeedbackChange) {
        this.onFeedbackChange('incorrect', '⚠️ Oops! Follow the dotted line 🎯');
      }
    }

    // Keep trail length optimized
    if (this.userTrail.length > 250) {
      this.userTrail.shift();
    }
  }

  // Helper: calculate distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
  distancePointToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  }

  completeCurrentStroke() {
    this.completedStrokeIndices.push(this.currentStrokeIdx);
    const completedStroke = this.currentLetter.strokes[this.currentStrokeIdx];

    const lastPoint = completedStroke.checkpoints[completedStroke.checkpoints.length - 1];
    const pos = this.floorAR.mapPointToCanvas(lastPoint.x, lastPoint.y);
    this.particles.emitStarBurst(pos.x, pos.y, '#06D6A0', 28);
    this.audio.playStrokeSuccess();

    if (this.onStrokeComplete) {
      this.onStrokeComplete(this.currentStrokeIdx);
    }

    if (this.currentStrokeIdx + 1 < this.currentLetter.strokes.length) {
      this.currentStrokeIdx++;
      this.activeStrokeCheckpointsReached = [];
      this.notifyProgress();
    } else {
      this.completeLetter();
    }
  }

  completeLetter() {
    this.isCompleted = true;
    this.particles.triggerConfetti(160);
    this.audio.playVictory();

    // Calculate stars: 3 stars if high accuracy, 2 stars if some straying, 1 star for completion
    const accuracy = this.onTrackCounter / Math.max(1, this.onTrackCounter + this.offTrackCounter);
    const stars = accuracy > 0.85 ? 3 : accuracy > 0.65 ? 2 : 1;

    this.notifyProgress();

    if (this.onLetterComplete) {
      this.onLetterComplete(this.currentLetter, stars);
    }
  }

  notifyProgress() {
    if (!this.onProgressUpdate || !this.currentLetter) return;
    const totalStrokes = this.currentLetter.strokes.length;
    const completedCount = this.completedStrokeIndices.length;
    const activeStroke = this.currentLetter.strokes[this.currentStrokeIdx];
    const strokeProgress = activeStroke ? (this.activeStrokeCheckpointsReached.length / activeStroke.checkpoints.length) : 0;
    const percent = Math.min(100, Math.round(((completedCount + strokeProgress) / totalStrokes) * 100));

    this.onProgressUpdate({
      strokeIndex: this.currentStrokeIdx,
      totalStrokes,
      percent,
      isCompleted: this.isCompleted
    });
  }

  // Render the prescribed path with green / red feedback
  render(ctx) {
    if (!this.currentLetter) return;
    this.pulsePhase += 0.05;

    ctx.save();

    // 1. Render all stroke template guides
    this.currentLetter.strokes.forEach((stroke, sIdx) => {
      const isCompleted = this.completedStrokeIndices.includes(sIdx);
      const isActive = sIdx === this.currentStrokeIdx && !this.isCompleted;

      ctx.beginPath();
      stroke.checkpoints.forEach((pt, pIdx) => {
        const cPos = this.floorAR.mapPointToCanvas(pt.x, pt.y);
        if (pIdx === 0) ctx.moveTo(cPos.x, cPos.y);
        else ctx.lineTo(cPos.x, cPos.y);
      });

      if (isCompleted) {
        // Fully completed stroke — soft warm peach gradient
        const cpFirst = this.floorAR.mapPointToCanvas(stroke.checkpoints[0].x, stroke.checkpoints[0].y);
        const cpLast  = this.floorAR.mapPointToCanvas(stroke.checkpoints[stroke.checkpoints.length - 1].x, stroke.checkpoints[stroke.checkpoints.length - 1].y);
        const compGrad = ctx.createLinearGradient(cpFirst.x, cpFirst.y, cpLast.x, cpLast.y);
        compGrad.addColorStop(0, 'rgba(253, 186, 116, 0.92)');  // warm peach
        compGrad.addColorStop(1, 'rgba(167, 243, 208, 0.92)');  // soft mint
        ctx.strokeStyle = compGrad;
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(253, 186, 116, 0.5)';
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 0;
        ctx.stroke();
      } else if (isActive) {
        // Active stroke guide — clean dashed white track
        const pulse = Math.sin(this.pulsePhase * 2) * 0.15 + 0.85;

        // Wide soft guiding track
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.28 * pulse})`;
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([14, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Highlight completed portion with soft amber→sky gradient
        if (this.activeStrokeCheckpointsReached.length > 0) {
          ctx.beginPath();
          for (let i = 0; i <= this.activeStrokeCheckpointsReached.length; i++) {
            const pt = stroke.checkpoints[Math.min(i, stroke.checkpoints.length - 1)];
            const cPos = this.floorAR.mapPointToCanvas(pt.x, pt.y);
            if (i === 0) ctx.moveTo(cPos.x, cPos.y);
            else ctx.lineTo(cPos.x, cPos.y);
          }
          const pFirst = this.floorAR.mapPointToCanvas(stroke.checkpoints[0].x, stroke.checkpoints[0].y);
          const pReached = this.floorAR.mapPointToCanvas(
            stroke.checkpoints[Math.min(this.activeStrokeCheckpointsReached.length, stroke.checkpoints.length - 1)].x,
            stroke.checkpoints[Math.min(this.activeStrokeCheckpointsReached.length, stroke.checkpoints.length - 1)].y
          );
          const activeGrad = ctx.createLinearGradient(pFirst.x, pFirst.y, pReached.x, pReached.y);
          activeGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');   // warm amber
          activeGrad.addColorStop(1, 'rgba(125, 211, 252, 0.9)');  // soft sky blue
          ctx.strokeStyle = activeGrad;
          ctx.lineWidth = 16;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        // Future stroke template (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 2. Render user's drawn trail — soft gradient segments, no harsh neon
    if (this.userTrail.length > 1) {
      for (let i = 1; i < this.userTrail.length; i++) {
        const p1 = this.userTrail[i - 1];
        const p2 = this.userTrail[i];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = p2.color;
        ctx.lineWidth = p2.isCorrect ? 9 : 7;
        ctx.lineCap = 'round';
        ctx.shadowBlur = p2.isCorrect ? 6 : 4;
        ctx.shadowColor = p2.glowColor;
        ctx.globalAlpha = 0.82;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }

    // 3. Render stroke starting badges ("1", "2", "3")
    this.currentLetter.strokes.forEach((stroke, sIdx) => {
      const isCompleted = this.completedStrokeIndices.includes(sIdx);
      const isActive = sIdx === this.currentStrokeIdx && !this.isCompleted;
      const startPt = stroke.checkpoints[0];
      const startPos = this.floorAR.mapPointToCanvas(startPt.x, startPt.y);

      ctx.beginPath();
      const badgeRadius = isActive ? 18 + Math.sin(this.pulsePhase * 2) * 2 : 14;
      ctx.arc(startPos.x, startPos.y, badgeRadius, 0, Math.PI * 2);

      if (isCompleted) {
        ctx.fillStyle = '#34D399';   // soft mint green
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
      } else if (isActive) {
        ctx.fillStyle = this.lastFeedbackState === 'incorrect' ? '#FB7185' : '#FBBF24';
        ctx.shadowBlur = 12;
        ctx.shadowColor = ctx.fillStyle;
      } else {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.shadowBlur = 0;
      }
      ctx.fill();

      ctx.fillStyle = '#1A1A2E';
      ctx.font = `bold ${isActive ? 14 : 11}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(isCompleted ? '✓' : stroke.label, startPos.x, startPos.y);
    });

    // 4. Render Target Checkpoint Beacon & Guide Arrow if Off Track
    if (!this.isCompleted) {
      const activeStroke = this.currentLetter.strokes[this.currentStrokeIdx];
      if (activeStroke) {
        const nextTargetIdx = this.activeStrokeCheckpointsReached.length;
        if (nextTargetIdx < activeStroke.checkpoints.length) {
          const targetPoint = activeStroke.checkpoints[nextTargetIdx];
          const tPos = this.floorAR.mapPointToCanvas(targetPoint.x, targetPoint.y);

          // Glowing Target Beacon — amber when correct, soft rose when off-track
          const beaconColor = this.lastFeedbackState === 'incorrect' ? '#FB7185' : '#FBBF24';
          const ringRadius = 22 + Math.sin(this.pulsePhase * 3) * 5;

          ctx.beginPath();
          ctx.arc(tPos.x, tPos.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = beaconColor;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = beaconColor;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(tPos.x, tPos.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // If child strayed off track, draw soft rose animated guide arrow back to target
          if (this.lastFeedbackState === 'incorrect' && this.lastStrayedPos) {
            ctx.beginPath();
            ctx.moveTo(this.lastStrayedPos.x, this.lastStrayedPos.y);
            ctx.lineTo(tPos.x, tPos.y);
            ctx.strokeStyle = 'rgba(251, 113, 133, 0.85)';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.lineDashOffset = -this.pulsePhase * 12;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }

    ctx.restore();
  }
}
