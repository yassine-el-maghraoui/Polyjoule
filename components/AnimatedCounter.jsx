'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter — counts from 0 to `value` when scrolled into view.
 * Supports a prefix (e.g. "+") and suffix (e.g. "ans").
 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;

    const incrementTime = Math.max(Math.floor(duration / end), 16);
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [hasAnimated, value, duration]);

  return (
    <span ref={ref} className="stat-counter-value">
      {prefix}{count}{suffix}
    </span>
  );
}
