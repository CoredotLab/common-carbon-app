/**
 * @module CommonHook
 */
import { useEffect, useState } from "react";

export function useWindowResize(): number {
  const [innerWidth, setInnerWidth] = useState(99999);
  function changeInnerWidth() {
    setInnerWidth(window.innerWidth);
  }

  useEffect(() => {
    setInnerWidth(window.innerWidth);
    window.addEventListener("resize", changeInnerWidth);
    return () => window.removeEventListener("resize", changeInnerWidth);
  }, [innerWidth]);

  return innerWidth;
}
