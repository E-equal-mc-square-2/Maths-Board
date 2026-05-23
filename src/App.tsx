import React, { useState, useEffect, useRef } from "react";
import { DrawingBoard } from "./components/DrawingBoard";
import { MathKeypad } from "./components/MathKeypad";
import { GraphVisualizer } from "./components/GraphVisualizer";
import { HistorySidebar } from "./components/HistorySidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { LatexRenderer } from "./components/LatexRenderer";
import { CalculatorSettings, MathResult, HistoryItem } from "./types";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calculator,
  Edit,
  History,
  Sliders,
  Send,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

export default function App() {
  // Input settings and mode
  const [activeMode, setActiveMode] = useState<"canvas" | "text">("canvas");
  const [textInput, setTextInput] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // States for server response and status
  const [activeResult, setActiveResult] = useState<MathResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Initializing Engine");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSecretIssue, setIsSecretIssue] = useState<boolean>(false);

  // Interactive settings state
  const [settings, setSettings] = useState<CalculatorSettings>({
    decimalPlaces: "auto",
    complexMode: "cartesian",
    symbolicMode: true,
    verbosity: "standard",
  });

  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("custom_gemini_api_key") || "";
  });

  const handleCustomApiKeyChange = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("custom_gemini_api_key", key);
  };

  // Tab selections (Settings vs. History)
  const [sidebarTab, setSidebarTab] = useState<"settings" | "history">("settings");
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Expandable steps toggle states based on index
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  // Loading ticker messages range
  const loadingTicker = [
    "Reading stroke coordinates and handwriting shapes...",
    "Converting graphical notation into exact algebraic structures...",
    "Reconstructing numeric coefficients and differentials...",
    "Evaluating equations with exact rational algebra...",
    "Calculating step-by-step educational derivations...",
    "Generating discrete coordinate curves for Cartesian charts...",
    "Polishing responsive LaTeX visual representations..."
  ];

  useEffect(() => {
    // Load local history log
    const cached = localStorage.getItem("math_engine_history");
    if (cached) {
      try {
        setHistoryList(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse history Cache", e);
      }
    }
  }, []);

  // Update loading tickers dynamically to create an immersive mathematical environment
  useEffect(() => {
    let tickerInterval: NodeJS.Timeout;
    if (isLoading) {
      let idx = 0;
      setLoadingStep(loadingTicker[0]);
      tickerInterval = setInterval(() => {
        idx = (idx + 1) % loadingTicker.length;
        setLoadingStep(loadingTicker[idx]);
      }, 2500);
    }
    return () => clearInterval(tickerInterval);
  }, [isLoading]);

  // Insert math symbols/LaTeX tags matching current cursor insertion
  const handleInsertSymbol = (latex: string) => {
    setTextInput((prev) => prev + latex);
  };

  const solveMathExpression = async () => {
    // Check if input is empty
    if (activeMode === "text" && !textInput.trim()) {
      setErrorMessage("Please enter an algebraic question or mathematical equation to solve.");
      return;
    }
    if (activeMode === "canvas" && !capturedImage) {
      setErrorMessage("Please write or draw a mathematical expression on the canvas board before solving.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsSecretIssue(false);
    setActiveResult(null);
    setExpandedSteps({});

    // Smooth scroll down on mobile viewports immediately upon compute start
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const stream = document.getElementById("mathematics-result-stream");
        if (stream) {
          stream.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: activeMode,
          text: activeMode === "text" ? textInput : undefined,
          image: activeMode === "canvas" ? capturedImage : undefined,
          settings,
          customApiKey: customApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred in parsing your mathematics.");
      }

      // Populate result
      setActiveResult(data);

      // Save to history storage
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        mode: activeMode,
        inputSnippet: activeMode === "text" ? textInput : "Handwritten sketch",
        result: data,
      };

      const updatedHistory = [newItem, ...historyList].slice(0, 30);
      setHistoryList(updatedHistory);
      localStorage.setItem("math_engine_history", JSON.stringify(updatedHistory));

      // Auto expand all steps initially
      const initExpanded: Record<number, boolean> = {};
      data.steps?.forEach((_: any, idx: number) => {
        initExpanded[idx] = true;
      });
      setExpandedSteps(initExpanded);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process mathematics. Please verify your equation formulation.");
      if (err.message?.includes("GEMINI_API_KEY") || err.message?.includes("Secrets panel")) {
        setIsSecretIssue(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Restore previous historical solutions
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveResult(item.result);
    setActiveMode(item.mode);
    setErrorMessage(null);
    if (item.mode === "text") {
      setTextInput(item.inputSnippet);
    }
    // Auto expand historical steps
    const initExpanded: Record<number, boolean> = {};
    item.result.steps?.forEach((_: any, idx: number) => {
      initExpanded[idx] = true;
    });
    setExpandedSteps(initExpanded);
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("math_engine_history");
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering selection
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("math_engine_history", JSON.stringify(updated));
  };

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation / Scientific Grid HUD */}
      <header className="border-b border-gray-800 bg-[#070b13]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-gray-950 font-bold text-xl shadow-lg shadow-cyan-500/10">
            Σ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold tracking-tight text-white text-base md:text-lg">
                Mathematical Engine
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold shrink-0">
                v1.8.2
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-gray-500 tracking-widest uppercase flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Expert Solver Hub
              </span>
              <span className="text-gray-600 font-sans font-medium">|</span>
              <span className="text-cyan-400/80 font-semibold tracking-wide">By Kyaw Zayar Win</span>
            </div>
          </div>
        </div>

        {/* Input Interface Toggles (Handwriting drawing board vs. text box) */}
        <div className="flex bg-gray-950/70 p-1 border border-gray-800 rounded-xl max-w-sm">
          <button
            id="tab-mode-canvas"
            onClick={() => {
              setActiveMode("canvas");
              setErrorMessage(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium font-display tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === "canvas"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Handwriting Canvas
          </button>
          <button
            id="tab-mode-text"
            onClick={() => {
              setActiveMode("text");
              setErrorMessage(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium font-display tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === "text"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Text Equation Solver
          </button>
        </div>

        {/* Dashboard metadata and help */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-1 text-gray-400 border border-gray-800/80 px-2.5 py-1 rounded-lg bg-gray-950/30">
            <Clock className="w-3.5 h-3.5 text-cyan-500/60" />
            <span>UTC Space Lock: 2026</span>
          </div>
        </div>
      </header>

      {/* Primary Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column - Input Boards & Spec Settings (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5 min-h-0">
          
          <div className="flex-1 min-h-[360px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeMode === "canvas" ? (
                <motion.div
                  key="canvas-mode-wrapper"
                  className="flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DrawingBoard onCapture={setCapturedImage} isLoading={isLoading} />
                </motion.div>
              ) : (
                <motion.div
                  key="text-mode-wrapper"
                  className="flex-1 flex flex-col gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative flex-1 bg-[#090d16] border border-gray-800 rounded-2xl p-4 flex flex-col shadow-inner min-h-[160px]">
                    <div className="absolute top-2.5 right-2.5 text-[9px] text-gray-600 font-mono select-none">
                      MATH EXPRESSION
                    </div>
                    <textarea
                      id="typed-expression-input"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type scientific LaTeX equations or standard arithmetic... (e.g., integrate x^2 from 0 to 5, solve 3x + 5 = 11, determinant [[1,2],[3,4]])"
                      className="w-full h-full flex-1 bg-transparent border-none text-gray-100 placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-0 resize-none pr-6 leading-relaxed"
                    />
                  </div>

                  <div className="h-[210px]">
                    <MathKeypad onInsertSymbol={handleInsertSymbol} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trigger glowing "SOLVE MATHEMATICS" action bar */}
          <div className="flex gap-3">
            <button
              id="submit-math-action"
              onClick={solveMathExpression}
              disabled={isLoading}
              className="flex-1 py-3.5 px-6 rounded-xl font-display font-semibold text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-gray-950 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none shadow-lg shadow-cyan-500/10"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-950 border-t-transparent animate-spin mr-1" />
                  Evaluating Matrix...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Compute Step-by-Step Derivation
                </>
              )}
            </button>
          </div>

          {/* Settings & History tab stack */}
          <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#070b13] flex flex-col select-none">
            <div className="flex border-b border-gray-800 bg-[#0c1220]/80 p-1">
              <button
                id="tab-sidebar-settings"
                onClick={() => setSidebarTab("settings")}
                className={`flex-1 py-2 text-xs font-display font-medium tracking-wide flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === "settings"
                    ? "text-cyan-400 bg-cyan-950/20"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Settings & Settings
              </button>
              <button
                id="tab-sidebar-history"
                onClick={() => setSidebarTab("history")}
                className={`flex-1 py-2 text-xs font-display font-medium tracking-wide flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                  sidebarTab === "history"
                    ? "text-cyan-400 bg-cyan-950/20"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Computation History
              </button>
            </div>

            <div className="p-1 min-h-[160px] bg-[#090d16]">
              {sidebarTab === "settings" ? (
                <SettingsPanel
                  settings={settings}
                  onChangeSettings={setSettings}
                  customApiKey={customApiKey}
                  onCustomApiKeyChange={handleCustomApiKeyChange}
                />
              ) : (
                <HistorySidebar
                  items={historyList}
                  onSelectItem={handleSelectHistoryItem}
                  onClearHistory={handleClearHistory}
                  onDeleteSingleItem={handleDeleteHistoryItem}
                />
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Step-by-step mathematical answers (lg:col-span-5) */}
        <div id="mathematics-result-stream" className="lg:col-span-5 flex flex-col gap-5 min-h-0">
          
          <AnimatePresence mode="wait">
            
            {/* 1. Loading active state */}
            {isLoading && (
              <motion.div
                key="loading-panel"
                className="bg-[#0c1220] border border-gray-800 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center shadow-2xl min-h-[400px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin absolute inset-0" />
                  <div className="w-16 h-16 rounded-full border-4 border-transparent border-b-teal-400 animate-pulse" />
                </div>
                <p className="text-gray-300 font-display font-semibold text-sm tracking-wide uppercase">
                  Engaging Mathematical Core
                </p>
                <p className="text-gray-500 text-xs mt-3 max-w-xs font-mono min-h-[30px] leading-relaxed">
                  {loadingStep}
                </p>
              </motion.div>
            )}

            {/* 2. Error state display */}
            {!isLoading && errorMessage && (
              <motion.div
                key="error-panel"
                className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 min-h-[160px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-3 items-start select-none">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-rose-400 font-display font-semibold text-sm">
                      Numeric Computation Warning
                    </h3>
                    <p className="text-rose-200/80 text-xs mt-1 leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                </div>

                {isSecretIssue && (
                  <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800 text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold text-cyan-400 block mb-1 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-cyan-400" />
                      Configure your API Credentials
                    </span>
                    The Gemini API requires an active master API key injected securely. Head over to 
                    <span className="font-semibold text-gray-200"> Settings &gt; Secrets</span> inside your Google AI Studio toolbar to establish your credentials. Then hit solve again!
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. Empty scoreboard placeholder */}
            {!isLoading && !activeResult && !errorMessage && (
              <motion.div
                key="empty-panel"
                className="bg-[#0c1220] border border-gray-800 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center shadow-2xl select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-14 h-14 rounded-full border border-gray-800 bg-gray-950/40 text-cyan-400/40 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-bold tracking-tight text-white text-sm uppercase">
                  Scientific Terminal Ready
                </h3>
                <p className="text-gray-500 text-xs max-w-xs mt-2 leading-relaxed">
                  Choose your computational pipeline from the header (Handwriting sketch canvas or type algebraic notations) then click Solve to generate a rigorous, peer-reviewed step-by-step solution derivation!
                </p>
              </motion.div>
            )}

            {/* 4. Rich Mathematical Results Panels */}
            {!isLoading && activeResult && !errorMessage && (
              <motion.div
                key="result-panel-wrapper"
                className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pr-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                
                {/* A. Prominent Core Answer Banner Card */}
                <div id="solution-core-answer-card" className="bg-gradient-to-br from-cyan-950/20 to-teal-950/10 border border-cyan-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 uppercase tracking-widest block w-fit mb-2.5">
                    {activeResult.category || "Verification Completed"}
                  </span>
                  
                  <span className="text-[10px] text-gray-500 font-mono block mb-1">EVALUATED ANSWER</span>
                  <div className="text-xl md:text-2xl font-display font-medium tracking-tight text-white break-words mt-1 select-all h-fit">
                    <LatexRenderer math={activeResult.coreAnswer} block={true} />
                  </div>

                  {activeResult.detectedInput && (
                    <p className="text-[10px] text-gray-500 mt-3 font-mono border-t border-gray-800/60 pt-2 flex items-center gap-1 select-none">
                      Parsed Query: <code className="text-gray-400 select-all truncate">{activeResult.detectedInput}</code>
                    </p>
                  )}
                </div>

                {/* B. Graphical coordinate data grid */}
                {activeResult.graphData && activeResult.graphData.isPlottable && (
                  <GraphVisualizer data={activeResult.graphData} />
                )}

                {/* C. Interactive Step-by-Step educational timeline */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1 select-none">
                    <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-gray-400">
                      Step-by-Step Derivation
                    </h3>
                    <span className="text-[10px] font-mono text-gray-500">
                      {activeResult.steps?.length || 0} stages total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeResult.steps?.map((step, idx) => {
                      const isExpanded = expandedSteps[idx] !== false;
                      return (
                        <div
                          key={idx}
                          id={`derivation-step-${idx}`}
                          className="bg-gray-901 border border-gray-800 rounded-xl overflow-hidden transition-all duration-200"
                        >
                          {/* Step Header */}
                          <div
                            onClick={() => toggleStep(idx)}
                            className="bg-gray-950/35 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-950/60"
                          >
                            <span className="text-xs font-mono font-bold text-cyan-400/80">
                              STAGE 0{idx + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-300 truncate max-w-[70%]">
                              {step.explanation.substring(0, 42)}...
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {/* Step Content */}
                          {isExpanded && (
                            <div className="p-4 border-t border-gray-900 bg-[#090d16]/30 flex flex-col gap-3">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {step.explanation}
                              </p>
                              {step.math && (
                                <div className="p-2 bg-gray-950/40 border border-gray-900 rounded-lg text-center overflow-x-auto">
                                  <LatexRenderer math={step.math} block={true} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* D. Alternate formats panel */}
                {activeResult.alternativeForms && activeResult.alternativeForms.length > 0 && (
                  <div className="bg-gray-951 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
                    <span className="text-xs font-display font-semibold uppercase tracking-wider text-gray-400 select-none">
                      Mathematical Alternative Forms
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeResult.alternativeForms.map((alt, idx) => (
                        <div
                          key={idx}
                          id={`alternative-form-${idx}`}
                          className="p-3 rounded-xl bg-gray-955/40 border border-gray-800/80 flex flex-col gap-1 select-all"
                        >
                          <span className="text-[10px] font-medium text-gray-500">{alt.label}</span>
                          <span className="text-xs font-mono text-gray-200 font-semibold truncate">
                            <LatexRenderer math={alt.value} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* Footer copyright HUD */}
      <footer className="border-t border-gray-800 bg-[#070b13]/40 py-5 px-4 text-center text-xs font-mono text-gray-500 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>Mathematical Engine v1.8.2. Running on sandbox cloud environments.</p>
          <p className="text-gray-400">
            Engine Crafted & Engineered <span className="text-cyan-400 font-semibold font-sans">By Kyaw Zayar Win</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
