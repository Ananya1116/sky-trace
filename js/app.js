/**
 * app.js
 * Main application coordinator for Sky Trace desktop experience.
 *
 * Implements complete island connectivity and navigation:
 * 1. Splash / Welcome -> Onboarding -> World Map
 * 2. World Map -> Small Letters, Capital Letters, Numbers, Shapes, and UNLOCKED Practice Island
 * 3. Dedicated Category Selection Grid for all 4 categories (Small a-z, Capital A-Z, Numbers 0-9, Shapes)
 * 4. Dedicated Guided Air-Tracing Screen with MediaPipe hand tracking, start-point enforcement,
 *    directional guidance, green/red feedback, sequential checkpoints, retry/next, and celebration toast
 * 5. Practice Island interactive game: randomized challenges, streak counter, star rewards, mix filters
 * 6. Full localStorage persistence for all 72 curriculum items + Practice stats
 */

import { CHAPTERS, getRandomPracticeItem } from './curriculum-data.js';
import { ChapterManager } from './chapter-manager.js';
import { ParticleSystem } from './particle-system.js';
import { AudioManager } from './audio-manager.js';
import { FloorAREngine } from './floor-ar.js';
import { StrokeEngine } from './stroke-engine.js';
import { MediaPipeService } from './mediapipe-service.js';
import { MascotGuide } from './mascot-guide.js';

class SkyTraceApp {
  constructor() {
    // Current screen state: 'splash' | 'onboarding' | 'world-map' | 'categories' | 'category-items' | 'tracing' | 'practice'
    this.currentScreen = 'splash';
    this.previousScreen = 'world-map';
    this.categoryReturnScreen = 'categories';

    // Active tracing context
    this.activeTracingItem = null;
    this.isPracticeSession = false;

    // Practice game state
    this.currentPracticeFilter = 'all';
    this.currentPracticeItem = null;

    // Canvas & Video DOM references
    this.canvas = document.getElementById('arCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.video = document.getElementById('webcamVideo');

    // Subsystems
    this.audio = new AudioManager();
    this.chapterManager = new ChapterManager();
    this.particles = new ParticleSystem(this.canvas);
    this.floorAR = new FloorAREngine(this.canvas);
    this.strokeEngine = new StrokeEngine(this.floorAR, this.particles, this.audio);
    this.mediaPipe = new MediaPipeService(this.video, this.canvas);
    this.mascot = new MascotGuide(this.floorAR, this.particles, this.audio);

    this.initCanvasSize();
    this.initNavigation();
    this.initTracingEvents();
    this.initPracticeEvents();
    this.initCelebrationEvents();
    this.updateWorldMapProgress();

    // Start 60fps render loop
    requestAnimationFrame(() => this.loop());
  }

  initCanvasSize() {
    const resize = () => {
      if (!this.canvas) return;
      const container = this.canvas.parentElement;
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || (window.innerHeight - 80);
      if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  // --------------------------------------------------------------------------
  // SCREEN NAVIGATION
  // --------------------------------------------------------------------------
  navigateTo(screenId) {
    this.audio.playPop();
    const oldScreen = this.currentScreen;
    this.previousScreen = oldScreen;
    this.currentScreen = screenId;

    // If leaving tracing screen, stop camera and clear live state
    if (oldScreen === 'tracing' && screenId !== 'tracing') {
      this.mediaPipe.stopCamera();
      this.mascot.stopDemo();
      this.particles.clear();
      this.strokeEngine.reset();
      const camBtn = document.getElementById('btnToggleCamera');
      if (camBtn) camBtn.textContent = '📷 Camera';
    }

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));

    // Show target screen
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.remove('hidden');
    }

    // Refresh context-specific data
    if (screenId === 'world-map') {
      this.updateWorldMapProgress();
    } else if (screenId === 'category-items') {
      this.renderCategoryItems(this.chapterManager.activeChapterId);
    } else if (screenId === 'practice') {
      this.initPracticeScreen();
    } else if (screenId === 'tracing') {
      setTimeout(() => this.initCanvasSize(), 60);
      if (this.mediaPipe.mode === 'hand' && !this.mediaPipe.isCameraRunning) {
        this.mediaPipe.startCamera('hand');
        const camBtn = document.getElementById('btnToggleCamera');
        if (camBtn) camBtn.textContent = '📷 Camera On';
      }
    }
  }

  initNavigation() {
    // Screen 1: Splash -> Onboarding
    document.getElementById('btnStartLearning')?.addEventListener('click', () => {
      this.navigateTo('onboarding');
    });

    // Screen 2: Onboarding -> World Map
    document.getElementById('btnOnboardingNext')?.addEventListener('click', () => {
      this.navigateTo('world-map');
    });

    // Screen 3: World Map -> Back to Onboarding
    document.getElementById('btnBackFromMap')?.addEventListener('click', () => {
      this.navigateTo('onboarding');
    });

    // Screen 3: World Map Island Hotspots
    document.getElementById('btnMapLetters')?.addEventListener('click', () => {
      this.navigateTo('categories');
    });

    document.getElementById('btnMapNumbers')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'world-map';
      this.chapterManager.setActiveChapter('chapter_numbers');
      this.navigateTo('category-items');
    });

    document.getElementById('btnMapShapes')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'world-map';
      this.chapterManager.setActiveChapter('chapter_shapes');
      this.navigateTo('category-items');
    });

    // PRACTICE ISLAND: UNLOCKED IMMEDIATELY WITH NO RESTRICTIONS
    document.getElementById('btnMapPractice')?.addEventListener('click', () => {
      this.navigateTo('practice');
    });

    // Screen 4: Categories ("Explore the Islands") -> Back to World Map
    document.getElementById('btnBackFromCategories')?.addEventListener('click', () => {
      this.navigateTo('world-map');
    });

    // Screen 4: Category Selection Cards
    document.getElementById('catCardSmall')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'categories';
      this.chapterManager.setActiveChapter('chapter_small');
      this.navigateTo('category-items');
    });

    document.getElementById('catCardCapital')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'categories';
      this.chapterManager.setActiveChapter('chapter_capital');
      this.navigateTo('category-items');
    });

    document.getElementById('catCardNumbers')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'categories';
      this.chapterManager.setActiveChapter('chapter_numbers');
      this.navigateTo('category-items');
    });

    document.getElementById('catCardShapes')?.addEventListener('click', () => {
      this.categoryReturnScreen = 'categories';
      this.chapterManager.setActiveChapter('chapter_shapes');
      this.navigateTo('category-items');
    });

    // Screen 5: Category Items Grid -> Back
    document.getElementById('btnBackFromCategoryItems')?.addEventListener('click', () => {
      this.navigateTo(this.categoryReturnScreen || 'categories');
    });

    // Screen 6: Tracing Screen Navigation
    document.getElementById('btnBackFromTracing')?.addEventListener('click', () => {
      if (this.isPracticeSession) {
        this.navigateTo('practice');
      } else {
        this.navigateTo('category-items');
      }
    });

    document.getElementById('btnTracingPrev')?.addEventListener('click', () => {
      this.audio.playPop();
      if (this.isPracticeSession) {
        this.rollPracticeChallenge();
        this.openTracingScreen(this.currentPracticeItem, true);
      } else {
        const ch = this.chapterManager.getActiveChapter();
        const prevIdx = (this.chapterManager.activeLevelIndex - 1 + ch.items.length) % ch.items.length;
        this.chapterManager.setLevelIndex(prevIdx);
        this.openTracingScreen(this.chapterManager.getActiveLevel(), false);
      }
    });

    document.getElementById('btnTracingNext')?.addEventListener('click', () => {
      this.audio.playPop();
      if (this.isPracticeSession) {
        this.rollPracticeChallenge();
        this.openTracingScreen(this.currentPracticeItem, true);
      } else {
        const ch = this.chapterManager.getActiveChapter();
        const nextIdx = (this.chapterManager.activeLevelIndex + 1) % ch.items.length;
        this.chapterManager.setLevelIndex(nextIdx);
        this.openTracingScreen(this.chapterManager.getActiveLevel(), false);
      }
    });

    // Tracing Audio Phonics
    document.getElementById('btnTracingSound')?.addEventListener('click', () => {
      if (!this.activeTracingItem) return;
      this.audio.speak(`${this.activeTracingItem.name || this.activeTracingItem.word || this.activeTracingItem.char}! ${this.activeTracingItem.phonics || ''}`);
    });

    // Tracing Retry
    document.getElementById('btnTracingRetry')?.addEventListener('click', () => {
      this.audio.playPop();
      this.strokeEngine.reset();
      this.particles.clear();
      const pill = document.getElementById('realtimeFeedbackPill');
      const textEl = document.getElementById('feedbackText');
      if (pill && textEl) {
        pill.className = 'feedback-pill feedback-idle';
        textEl.textContent = 'Touch start dot 1 to begin!';
      }
    });

    // Tracing Mascot Demo ("Show Me")
    document.getElementById('btnTracingDemo')?.addEventListener('click', () => {
      this.audio.playPop();
      this.strokeEngine.reset();
      if (this.activeTracingItem) {
        this.mascot.startDemo(this.activeTracingItem);
      }
    });

    // Camera Toggle Button
    document.getElementById('btnToggleCamera')?.addEventListener('click', () => {
      this.audio.playPop();
      const camBtn = document.getElementById('btnToggleCamera');
      if (!this.mediaPipe.isCameraRunning) {
        this.mediaPipe.startCamera(this.mediaPipe.mode);
        if (camBtn) camBtn.textContent = '📷 Camera On';
      } else {
        this.mediaPipe.stopCamera();
        if (camBtn) camBtn.textContent = '📷 Camera Off';
      }
    });

    // Mode mini pills (Hand vs Mouse)
    document.querySelectorAll('.mode-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.audio.playPop();
        document.querySelectorAll('.mode-opt').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        const mode = target.dataset.mode;
        this.mediaPipe.setMode(mode);
      });
    });

    // Keyboard navigation shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen === 'tracing') {
        if (e.key === 'ArrowRight') {
          document.getElementById('btnTracingNext')?.click();
        } else if (e.key === 'ArrowLeft') {
          document.getElementById('btnTracingPrev')?.click();
        } else if (e.key === 'Escape') {
          document.getElementById('btnBackFromTracing')?.click();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // WORLD MAP PROGRESS DISPLAY
  // --------------------------------------------------------------------------
  updateWorldMapProgress() {
    const summary = this.chapterManager.getTotalSummary();

    const starEl = document.getElementById('mapTotalStars');
    if (starEl) starEl.textContent = summary.totalStars;

    const streakEl = document.getElementById('mapPracticeStreak');
    if (streakEl) streakEl.textContent = summary.practiceStreak;

    const fractionEl = document.getElementById('mapProgressFraction');
    if (fractionEl) fractionEl.textContent = `${summary.totalCompleted}/${summary.totalItems}`;

    const progressBar = document.getElementById('mapLevelProgressBar');
    if (progressBar) {
      const pct = Math.min(100, Math.round((summary.totalCompleted / Math.max(1, summary.totalItems)) * 100));
      progressBar.style.width = `${Math.max(12, pct)}%`;
    }

    const levelTitle = document.getElementById('mapLevelTitle');
    if (levelTitle) {
      const currentLevel = Math.max(1, Math.floor(summary.totalCompleted / 4) + 1);
      levelTitle.textContent = `Level ${currentLevel}`;
    }
  }

  // --------------------------------------------------------------------------
  // DEDICATED CATEGORY SELECTION GRID SCREEN
  // --------------------------------------------------------------------------
  renderCategoryItems(chapterId) {
    const ch = this.chapterManager.getChapter(chapterId);
    if (!ch) return;

    // Header updates
    const badgeEl = document.getElementById('categoryItemsBadge');
    if (badgeEl) badgeEl.textContent = ch.badge || '🌟';

    const headingEl = document.getElementById('categoryItemsHeading');
    if (headingEl) headingEl.textContent = `${ch.name} (${ch.items.length} items)`;

    const taglineEl = document.getElementById('categoryItemsTagline');
    if (taglineEl) taglineEl.textContent = ch.tagline || 'Select any item to start guided air-tracing!';

    // Stats pill
    const stats = this.chapterManager.getChapterProgress(chapterId);
    const statsPill = document.getElementById('categoryItemsStatsPill');
    if (statsPill) {
      statsPill.textContent = `⭐ ${stats.earnedStars}/${stats.maxStars} Stars • ${stats.completedCount}/${stats.totalItems} Completed`;
    }

    // Grid Container
    const grid = document.getElementById('itemsGridContainer');
    if (!grid) return;
    grid.innerHTML = '';

    ch.items.forEach((item, index) => {
      const stars = this.chapterManager.getLevelStars(ch.id, item.id);
      const isCompleted = stars > 0;
      const isCurrent = (this.chapterManager.activeChapterId === ch.id && this.chapterManager.activeLevelIndex === index);

      let starsDisplay = '☆☆☆';
      if (stars === 3) starsDisplay = '⭐⭐⭐';
      else if (stars === 2) starsDisplay = '⭐⭐☆';
      else if (stars === 1) starsDisplay = '⭐☆☆';

      const card = document.createElement('div');
      card.className = `item-grid-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
      card.innerHTML = `
        <div class="item-card-char" style="color: ${item.color || '#1E3A8A'};">${item.char}</div>
        <div class="item-card-word">${item.name || item.word || ''} ${item.emoji || ''}</div>
        <div class="item-card-stars">${isCompleted ? starsDisplay : 'Trace ➔'}</div>
      `;

      card.addEventListener('click', () => {
        this.chapterManager.setActiveChapter(ch.id);
        this.chapterManager.setLevelIndex(index);
        this.openTracingScreen(item, false);
      });

      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // DEDICATED GUIDED AIR-TRACING SCREEN
  // --------------------------------------------------------------------------
  openTracingScreen(item, isPractice = false) {
    this.activeTracingItem = item;
    this.isPracticeSession = isPractice;

    // Load active item into stroke engine
    this.strokeEngine.loadLetter(item);
    this.mascot.stopDemo();
    this.particles.clear();

    // Update Header Bar
    const charEl = document.getElementById('tracingHeaderChar');
    if (charEl) {
      charEl.textContent = item.char;
      charEl.style.color = item.color || '#FFD166';
    }

    const nameEl = document.getElementById('tracingHeaderName');
    if (nameEl) {
      const label = item.name || item.word || item.title || item.char;
      nameEl.textContent = `${isPractice ? 'Practice: ' : ''}${label} ${item.emoji || ''}`;
    }

    // Initial feedback status
    const pill = document.getElementById('realtimeFeedbackPill');
    const textEl = document.getElementById('feedbackText');
    if (pill && textEl) {
      pill.className = 'feedback-pill feedback-idle';
      textEl.textContent = 'Touch start dot 1 to begin!';
    }

    // Initial stroke progress
    const totalStrokes = item.strokes ? item.strokes.length : 1;
    const progressText = document.getElementById('strokeProgressText');
    const progressBar = document.getElementById('strokeProgressBar');
    if (progressText) progressText.textContent = `Stroke 1 of ${totalStrokes}`;
    if (progressBar) progressBar.style.width = '0%';

    // Navigate to Tracing Screen
    this.navigateTo('tracing');

    // Announce item name phonetically
    this.audio.speak(`${item.name || item.word || item.char}! ${item.phonics || ''}`);
  }

  // --------------------------------------------------------------------------
  // TRACING DETECTION AND FEEDBACK CALLBACKS
  // --------------------------------------------------------------------------
  initTracingEvents() {
    // Real-time cursor coordinates from MediaPipe (Finger, Foot, or Mouse)
    this.mediaPipe.onCursorUpdate = (x, y, isDrawing, meta) => {
      this.strokeEngine.processCursor(x, y, isDrawing);
    };

    // Camera Status Indicator
    this.mediaPipe.onStatusChange = (msg, isError) => {
      const statusText = document.getElementById('cameraStatusText');
      if (statusText) statusText.textContent = msg;

      const statusStrip = document.getElementById('cameraStatusStrip');
      if (statusStrip) {
        if (isError) {
          statusStrip.style.background = 'rgba(239, 68, 68, 0.25)';
          statusStrip.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        } else {
          statusStrip.style.background = 'rgba(2, 132, 199, 0.25)';
          statusStrip.style.borderColor = 'rgba(56, 189, 248, 0.2)';
        }
      }
    };

    // Real-Time Feedback Pill (Green = Correct, Red = Incorrect, Idle)
    this.strokeEngine.onFeedbackChange = (status, text) => {
      const pill = document.getElementById('realtimeFeedbackPill');
      const textEl = document.getElementById('feedbackText');
      if (!pill || !textEl) return;

      textEl.textContent = text;
      pill.className = `feedback-pill feedback-${status}`;
    };

    // Stroke Progress updates
    this.strokeEngine.onProgressUpdate = ({ strokeIndex, totalStrokes, percent, isCompleted }) => {
      const bar = document.getElementById('strokeProgressBar');
      const text = document.getElementById('strokeProgressText');
      if (bar) bar.style.width = `${percent}%`;
      if (text) text.textContent = `Stroke ${Math.min(strokeIndex + 1, totalStrokes)} of ${totalStrokes}`;
    };

    // Stroke Complete sound
    this.strokeEngine.onStrokeComplete = (idx) => {
      this.audio.playStrokeSuccess();
    };

    // Entire Letter/Shape Completed Genuine Validation
    this.strokeEngine.onLetterComplete = (levelItem, stars) => {
      this.showCelebration(levelItem, stars);
    };
  }

  // --------------------------------------------------------------------------
  // CELEBRATION TOAST & PROGRESS UPDATE
  // --------------------------------------------------------------------------
  showCelebration(item, stars) {
    let titleText = `Awesome Tracing: ${item.char}!`;
    let descText = `You earned ${stars} Stars! (${item.phonics || item.word || 'Super Job!'})`;
    let starSymbols = '⭐'.repeat(stars);

    if (this.isPracticeSession) {
      const result = this.chapterManager.recordPracticeSuccess(item);
      titleText = `🎉 Challenge Complete: ${item.char}!`;
      descText = `Practice Streak: 🔥 ${result.streak} &bull; Total Done: ⭐ ${result.totalCompleted}`;
      starSymbols = '⭐⭐⭐';
    } else {
      this.chapterManager.completeLevel(item, stars);
    }

    this.updateWorldMapProgress();

    // 1. Show bouncing character animation + speak "A for Apple!" for 2.2s
    this.showLevelAnimation(item, () => {
      // 2. THEN reveal the celebration toast with actions
      const toast = document.getElementById('celebrationToast');
      const title = document.getElementById('toastTitle');
      const desc  = document.getElementById('toastDesc');
      const starsEl = document.getElementById('toastStars');

      if (title)   title.textContent  = titleText;
      if (desc)    desc.innerHTML     = descText;
      if (starsEl) starsEl.textContent = starSymbols;

      if (toast) toast.classList.remove('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // LEVEL-COMPLETE CHARACTER ANIMATION (fun bouncing overlay before toast)
  // --------------------------------------------------------------------------
  showLevelAnimation(item, onDone) {
    const overlay  = document.getElementById('levelAnimOverlay');
    const charEl   = document.getElementById('levelAnimChar');
    const emojiEl  = document.getElementById('levelAnimEmoji');
    const labelEl  = document.getElementById('levelAnimLabel');
    const sparksEl = document.getElementById('levelAnimSparks');
    if (!overlay) { onDone(); return; }

    // Populate content
    if (charEl)  charEl.textContent  = item.char;
    if (emojiEl) emojiEl.textContent = item.emoji || '🌟';

    // Build the phonics label: "A for Apple!", "3", "Circle", etc.
    const word = item.word || item.name || item.title || item.char;
    const label = item.word ? `${item.char} for ${word}!` : `${word}!`;
    if (labelEl) labelEl.textContent = label;

    // Colour the character to match the item theme
    if (charEl) {
      charEl.style.background = `linear-gradient(135deg, ${item.color || '#FBBF24'}, #F472B6, #818CF8)`;
      charEl.style.webkitBackgroundClip = 'text';
      charEl.style.backgroundClip = 'text';
    }

    // Shoot out colourful spark dots
    if (sparksEl) {
      sparksEl.innerHTML = '';
      const colors = ['#FBBF24','#F472B6','#818CF8','#34D399','#60A5FA','#FCA5A5'];
      for (let i = 0; i < 20; i++) {
        const dot = document.createElement('div');
        dot.className = 'spark-dot';
        const angle = (i / 20) * Math.PI * 2;
        const dist  = 80 + Math.random() * 100;
        dot.style.cssText = `
          width:${6 + Math.random()*8}px;
          height:${6 + Math.random()*8}px;
          background:${colors[i % colors.length]};
          left:50%; top:50%;
          margin-left:-4px; margin-top:-4px;
          --sx:${Math.cos(angle)*dist}px;
          --sy:${Math.sin(angle)*dist}px;
          animation-delay:${Math.random()*0.3}s;
        `;
        sparksEl.appendChild(dot);
      }
    }

    // Reset animation so it replays
    overlay.classList.remove('hidden');
    const box = document.getElementById('levelAnimBox');
    if (box) { box.style.animation = 'none'; box.offsetHeight; box.style.animation = ''; }

    // Speak "A for Apple!" (or just the item word)
    const speechText = item.word
      ? `${item.char} for ${word}! ${item.phonics || ''}`
      : `${word}! ${item.phonics || ''}`;
    this.audio.speak(speechText);

    // Hide after 2.2 seconds and call onDone
    setTimeout(() => {
      overlay.classList.add('hidden');
      onDone();
    }, 2200);
  }

  initCelebrationEvents() {
    // Next Item CTA
    document.getElementById('btnToastNext')?.addEventListener('click', () => {
      document.getElementById('celebrationToast')?.classList.add('hidden');
      if (this.isPracticeSession) {
        this.rollPracticeChallenge();
        this.openTracingScreen(this.currentPracticeItem, true);
      } else {
        const ch = this.chapterManager.getActiveChapter();
        const nextIdx = (this.chapterManager.activeLevelIndex + 1) % ch.items.length;
        this.chapterManager.setLevelIndex(nextIdx);
        this.openTracingScreen(this.chapterManager.getActiveLevel(), false);
      }
    });

    // Retry CTA
    document.getElementById('btnToastRetry')?.addEventListener('click', () => {
      document.getElementById('celebrationToast')?.classList.add('hidden');
      this.strokeEngine.reset();
      this.particles.clear();
      const pill = document.getElementById('realtimeFeedbackPill');
      const textEl = document.getElementById('feedbackText');
      if (pill && textEl) {
        pill.className = 'feedback-pill feedback-idle';
        textEl.textContent = 'Touch start dot 1 to begin!';
      }
    });

    // Return to Grid / Map CTA
    document.getElementById('btnToastGrid')?.addEventListener('click', () => {
      document.getElementById('celebrationToast')?.classList.add('hidden');
      if (this.isPracticeSession) {
        this.navigateTo('practice');
      } else {
        this.navigateTo('category-items');
      }
    });
  }

  // --------------------------------------------------------------------------
  // DEDICATED PRACTICE ISLAND GAME (IMMEDIATELY UNLOCKED)
  // --------------------------------------------------------------------------
  initPracticeScreen() {
    const stats = this.chapterManager.getPracticeStats();

    const streakVal = document.getElementById('practiceStreakVal');
    if (streakVal) streakVal.textContent = stats.streak;

    const totalVal = document.getElementById('practiceTotalVal');
    if (totalVal) totalVal.textContent = stats.totalCompleted;

    if (!this.currentPracticeItem) {
      this.rollPracticeChallenge();
    }
  }

  rollPracticeChallenge() {
    this.currentPracticeItem = getRandomPracticeItem(this.currentPracticeFilter);
    if (!this.currentPracticeItem) return;

    const catTag = document.getElementById('practiceChallengeCategory');
    if (catTag) catTag.textContent = this.currentPracticeItem.categoryName || 'Challenge';

    const charEl = document.getElementById('practiceChallengeChar');
    if (charEl) {
      charEl.textContent = this.currentPracticeItem.char;
      charEl.style.color = this.currentPracticeItem.color || '#1E3A8A';
    }

    const nameEl = document.getElementById('practiceChallengeName');
    if (nameEl) {
      const label = this.currentPracticeItem.name || this.currentPracticeItem.word || this.currentPracticeItem.title || this.currentPracticeItem.char;
      nameEl.textContent = `${label} ${this.currentPracticeItem.emoji || ''}`;
    }

    const descEl = document.getElementById('practiceChallengeDesc');
    if (descEl) {
      descEl.textContent = this.currentPracticeItem.guide || this.currentPracticeItem.phonics || 'Follow the dotted line from start to finish!';
    }
  }

  initPracticeEvents() {
    // Back to Map
    document.getElementById('btnBackFromPractice')?.addEventListener('click', () => {
      this.navigateTo('world-map');
    });

    // Start Challenge
    document.getElementById('btnStartPracticeChallenge')?.addEventListener('click', () => {
      if (this.currentPracticeItem) {
        this.openTracingScreen(this.currentPracticeItem, true);
      }
    });

    // Reroll Challenge ("Try Another Challenge")
    document.getElementById('btnRerollChallenge')?.addEventListener('click', () => {
      this.audio.playPop();
      this.rollPracticeChallenge();
    });

    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.audio.playPop();
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.currentPracticeFilter = target.dataset.filter || 'all';
        this.rollPracticeChallenge();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 60FPS RENDER LOOP (PRESERVES FLOOR AR, STROKE FEEDBACK, PARTICLES, MASCOT)
  // --------------------------------------------------------------------------
  loop() {
    // Render high-performance tracing canvas whenever on tracing screen
    if (this.currentScreen === 'tracing' && this.canvas && this.ctx) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw video feed (mirrored) if webcam is streaming
      if (this.mediaPipe.isCameraRunning && this.video && this.video.readyState >= 2) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.video, 0, 0, w, h);
        ctx.restore();

        // Dark tint overlay for glowing chalk reticle contrast
        ctx.fillStyle = 'rgba(15, 23, 42, 0.44)';
        ctx.fillRect(0, 0, w, h);
      } else {
        // High-contrast deep slate studio floor when camera is idle
        const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
        grad.addColorStop(0, '#1E293B');
        grad.addColorStop(1, '#0F172A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Render floor perspective grid
      this.floorAR.renderFloorGrid();

      // 3. Render prescribed letter/shape, checkpoints, arrows, and user trail
      this.strokeEngine.render(ctx);

      // 4. Update and render animated mascot guide
      this.mascot.update();
      this.mascot.render(ctx);

      // 5. Render particle effects (sparkles, star bursts, victory confetti)
      this.particles.render();

      // 6. Render active cursor reticle (finger or mouse pointer)
      this.mediaPipe.renderCursor(ctx);
    }

    requestAnimationFrame(() => this.loop());
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.skyTraceApp = new SkyTraceApp();
});
