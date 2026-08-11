// Adaptive Performance Budget Engine
// Dynamic Fidelity Scaling for 90-120 FPS across all low-end & high-end devices

export const PERFORMANCE_TIERS = {
  ULTRA_HIGH: 'ULTRA_HIGH', // 90-120+ FPS
  HIGH: 'HIGH',             // 60-90 FPS
  MEDIUM: 'MEDIUM',         // 30-60 FPS
  LOW: 'LOW',               // < 30 FPS (Low-end smartphones)
};

class PerformanceBudgetEngine {
  constructor() {
    this.currentFPS = 60;
    this.tier = PERFORMANCE_TIERS.HIGH;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.listeners = new Set();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop() {
    this.isRunning = false;
  }

  tick = () => {
    if (!this.isRunning) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
      this.evaluateTier();
    }

    requestAnimationFrame(this.tick);
  };

  evaluateTier() {
    let nextTier = this.tier;

    if (this.currentFPS >= 85) {
      nextTier = PERFORMANCE_TIERS.ULTRA_HIGH;
    } else if (this.currentFPS >= 55) {
      nextTier = PERFORMANCE_TIERS.HIGH;
    } else if (this.currentFPS >= 30) {
      nextTier = PERFORMANCE_TIERS.MEDIUM;
    } else {
      nextTier = PERFORMANCE_TIERS.LOW;
    }

    if (nextTier !== this.tier) {
      this.tier = nextTier;
      this.notifyListeners();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.tier, this.currentFPS);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((l) => l(this.tier, this.currentFPS));
  }

  getBudget() {
    switch (this.tier) {
      case PERFORMANCE_TIERS.ULTRA_HIGH:
        return { particleCount: 50, dpr: 2, enableGlow: true, shadowMap: true };
      case PERFORMANCE_TIERS.HIGH:
        return { particleCount: 30, dpr: 1.5, enableGlow: true, shadowMap: false };
      case PERFORMANCE_TIERS.MEDIUM:
        return { particleCount: 15, dpr: 1, enableGlow: false, shadowMap: false };
      case PERFORMANCE_TIERS.LOW:
      default:
        return { particleCount: 0, dpr: 0.8, enableGlow: false, shadowMap: false };
    }
  }
}

export const performanceBudget = new PerformanceBudgetEngine();
performanceBudget.start();
