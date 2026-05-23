import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { GraphData } from "../types";
import { LineChart as ChartIcon, Eye, Move } from "lucide-react";

interface GraphVisualizerProps {
  data: GraphData | null | undefined;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ data }) => {
  if (!data || !data.isPlottable || !data.points || data.points.length === 0) {
    return (
      <div id="graph-panel-empty" className="bg-[#0c1220] border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] select-none">
        <div className="w-12 h-12 rounded-full border border-gray-800 bg-gray-950/40 text-gray-600 flex items-center justify-center mb-3">
          <ChartIcon className="w-5 h-5" />
        </div>
        <p className="text-gray-400 font-display text-sm font-medium">Cartesian Plotter</p>
        <p className="text-gray-600 text-xs mt-1 max-w-xs leading-relaxed">
          No plottable function detected in current solution. Standard algebraic curves, sine/cosine oscillations, or parabolic integrals will automatically trigger real-time 2D graphing grids here!
        </p>
      </div>
    );
  }

  // Find min/max values to construct elegant scale ranges
  const xValues = data.points.map((p) => p.x);
  const yValues = data.points.map((p) => p.y);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return (
    <div id="graph-panel-active" className="bg-[#0c1220] border border-gray-800 rounded-2xl p-4 flex flex-col h-full select-none">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-300">
            {data.title || "Mathematical Curve Visualizer"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <Eye className="w-3.5 h-3.5 text-cyan-500/60" />
          <span>Interactive Plot</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.points}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Standard mathematical drawing grid pattern */}
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" opacity={0.5} />
            
            {/* Monospace themed mathematical axes */}
            <XAxis
              dataKey="x"
              stroke="#4b5563"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              type="number"
              domain={["auto", "auto"]}
            />
            <YAxis
              stroke="#4b5563"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              type="number"
              domain={["auto", "auto"]}
            />

            {/* Glowing origin axes (Y=0, X=0) matching professional plot environments */}
            <ReferenceLine y={0} stroke="#374151" strokeWidth={1} strokeDasharray="5 5" />
            <ReferenceLine x={0} stroke="#374151" strokeWidth={1} strokeDasharray="5 5" />

            {/* Custom high-fidelity mathematical cursor info tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#090d16",
                borderColor: "#1f2937",
                borderRadius: "12px",
                fontFamily: "monospace",
                color: "#f3f4f6",
                fontSize: "11px",
              }}
              labelFormatter={(label) => `x = ${Number(label).toFixed(3)}`}
            />

            {/* Bright scientific teal plot line */}
            <Line
              type="monotone"
              dataKey="y"
              name="f(x)"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 2, stroke: "#22d3ee", fill: "#090d16", strokeWidth: 1 }}
              activeDot={{ r: 5, stroke: "#22d3ee", fill: "#06b6d4", strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grid statistics metadata */}
      <div className="mt-3 pt-3 border-t border-gray-800/65 grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
        <div>
          <span className="text-gray-600 block">Domain (x)</span>
          <span>[{minX.toFixed(2)}, {maxX.toFixed(2)}]</span>
        </div>
        <div>
          <span className="text-gray-600 block">Range (y)</span>
          <span>[{minY.toFixed(2)}, {maxY.toFixed(2)}]</span>
        </div>
      </div>
    </div>
  );
};
