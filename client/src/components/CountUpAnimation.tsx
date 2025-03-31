import { useState, useEffect, useRef } from 'react';

interface CountUpAnimationProps {
  endValue: number;
  duration?: number; // in milliseconds
  className?: string;
}

export function CountUpAnimation({ endValue, duration = 2000, className = "" }: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (endValue <= 0) {
      setCount(0);
      return;
    }

    // Reset start time
    startTimeRef.current = null;
    
    // Animation function using requestAnimationFrame
    const animateCount = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const progress = timestamp - startTimeRef.current;
      const progressPercentage = Math.min(progress / duration, 1);
      
      // Easing function - easeOutExpo for a more natural counting effect
      const easeOutExpo = 1 - Math.pow(2, -10 * progressPercentage);
      
      // Calculate the count value based on progress
      const nextCount = Math.floor(easeOutExpo * endValue);
      setCount(nextCount);
      
      // Continue animation if not complete and component is still mounted
      if (progressPercentage < 1 && mountedRef.current) {
        frameRef.current = requestAnimationFrame(animateCount);
      } else {
        setCount(endValue); // Ensure we end exactly at the target value
      }
    };

    // Start animation
    frameRef.current = requestAnimationFrame(animateCount);
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [endValue, duration]);

  return <span className={className}>{count}</span>;
}