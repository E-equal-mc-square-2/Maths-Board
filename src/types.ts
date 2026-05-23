export interface MathStep {
  explanation: string;
  math: string;
}

export interface AlternativeForm {
  label: string;
  value: string;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphData {
  isPlottable: boolean;
  title: string;
  points: GraphPoint[];
}

export interface MathResult {
  detectedInput: string;
  coreAnswer: string;
  category: string;
  steps: MathStep[];
  alternativeForms: AlternativeForm[];
  graphData?: GraphData | null;
}

export interface CalculatorSettings {
  decimalPlaces: number | "auto";
  complexMode: "cartesian" | "polar";
  symbolicMode: boolean;
  verbosity: "concise" | "standard" | "detailed";
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  mode: "text" | "canvas";
  inputSnippet: string; // Preview string (text math, or base64 canvas thumbnail)
  result: MathResult;
}
