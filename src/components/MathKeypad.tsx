import React, { useState } from "react";
import { Plus, Minus, Variable, Circle, Hash, HelpCircle } from "lucide-react";

interface MathKeypadProps {
  onInsertSymbol: (symbol: string) => void;
}

interface KeySymbol {
  display: string; // What the key displays visually
  latex: string;   // What is inserted in the input field
}

interface KeyCategory {
  id: string;
  label: string;
  items: KeySymbol[];
}

export const MathKeypad: React.FC<MathKeypadProps> = ({ onInsertSymbol }) => {
  const [activeCategory, setActiveCategory] = useState<string>("basic");

  const categories: KeyCategory[] = [
    {
      id: "basic",
      label: "Basic Arithmetic",
      items: [
        { display: "π", latex: "\\pi" },
        { display: "e", latex: "e" },
        { display: "i", latex: "i" },
        { display: "√x", latex: "\\sqrt{" },
        { display: "^2", latex: "^2" },
        { display: "^y", latex: "^" },
        { display: "x", latex: "x" },
        { display: "y", latex: "y" },
        { display: "θ", latex: "\\theta" },
        { display: "Fraction", latex: "\\frac{" },
        { display: "( )", latex: "(" },
        { display: "[ ]", latex: "[" },
        { display: "log", latex: "\\log_{" },
        { display: "ln", latex: "\\ln(" },
        { display: "∞", latex: "\\infty" },
        { display: "=", latex: " = " },
      ],
    },
    {
      id: "calculus",
      label: "Calculus",
      items: [
        { display: "∫", latex: "\\int " },
        { display: "∫[a,b]", latex: "\\int_{a}^{b} " },
        { display: "d/dx", latex: "\\frac{d}{dx} " },
        { display: "∂", latex: "\\partial " },
        { display: "lim", latex: "\\lim_{x \\to 0} " },
        { display: "∑", latex: "\\sum_{i=1}^{n} " },
        { display: "∏", latex: "\\prod_" },
        { display: "Δ", latex: "\\Delta" },
        { display: "∇", latex: "\\nabla" },
        { display: "y'", latex: "y'" },
        { display: "∫∫", latex: "\\iint " },
        { display: "→", latex: "\\to " },
      ],
    },
    {
      id: "trig",
      label: "Trigonometry",
      items: [
        { display: "sin", latex: "\\sin(" },
        { display: "cos", latex: "\\cos(" },
        { display: "tan", latex: "\\tan(" },
        { display: "csc", latex: "\\csc(" },
        { display: "sec", latex: "\\sec(" },
        { display: "cot", latex: "\\cot(" },
        { display: "sinh", latex: "\\sinh(" },
        { display: "cosh", latex: "\\cosh(" },
        { display: "arcsin", latex: "\\arcsin(" },
        { display: "arccos", latex: "\\arccos(" },
        { display: "arctan", latex: "\\arctan(" },
        { display: "° (deg)", latex: "^{\\circ}" },
      ],
    },
    {
      id: "matrices",
      label: "Vectors & Matrices",
      items: [
        { display: "2x2 Mat", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
        { display: "3x3 Mat", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
        { display: "Det", latex: "\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
        { display: "Vector", latex: "\\vec{v}" },
        { display: "Dot (·)", latex: "\\cdot " },
        { display: "Cross (×)", latex: "\\times " },
        { display: "λ", latex: "\\lambda" },
        { display: "Matrix Row", latex: "a & b" },
      ],
    },
  ];

  return (
    <div id="mathematical-keypad" className="bg-[#0c1220] border border-gray-800 rounded-2xl p-4 flex flex-col h-full select-none select-none">
      {/* Tab select headers */}
      <div className="flex bg-gray-950/50 p-1 rounded-xl border border-gray-900 overflow-x-auto gap-1 mb-3 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`keypad-tab-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid items */}
      <div className="grid grid-cols-4 gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {categories
          .find((c) => c.id === activeCategory)
          ?.items.map((item, idx) => (
            <button
              key={idx}
              id={`keypad-btn-${activeCategory}-${idx}`}
              onClick={() => onInsertSymbol(item.latex)}
              className="py-2 px-1 text-center bg-gray-900 hover:bg-[#141b2d] hover:border-gray-700 transition-all border border-gray-800/80 rounded-xl font-mono text-sm text-gray-200 hover:text-cyan-400 flex items-center justify-center cursor-pointer active:scale-95 h-10 shadow-sm"
              title={`Insert ${item.display}`}
            >
              {item.display}
            </button>
          ))}
      </div>

      {/* Inline guide and usage tip */}
      <div className="mt-3 pt-3 border-t border-gray-800/65 flex items-start gap-2 text-[10px] text-gray-500">
        <HelpCircle className="w-3.5 h-3.5 text-cyan-500/50 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Tap any scientific keypad panel button to insert structured LaTeX tags right into your query line. Complete any open brackets <code className="text-cyan-600 font-mono">{"{"}</code> with your numbers.
        </p>
      </div>
    </div>
  );
};
