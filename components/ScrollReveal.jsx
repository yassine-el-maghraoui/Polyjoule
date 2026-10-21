'use client';

import { useEffect, useRef } from 'react';

/**
 * ScrollReveal — wraps children and animates them into view
 * when they enter the viewport via IntersectionObserver.
 *
 * Props:
 *  - animation: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-in' (default: 'fade-up')
 *  - delay: delay in ms before the animation triggers (default: 0)
 *  - threshold: 0‒1, how much of the element must be visible (default: 0.15)
 *  - className: extra className to merge
 *  - as: wrapper element tag (default: 'div')
 */
export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.15,
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply delay then reveal
          setTimeout(() => {
            el.classList.add('sr-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <Tag
      ref={ref}
      className={`sr-init sr-${animation} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
