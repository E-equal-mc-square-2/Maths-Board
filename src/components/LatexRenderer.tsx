import React, { useEffect, useRef } from "react";
import katex from "katex";

interface LatexRendererProps {
  math: string;
  block?: boolean;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ math, block = false }) => {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      try {
        // Simple sanitization of LaTeX strings that might contain wrapping markers from LLMs
        let cleanedMath = math;
        if (cleanedMath.startsWith("$$") && cleanedMath.endsWith("$$")) {
          cleanedMath = cleanedMath.slice(2, -2);
        } else if (cleanedMath.startsWith("$") && cleanedMath.endsWith("$")) {
          cleanedMath = cleanedMath.slice(1, -1);
        } else if (cleanedMath.startsWith("\\[") && cleanedMath.endsWith("\\]")) {
          cleanedMath = cleanedMath.slice(2, -2);
        } else if (cleanedMath.startsWith("\\(") && cleanedMath.endsWith("\\)")) {
          cleanedMath = cleanedMath.slice(2, -2);
        }

        katex.render(cleanedMath.trim(), elementRef.current, {
          displayMode: block,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        elementRef.current.textContent = math;
      }
    }
  }, [math, block]);

  return <span ref={elementRef} className="scientific-math select-all inline-block max-w-full overflow-x-auto align-middle" />;
};
