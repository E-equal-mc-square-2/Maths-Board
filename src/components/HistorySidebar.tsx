import React from "react";
import { HistoryItem } from "../types";
import { Calendar, Trash2, Calculator, Edit3, Bookmark, AlertCircle } from "lucide-react";

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteSingleItem: (id: string, e: React.MouseEvent) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  items,
  onSelectItem,
  onClearHistory,
  onDeleteSingleItem,
}) => {
  return (
    <div id="calculator-history" className="bg-[#0c1220] border border-gray-800 rounded-2xl p-4 flex flex-col h-full select-none select-none">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-300">
            Stored Workspace Logs
          </h3>
        </div>
        {items.length > 0 && (
          <button
            id="clear-all-history"
            onClick={onClearHistory}
            className="text-[10px] text-gray-500 hover:text-rose-400 font-mono transition-colors cursor-pointer flex items-center gap-1"
            title="Wipe workspace history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flush Logs</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 h-full">
            <AlertCircle className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-gray-500 text-xs font-medium">History Stack Clear</p>
            <p className="text-gray-600 text-[10px] mt-1 leading-relaxed">
              Once you process typed expressions or handwritten sketch formulas, they will be securely stored inside your persistent browser hub here.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                onClick={() => onSelectItem(item)}
                className="group relative p-3 rounded-xl bg-gray-900/60 hover:bg-[#131b2c] border border-gray-800/80 hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-950/60 border border-gray-800 text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    {item.mode === "canvas" ? (
                      <Edit3 className="w-2.5 h-2.5 text-cyan-400/80" />
                    ) : (
                      <Calculator className="w-2.5 h-2.5 text-emerald-400/80" />
                    )}
                    {item.result?.category || "Calculated"}
                  </span>

                  <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 opacity-60" />
                    {timeString}
                  </span>
                </div>

                {/* Input query preview */}
                <p className="text-xs font-mono text-gray-300 truncate font-medium group-hover:text-cyan-300">
                  {item.mode === "canvas" ? "[Handwritten Canvas]" : item.inputSnippet}
                </p>

                {/* Core answer previews */}
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  Answer: <span className="text-gray-300 font-sand font-semibold">{item.result.coreAnswer.replace(/\$|\$\$/g, "")}</span>
                </p>

                {/* Single delete tool button */}
                <button
                  id={`delete-history-btn-${item.id}`}
                  onClick={(e) => onDeleteSingleItem(item.id, e)}
                  className="absolute right-2 bottom-2 md:opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/20 text-gray-600 hover:text-rose-400 transition-all cursor-pointer"
                  title="Remove single entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
