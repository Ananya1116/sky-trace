/**
 * mediapipe-service.js
 * Manages MediaPipe Hands and Pose detection pipelines,
 * video stream capture, coordinate smoothing, and cursor emission.
 */

export class MediaPipeService {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;

    this.mode = 'hand'; // 'hand' | 'pose' | 'mouse'
    this.isCameraRunning = false;
    this.cameraInstance = null;
    this.handsInstance = null;
    this.poseInstance = null;

    // Smoothed cursor coordinates
    this.cursor = { x: 0, y: 0, isDrawing: false, visible: false };
    this.smoothAlpha = 0.45; // Smoothing factor (0 = frozen, 1 = raw jitter)

    // Pinch gesture state for hand mode
    this.isPinching = false;
    this.pinchThreshold = 0.07; // Distance between thumb and index tip

    // Callbacks
    this.onCursorUpdate = null;
    this.onStatusChange = null;

    // Setup mouse/touch fallback listeners
    this.initMouseFallback();
  }

  // Update status message
  setStatus(message, isError = false) {
    if (this.onStatusChange) {
      this.onStatusChange(message, isError);
    }
  }

  // Initialize MediaPipe Hands pipeline
  async initHands() {
    if (this.handsInstance) return;
    this.setStatus('Loading MediaPipe Hands AI model...');

    if (typeof window.Hands === 'undefined') {
      throw new Error('MediaPipe Hands library not loaded from CDN.');
    }

    this.handsInstance = new window.Hands({
      locateFile: file => `https://unpkg.com/@mediapipe/hands@0.4.1675469240/${file}`
    });

    this.handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55
    });

    this.handsInstance.onResults(results => this.handleHandResults(results));
  }

  // Initialize MediaPipe Pose pipeline
  async initPose() {
    if (this.poseInstance) return;
    this.setStatus('Loading MediaPipe Pose AI model...');

    if (typeof window.Pose === 'undefined') {
      throw new Error('MediaPipe Pose library not loaded from CDN.');
    }

    this.poseInstance = new window.Pose({
      locateFile: file => `https://unpkg.com/@mediapipe/pose@0.5.1675469404/${file}`
    });

    this.poseInstance.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55
    });

    this.poseInstance.onResults(results => this.handlePoseResults(results));
  }

  // Start webcam video feed with MediaPipe Camera utils
  async startCamera(mode = 'hand') {
    this.mode = mode;
    this.setStatus('Requesting camera access...');

    try {
      if (mode === 'hand') {
        await this.initHands();
      } else if (mode === 'pose') {
        await this.initPose();
      }

      if (!this.cameraInstance && typeof window.Camera !== 'undefined') {
        this.cameraInstance = new window.Camera(this.video, {
          onFrame: async () => {
            if (!this.isCameraRunning) return;
            if (this.mode === 'hand' && this.handsInstance) {
              await this.handsInstance.send({ image: this.video });
            } else if (this.mode === 'pose' && this.poseInstance) {
              await this.poseInstance.send({ image: this.video });
            }
          },
          width: 1280,
          height: 720
        });
      }

      if (this.cameraInstance) {
        await this.cameraInstance.start();
        this.isCameraRunning = true;
        this.setStatus(`Active: ${mode === 'hand' ? '🖐️ Finger Chalk Tracking' : '🦶 Stomp & Hop Tracking'}`);
      }
    } catch (err) {
      console.warn('Camera or MediaPipe initialization error:', err);
      this.setStatus('Webcam not active. Mouse & Touch drawing enabled!', true);
      this.mode = 'mouse';
    }
  }

  // Stop camera feed
  stopCamera() {
    this.isCameraRunning = false;
    if (this.cameraInstance && this.cameraInstance.stop) {
      this.cameraInstance.stop();
    }
  }

  // Switch between Hand and Pose modes
  async setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.cursor.visible = false;

    if (this.isCameraRunning) {
      if (mode === 'hand') {
        await this.initHands();
      } else if (mode === 'pose') {
        await this.initPose();
      }
      this.setStatus(`Switched to ${mode === 'hand' ? '🖐️ Finger Chalk' : mode === 'pose' ? '🦶 Stomp & Hop' : '🖱️ Mouse & Touch'}`);
    }
  }

  // Process Hand Landmark detection
  handleHandResults(results) {
    if (this.mode !== 'hand') return;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.cursor.visible = false;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8]; // Landmark 8: INDEX_FINGER_TIP
    const thumbTip = landmarks[4]; // Landmark 4: THUMB_TIP

    // Measure distance between index tip and thumb tip to detect pinch
    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
    this.isPinching = pinchDist < this.pinchThreshold;

    // In mirrored view: x is inverted (1 - x)
    const rawPixelX = (1 - indexTip.x) * this.canvas.width;
    const rawPixelY = indexTip.y * this.canvas.height;

    // Apply EMA smoothing
    if (!this.cursor.visible) {
      this.cursor.x = rawPixelX;
      this.cursor.y = rawPixelY;
      this.cursor.visible = true;
    } else {
      this.cursor.x += (rawPixelX - this.cursor.x) * this.smoothAlpha;
      this.cursor.y += (rawPixelY - this.cursor.y) * this.smoothAlpha;
    }

    // Always draw in free finger mode (or when pinching if pinch mode is enabled)
    this.cursor.isDrawing = true;

    if (this.onCursorUpdate) {
      this.onCursorUpdate(this.cursor.x, this.cursor.y, this.cursor.isDrawing, {
        landmarks,
        isPinching: this.isPinching,
        mode: 'hand'
      });
    }
  }

  // Process Pose Landmark detection (Stomp & Hop foot mode)
  handlePoseResults(results) {
    if (this.mode !== 'pose') return;

    if (!results.poseLandmarks) {
      this.cursor.visible = false;
      return;
    }

    const lm = results.poseLandmarks;
    // Landmarks 31 (left foot index) and 32 (right foot index)
    // Find the lower foot (higher y value on screen)
    const leftFoot = lm[31] || lm[27];
    const rightFoot = lm[32] || lm[28];

    let activeFoot = leftFoot;
    if (rightFoot && rightFoot.y > (leftFoot ? leftFoot.y : -1)) {
      activeFoot = rightFoot;
    }

    if (!activeFoot || activeFoot.visibility < 0.4) {
      this.cursor.visible = false;
      return;
    }

    // Mirror horizontal axis
    const rawPixelX = (1 - activeFoot.x) * this.canvas.width;
    const rawPixelY = activeFoot.y * this.canvas.height;

    if (!this.cursor.visible) {
      this.cursor.x = rawPixelX;
      this.cursor.y = rawPixelY;
      this.cursor.visible = true;
    } else {
      this.cursor.x += (rawPixelX - this.cursor.x) * (this.smoothAlpha * 0.8);
      this.cursor.y += (rawPixelY - this.cursor.y) * (this.smoothAlpha * 0.8);
    }

    this.cursor.isDrawing = true;

    if (this.onCursorUpdate) {
      this.onCursorUpdate(this.cursor.x, this.cursor.y, this.cursor.isDrawing, {
        isFoot: true,
        mode: 'pose'
      });
    }
  }

  // Seamless Mouse / Touch Fallback for Testing & Tabletop use
  initMouseFallback() {
    let isMouseDown = false;

    const handlePointerMove = (e) => {
      // In mouse mode, or if camera is inactive, allow mouse/touch tracing
      if (this.isCameraRunning && this.mode !== 'mouse') return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const px = (clientX - rect.left) * scaleX;
      const py = (clientY - rect.top) * scaleY;

      this.cursor.x = px;
      this.cursor.y = py;
      this.cursor.visible = true;
      this.cursor.isDrawing = isMouseDown || (Boolean(e.touches) && e.touches.length > 0);

      if (this.onCursorUpdate) {
        this.onCursorUpdate(this.cursor.x, this.cursor.y, this.cursor.isDrawing, { mode: 'mouse' });
      }
    };

    const handlePointerDown = (e) => {
      isMouseDown = true;
      handlePointerMove(e);
    };

    const handlePointerUp = () => {
      isMouseDown = false;
      this.cursor.isDrawing = false;
      if (this.onCursorUpdate) {
        this.onCursorUpdate(this.cursor.x, this.cursor.y, false, { mode: 'mouse' });
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  // Draw glowing cursor reticle on canvas
  renderCursor(ctx) {
    if (!this.cursor.visible) return;

    ctx.save();
    const { x, y } = this.cursor;

    if (this.mode === 'pose') {
      // Foot cursor badge (footprint circle)
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 180, 216, 0.35)';
      ctx.strokeStyle = '#00B4D8';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00B4D8';
      ctx.fill();
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦶', x, y);
    } else {
      // Magic finger cursor reticle
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = this.isPinching ? '#06D6A0' : '#FFD166';
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.isPinching ? '#06D6A0' : '#FFD166';
      ctx.fill();

      // Outer sparkling ring
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}
