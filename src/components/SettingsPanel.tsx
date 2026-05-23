import React from "react";
import { CalculatorSettings } from "../types";
import { Sliders, Check, HelpCircle, Key, Info, ExternalLink } from "lucide-react";

interface SettingsPanelProps {
  settings: CalculatorSettings;
  onChangeSettings: (settings: CalculatorSettings) => void;
  customApiKey: string;
  onCustomApiKeyChange: (key: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChangeSettings,
  customApiKey,
  onCustomApiKeyChange,
}) => {
  const updateDecimal = (val: number | "auto") => {
    onChangeSettings({ ...settings, decimalPlaces: val });
  };

  const updateComplex = (val: "cartesian" | "polar") => {
    onChangeSettings({ ...settings, complexMode: val });
  };

  const updateVerbosity = (val: "concise" | "standard" | "detailed") => {
    onChangeSettings({ ...settings, verbosity: val });
  };

  const toggleSymbolic = () => {
    onChangeSettings({ ...settings, symbolicMode: !settings.symbolicMode });
  };

  return (
    <div id="calculator-settings" className="bg-[#0c1220] border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-300">
          Engine Specifications
        </h3>
      </div>

      {/* Explanation Verbosity Control */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5 justify-between">
          <span>Explanation Verbosity</span>
          <span className="text-[10px] text-cyan-400 font-mono capitalize">
            {settings.verbosity || "standard"}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-950/60 border border-gray-900 rounded-xl">
          {(["concise", "standard", "detailed"] as Array<"concise" | "standard" | "detailed">).map((val) => (
            <button
              key={val}
              id={`setting-verbosity-${val}`}
              onClick={() => updateVerbosity(val)}
              className={`py-1 text-[11px] font-mono capitalize rounded-lg transition-all cursor-pointer ${
                (settings.verbosity || "standard") === val
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Decimal floating focus */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5 justify-between">
          <span>Decimals Float Precision</span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {settings.decimalPlaces === "auto" ? "Floating" : `${settings.decimalPlaces} Places`}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-950/60 border border-gray-900 rounded-xl">
          {(["auto", 2, 4, 6] as Array<"auto" | number>).map((val) => (
            <button
              key={val}
              id={`setting-decimal-${val}`}
              onClick={() => updateDecimal(val)}
              className={`py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
                settings.decimalPlaces === val
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {val === "auto" ? "Auto" : val}
            </button>
          ))}
        </div>
      </div>

      {/* Complex standard preference */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400">Complex Numbers Presentation</label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-950/60 border border-gray-900 rounded-xl">
          <button
            id="setting-complex-cartesian"
            onClick={() => updateComplex("cartesian")}
            className={`py-1.5 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              settings.complexMode === "cartesian"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span>Cartesian (a + bi)</span>
          </button>
          <button
            id="setting-complex-polar"
            onClick={() => updateComplex("polar")}
            className={`py-1.5 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              settings.complexMode === "polar"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-semibold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span>Polar (re^iθ)</span>
          </button>
        </div>
      </div>

      {/* Symbolic computing */}
      <div className="flex items-center justify-between p-2.5 bg-gray-950/40 rounded-xl border border-gray-900">
        <div className="flex flex-col gap-0.5 max-w-[85%]">
          <span className="text-xs font-medium text-gray-300">Exact / Symbolic Focus</span>
          <span className="text-[9px] text-gray-500 leading-tight">
            Prioritize exact fractions, unsimplified pi, and radical forms over rounded reals.
          </span>
        </div>
        <button
          id="setting-symbolic-toggle"
          onClick={toggleSymbolic}
          className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
            settings.symbolicMode
              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
              : "border-gray-800 bg-gray-900 hover:border-gray-700 text-transparent"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Google AI Studio API Key input section */}
      <div className="p-3.5 mt-1 bg-cyan-950/15 border border-cyan-500/15 rounded-xl text-xs text-gray-400 flex flex-col gap-2.5">
        <div className="flex items-center justify-between font-medium text-cyan-300">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google AI Studio API Key</span>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            referrerPolicy="no-referrer"
            className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5"
          >
            Get Key <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="flex flex-col gap-1">
          <input
            id="custom-api-key-input"
            type="password"
            value={customApiKey}
            onChange={(e) => onCustomApiKeyChange(e.target.value)}
            placeholder="Paste your AI Studio GEMINI_API_KEY here"
            className="w-full bg-gray-950/80 border border-gray-800 focus:border-cyan-500/40 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-200"
          />
          <span className="text-[9px] text-gray-500 leading-tight">
            Optional. Leaving this empty runs on default cloud sandbox credentials.
          </span>
        </div>
      </div>
    </div>
  );
};
