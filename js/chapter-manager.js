/**
 * chapter-manager.js
 * Manages Chapter switching, Level progression, Star ratings,
 * Practice Island game state, and localStorage persistence.
 */

import { CHAPTERS, getRandomPracticeItem } from './curriculum-data.js';

export class ChapterManager {
  constructor() {
    this.chapters = CHAPTERS;
    this.activeChapterId = 'chapter_small';
    this.activeLevelIndex = 0;
    this.storageKey = 'sky_trace_progress_v3';
    this.progress = this.loadStoredProgress();
  }

  loadStoredProgress() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Could not read progress from localStorage:', e);
    }

    const defaultData = {
      practice: {
        streak: 0,
        totalCompleted: 0
      }
    };

    this.chapters.forEach(ch => {
      defaultData[ch.id] = {
        unlockedIndex: ch.items.length, // All items accessible
        stars: {} // map of levelId -> stars (1..3)
      };
    });

    return defaultData;
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  getChapter(chapterId) {
    return this.chapters.find(c => c.id === chapterId) || this.chapters[0];
  }

  getActiveChapter() {
    return this.getChapter(this.activeChapterId);
  }

  setActiveChapter(chapterId) {
    if (this.chapters.some(c => c.id === chapterId)) {
      this.activeChapterId = chapterId;
      this.activeLevelIndex = 0;
    }
  }

  getActiveLevel() {
    const ch = this.getActiveChapter();
    return ch.items[this.activeLevelIndex] || ch.items[0];
  }

  setLevelIndex(index) {
    const ch = this.getActiveChapter();
    if (index >= 0 && index < ch.items.length) {
      this.activeLevelIndex = index;
    }
  }

  // Record completed level and award stars (only updates if new score is higher or equal)
  completeLevel(levelItem, stars = 3) {
    const chId = this.activeChapterId;
    if (!this.progress[chId]) {
      this.progress[chId] = { unlockedIndex: 100, stars: {} };
    }

    const currentStars = this.progress[chId].stars[levelItem.id] || 0;
    const isFirstTime = currentStars === 0;
    this.progress[chId].stars[levelItem.id] = Math.max(currentStars, stars);

    this.saveToStorage();
    return { isFirstTime, starsEarned: this.progress[chId].stars[levelItem.id] };
  }

  // Record a successful practice challenge
  recordPracticeSuccess(levelItem) {
    if (!this.progress.practice) {
      this.progress.practice = { streak: 0, totalCompleted: 0 };
    }
    this.progress.practice.streak = (this.progress.practice.streak || 0) + 1;
    this.progress.practice.totalCompleted = (this.progress.practice.totalCompleted || 0) + 1;

    // Also mark the specific item as completed if not already
    this.chapters.forEach(ch => {
      const match = ch.items.find(it => it.id === levelItem.id);
      if (match) {
        if (!this.progress[ch.id]) this.progress[ch.id] = { stars: {} };
        const s = this.progress[ch.id].stars[levelItem.id] || 0;
        this.progress[ch.id].stars[levelItem.id] = Math.max(s, 3);
      }
    });

    this.saveToStorage();
    return {
      streak: this.progress.practice.streak,
      totalCompleted: this.progress.practice.totalCompleted
    };
  }

  getPracticeStats() {
    if (!this.progress.practice) {
      this.progress.practice = { streak: 0, totalCompleted: 0 };
    }
    return this.progress.practice;
  }

  // Check if a level is completed
  isLevelCompleted(chapterId, levelId) {
    const chData = this.progress[chapterId];
    return chData && chData.stars && (chData.stars[levelId] || 0) > 0;
  }

  // Check if a level is unlocked (all levels accessible in child-friendly mode)
  isLevelUnlocked(chapterId, levelIndex) {
    return true;
  }

  // Get stars for a level
  getLevelStars(chapterId, levelId) {
    const chData = this.progress[chapterId];
    return (chData && chData.stars && chData.stars[levelId]) || 0;
  }

  // Compute chapter progress metrics
  getChapterProgress(chapterId) {
    const ch = this.getChapter(chapterId);
    const chData = this.progress[chapterId] || { stars: {} };
    const totalItems = ch.items.length;
    let completedCount = 0;
    let earnedStars = 0;

    ch.items.forEach(item => {
      const s = chData.stars[item.id] || 0;
      if (s > 0) {
        completedCount++;
        earnedStars += s;
      }
    });

    const percent = Math.round((completedCount / totalItems) * 100);
    const maxStars = totalItems * 3;

    return {
      completedCount,
      totalItems,
      earnedStars,
      maxStars,
      percent
    };
  }

  // Get overall summary across all chapters
  getTotalSummary() {
    let totalCompleted = 0;
    let totalItems = 0;
    let totalStars = 0;

    this.chapters.forEach(ch => {
      const stats = this.getChapterProgress(ch.id);
      totalCompleted += stats.completedCount;
      totalItems += stats.totalItems;
      totalStars += stats.earnedStars;
    });

    const practiceStats = this.getPracticeStats();

    return {
      totalCompleted,
      totalItems,
      totalStars,
      practiceStreak: practiceStats.streak,
      practiceTotal: practiceStats.totalCompleted
    };
  }
}
