import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Sparkles } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: null, // Center screen
    title: "Welcome to Algorithm Visualizer!",
    content: "Let's take a quick tour of what you can do here.",
    placement: 'center'
  },
  {
    target: 'tour-visualizer',
    title: "Interactive 3D Renderings",
    content: "Explore algorithms with stunning 3D WebGL visuals. You can pan, zoom, and rotate the canvas.",
    placement: 'left'
  },
  {
    target: 'tour-sound',
    title: "Granular Sonification",
    content: "Listen to the data! We use granular synthesis and 3D spatial panning to turn array operations into beautiful music.",
    placement: 'bottom'
  },
  {
    target: 'tour-arena',
    title: "Battle Arena",
    content: "Race your favorite algorithms head-to-head in split-screen mode to see which one truly is the fastest.",
    placement: 'bottom'
  },
  {
    target: 'tour-theme',
    title: "Cinematic Themes",
    content: "Toggle between Dark and Light modes for a gorgeous, cinematic UI experience.",
    placement: 'bottom'
  }
];

const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      // Small delay to let the app load
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const updateTargetRect = () => {
    const step = TOUR_STEPS[currentStep];
    if (step.target) {
      const el = document.getElementById(step.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null); // Element not found on this page
      }
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect, true);
      return () => {
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect, true);
      };
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  // Calculate tooltip position based on targetRect
  let tooltipStyle = {};
  let wrapperClass = "absolute z-50 pointer-events-none ";
  
  if (targetRect) {
    if (step.placement === 'bottom') {
      tooltipStyle = {
        top: targetRect.bottom + 16,
        left: Math.min(Math.max(16, targetRect.left + (targetRect.width / 2) - 160), window.innerWidth - 336), // 320px width + 16px margin
      };
    } else if (step.placement === 'left') {
      tooltipStyle = {
        top: targetRect.top + (targetRect.height / 2) - 100,
        left: Math.max(16, targetRect.left - 320 - 16),
      };
    }
  } else {
    // Center placement
    wrapperClass += "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {/* Dark Overlay with Hole */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto"
          style={{
            clipPath: targetRect ? `polygon(
              0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
              ${targetRect.left - 8}px ${targetRect.top - 8}px,
              ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
              ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
              ${targetRect.right + 8}px ${targetRect.top - 8}px,
              ${targetRect.left - 8}px ${targetRect.top - 8}px
            )` : 'none'
          }}
        />
      </AnimatePresence>

      {/* Target Highlight Ring */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute border-2 border-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Tooltip Card Wrapper */}
      <div className={wrapperClass} style={targetRect ? tooltipStyle : {}}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-80 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-indigo-100 dark:border-zinc-800 pointer-events-auto"
          >
            <button 
              onClick={endTour}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles size={16} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {step.title}
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {step.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>Finish <Check size={16} /></>
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingTour;
