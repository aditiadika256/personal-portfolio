import React, { useState } from "react";
import { BadgeQuestionMark, Database, Download } from "lucide-react";

interface FloatingActionMenuProps {
  onOpenAdmin?: () => void;
  pdfUrl?: string;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onOpenAdmin, pdfUrl }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-4 sm:bottom-8 left-4 sm:left-8 z-50 flex flex-col items-center justify-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`flex flex-col gap-3 mb-3 transition-all duration-300 origin-bottom ${
          isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        }`}
      >
        {/* ATS CV Button */}
        <a
          href={pdfUrl || "#"}
          target={pdfUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-forest text-paper shadow-lg hover:bg-forest-dark transition-colors"
        >
          <Download size={16} />
          {/* Tooltip */}
          <span className="absolute left-12 px-2.5 py-1 rounded-md bg-forest-dark text-paper text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Download ATS CV
          </span>
        </a>

        {/* Database Tools Button */}
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-paper border border-bronze/30 text-forest shadow-lg hover:bg-bronze/10 transition-colors"
          >
            <Database size={16} />
            {/* Tooltip */}
            <span className="absolute left-12 px-2.5 py-1 rounded-md bg-paper border border-bronze/30 text-forest text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Firebase Tools
            </span>
          </button>
        )}
      </div>

      {/* Main Floating Action Button */}
      <button 
        className={`w-12 h-12 rounded-full bg-[#E06D53] text-paper shadow-xl flex items-center justify-center transition-transform duration-300 ${isHovered ? "rotate-45" : ""}`}
        aria-label="Actions"
      >
        <BadgeQuestionMark size={24} />
      </button>
    </div>
  );
};
