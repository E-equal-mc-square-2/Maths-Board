import React, { useRef, useState, useEffect } from "react";
import { Undo, Trash2, Eraser, Pencil, Grid, Info } from "lucide-react";

interface DrawingBoardProps {
  onCapture: (base64Image: string | null) => void;
  isLoading: boolean;
}

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ onCapture, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#22d3ee"); // Neon cyan drawing color
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<string[]>([]); // Capturing base64 undo states

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas state when colors/brush updates
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isEraser ? "#090d16" : color; // BG color
      contextRef.current.lineWidth = isEraser ? 16 : lineWidth;
    }
  }, [color, lineWidth, isEraser]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fluid resize observer logic for beautiful high resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(dpr, dpr);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = isEraser ? "#090d16" : color;
    context.lineWidth = isEraser ? 16 : lineWidth;

    contextRef.current = context;

    // Fill background with core math bg color (dark blue-black)
    clearCanvas(true);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    // Save current drawing to restore
    const currentDrawing = canvas.toDataURL();

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    contextRef.current.scale(dpr, dpr);
    contextRef.current.lineCap = "round";
    contextRef.current.lineJoin = "round";
    contextRef.current.strokeStyle = isEraser ? "#090d16" : color;
    contextRef.current.lineWidth = isEraser ? 16 : lineWidth;

    // Redraw saved drawing on black canvas
    const img = new Image();
    img.src = currentDrawing;
    img.onload = () => {
      contextRef.current?.drawImage(img, 0, 0, rect.width, rect.height);
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    // Store state in history on starting draw stroke
    const mainBase64 = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-15), mainBase64]); // Keep last 15 states

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    // Capture the latest frame content and send back
    onCapture(canvas.toDataURL());
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = (bypassHistory = false) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    if (!bypassHistory) {
      const mainBase64 = canvas.toDataURL();
      setHistory((prev) => [...prev.slice(-15), mainBase64]);
    }

    const rect = canvas.getBoundingClientRect();
    // Fill with drawing board's dark workspace color
    contextRef.current.fillStyle = "#090d16";
    contextRef.current.fillRect(0, 0, rect.width, rect.height);

    onCapture(null);
  };

  const undo = () => {
    if (history.length === 0 || !canvasRef.current || !contextRef.current) return;

    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      // Re-fill dark
      contextRef.current!.fillStyle = "#090d16";
      contextRef.current!.fillRect(0, 0, rect.width, rect.height);
      contextRef.current!.drawImage(img, 0, 0, rect.width, rect.height);
      
      onCapture(canvas.toDataURL());
    };
  };

  return (
    <div id="drawing-workspace" className="relative flex flex-col h-full bg-[#05070c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Toolbox */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0c1220]/90 border-b border-gray-800 select-none">
        <div className="flex items-center gap-2">
          {/* Pen Tool */}
          <button
            id="tool-pen"
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer ${
              !isEraser ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/25" : "text-gray-400 hover:text-white hover:bg-gray-800/55"
            }`}
            title="Switch to Pencil"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Pencil</span>
          </button>
          
          {/* Eraser Tool */}
          <button
            id="tool-eraser"
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer ${
              isEraser ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-gray-800/55"
            }`}
            title="Switch to Eraser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          {/* Separation */}
          <div className="h-5 w-[1px] bg-gray-800" />

          {/* Thickness selection */}
          <div className="flex items-center gap-1">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                id={`thickness-${size}`}
                onClick={() => setLineWidth(size)}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs font-semibold cursor-pointer ${
                  lineWidth === size && !isEraser
                    ? "bg-cyan-400/25 text-cyan-200"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
                }`}
                title={`Brush size ${size}px`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${size * 1.5}px`, height: `${size * 1.5}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          {!isEraser && (
            <div className="flex items-center gap-1.5">
              {[
                { hex: "#22d3ee", name: "Cyan" },
                { hex: "#a7f3d0", name: "Mint" },
                { hex: "#fef08a", name: "Yellow" },
                { hex: "#fca5a5", name: "Crimson" },
                { hex: "#ffffff", name: "White" },
              ].map((style) => (
                <button
                  key={style.hex}
                  id={`color-${style.name.toLowerCase()}`}
                  onClick={() => setColor(style.hex)}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    color === style.hex ? "scale-125 border-cyan-200" : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: style.hex }}
                  title={`${style.name} ink`}
                />
              ))}
            </div>
          )}

          <div className="h-5 w-[1px] bg-gray-800 hidden sm:block" />

          {/* Grid lines option */}
          <button
            id="toggle-math-grid"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              showGrid ? "text-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="Toggle Notebook Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Actions */}
          <button
            id="action-undo"
            onClick={undo}
            disabled={history.length === 0}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Undo stroke"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            id="action-clear"
            onClick={() => clearCanvas(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="Clear workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas workspace with Grid */}
      <div className="relative flex-1 w-full bg-[#090d16] overflow-hidden">
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] grid-pattern select-none"
            style={{
              backgroundImage: `linear-gradient(to right, #00ffff 1px, transparent 1px), linear-gradient(to bottom, #00ffff 1px, transparent 1px)`,
              backgroundSize: "28px 28px"
            }}
          />
        )}

        {/* Empty canvas guide HUD */}
        {history.length === 0 && !isDrawing && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none text-center select-none flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center bg-gray-950/40 text-cyan-400/40">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-sm font-display tracking-wide uppercase">Handwriting Interface</p>
            <p className="text-gray-600 text-xs max-w-xs leading-relaxed">
              Use your physical drawing stylus, mouse, or trackpad to sketch any standard mathematical formulation, advanced integrals, matrices, fractions, or algebraic equations here.
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="handwriting-canvas w-full h-full block absolute inset-0"
        />
      </div>
    </div>
  );
};
