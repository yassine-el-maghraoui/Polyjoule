'use client';

import { useEffect, useRef } from 'react';

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
