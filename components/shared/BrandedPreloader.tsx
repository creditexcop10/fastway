"use client";

import { useEffect, useState } from "react";
import { animate, createTimeline } from "animejs";
import { motion, AnimatePresence } from "motion/react";

export function BrandedPreloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Manual dashoffset setup to avoid Anime.js v4 type/import issues
    const setDashoffset = (el: SVGPathElement) => {
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      return [length, 0];
    };

    const timeline = createTimeline({
      onComplete: () => {
        setTimeout(() => setIsLoading(false), 200);
      },
    });

    timeline
      .add(
        ".preloader-line",
        {
          strokeDashoffset: setDashoffset as any,
          easing: "easeInOutSine",
          duration: 1200,
        },
        0
      )
      .add(
        ".preloader-text",
        {
          opacity: [0, 1],
          translateY: [10, 0],
          easing: "easeOutExpo",
          duration: 600,
        },
        "-=200"
      )
      .add(
        ".preloader-box",
        {
          scale: [1, 1.1],
          opacity: [1, 0],
          easing: "easeInExpo",
          duration: 400,
        },
        "-=100"
      );

    return () => {
      timeline.pause();
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="preloader-box fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[oklch(0.32_0.09_256)]"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              className="preloader-line"
              d="M5 30 L40 30 L50 10 L60 50 L70 30 L115 30"
              stroke="oklch(0.68 0.21 42)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="preloader-text mt-4 font-heading text-xl font-bold tracking-widest text-white opacity-0">
            FASTWAY SEND
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}