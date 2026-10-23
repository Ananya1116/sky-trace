/**
 * floor-ar.js
 * Augmented Reality Floor Plane projection, perspective grid,
 * and coordinate mapping for floor-based tracing.
 */

export class FloorAREngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Default floor bounding box (normalized coordinates 0 to 1)
    // Centered comfortably in the lower 75% of the camera view
    this.bounds = {
      x: 0.18,
      y: 0.15,
      width: 0.64,
      height: 0.70
    };

    // Floor perspective slant (for 3D floor effect)
    this.perspectiveSlant = 0.12; // Top is 12% narrower to match downward camera tilt
    this.enablePerspective = true;
    this.showFloorGrid = true;
    this.isCalibrating = false;
    this.gridAnimationPhase = 0;
  }

  // Get current letter bounding box in actual canvas pixel coordinates
  getLetterPixelBounds() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const left = this.bounds.x * w;
    const top = this.bounds.y * h;
    const width = this.bounds.width * w;
    const height = this.bounds.height * h;

    return { left, top, width, height, right: left + width, bottom: top + height };
  }

  // Map normalized stroke coordinates (0..1) to canvas pixel coordinates on the floor plane
  mapPointToCanvas(normX, normY) {
    const bounds = this.getLetterPixelBounds();

    if (!this.enablePerspective) {
      return {
        x: bounds.left + normX * bounds.width,
        y: bounds.top + normY * bounds.height
      };
    }

    // Apply perspective trapezoid transform:
    // Near the top (normY = 0), width is narrower. Near the bottom (normY = 1), width is wider.
    const depthFactor = normY; // 0 = back, 1 = front
    const widthRatio = (1 - this.perspectiveSlant) + (this.perspectiveSlant * 2) * depthFactor;
    const currentWidth = bounds.width * widthRatio;
    const centerX = bounds.left + bounds.width * 0.5;
    const offsetX = (normX - 0.5) * currentWidth;

    return {
      x: centerX + offsetX,
      y: bounds.top + normY * bounds.height
    };
  }

  // Reverse map: Given a detected camera / screen coordinate (cx, cy),
  // convert back to normalized stroke space (0..1)
  mapCanvasToNormalized(cx, cy) {
    const bounds = this.getLetterPixelBounds();
    const normY = (cy - bounds.top) / bounds.height;

    if (!this.enablePerspective) {
      const normX = (cx - bounds.left) / bounds.width;
      return { x: normX, y: normY };
    }

    const depthFactor = Math.max(0, Math.min(1, normY));
    const widthRatio = (1 - this.perspectiveSlant) + (this.perspectiveSlant * 2) * depthFactor;
    const currentWidth = bounds.width * widthRatio;
    const centerX = bounds.left + bounds.width * 0.5;
    const normX = (cx - centerX) / currentWidth + 0.5;

    return { x: normX, y: normY };
  }

  // Render glowing floor grid and boundary markers
  renderFloorGrid() {
    if (!this.showFloorGrid) return;
    const ctx = this.ctx;
    const bounds = this.getLetterPixelBounds();
    this.gridAnimationPhase += 0.02;

    const corners = [
      this.mapPointToCanvas(0, 0),
      this.mapPointToCanvas(1, 0),
      this.mapPointToCanvas(1, 1),
      this.mapPointToCanvas(0, 1)
    ];

    ctx.save();

    // 1. Draw glowing floor arena boundary
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();

    // Subtle soft floor glow fill
    const gradient = ctx.createLinearGradient(0, bounds.top, 0, bounds.bottom);
    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.04)');
    gradient.addColorStop(1, 'rgba(114, 9, 183, 0.09)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Floor boundary line
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -this.gridAnimationPhase * 12;
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw subtle perspective grid lines
    const gridCols = 6;
    const gridRows = 6;
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.12)';
    ctx.lineWidth = 1.0;

    // Longitudinal lines
    for (let c = 1; c < gridCols; c++) {
      const pTop = this.mapPointToCanvas(c / gridCols, 0);
      const pBottom = this.mapPointToCanvas(c / gridCols, 1);
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.stroke();
    }

    // Latitudinal lines
    for (let r = 1; r < gridRows; r++) {
      const pLeft = this.mapPointToCanvas(0, r / gridRows);
      const pRight = this.mapPointToCanvas(1, r / gridRows);
      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.stroke();
    }

    // 3. Corner guide badges
    corners.forEach((corner, idx) => {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#4CC9F0';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4CC9F0';
      ctx.fill();
    });

    // 4. Floor Label Badge
    const labelX = (corners[2].x + corners[3].x) / 2;
    const labelY = (corners[2].y + corners[3].y) / 2 + 22;

    ctx.font = '600 13px Quicksand, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#000';
    ctx.fillText('✨ MAGIC FLOOR PLAY ZONE ✨', labelX, labelY);

    ctx.restore();
  }
}
