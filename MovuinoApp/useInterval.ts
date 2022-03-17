import { useEffect, useRef } from 'react'


// See: https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect


const useInterval = (callback: () => void , delay: number | null) => {
    const savedCallback = useRef<() => void>();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      const tick = () => {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };
  
export default useInterval;