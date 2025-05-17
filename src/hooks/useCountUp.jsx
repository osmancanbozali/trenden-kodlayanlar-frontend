// src/hooks/useCountUp.js
import { useEffect, useState } from 'react';

const useCountUp = (target, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(target / (duration / 10)); // update every 10ms
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [target, duration]);

  return count;
};

export default useCountUp;
