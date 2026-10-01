import React, { useState } from "react";
import { ActiveHologramStation } from "../3d/ActiveHologramStation";
import { Eye, EyeOff, Sparkles } from "lucide-react";

interface SectionHologramWidgetProps {
  activeSection: string;
}

export const SectionHologramWidget: React.FC<SectionHologramWidgetProps> = ({
  activeSection,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const sectionMetadata: Record<
    string,
    { label: string; code: string; type: "crystal" | "cube" | "mesh" | "sphere" }
  > = {
    cover: { label: "OVERVIEW // SPATIAL GEO-NODE", code: "BANJARBARU-S3.44", type: "sphere" },
    projects: { label: "WORKS // APPLIED AI & VISION", code: "EFF-NET-B3.NDVI", type: "crystal" },
    experience: { label: "RESEARCH // DATA SCIENCE LAB", code: "BRIN-TELKOM.RES", type: "mesh" },
    credentials: { label: "CREDENTIALS // BNSP CERTIFIED", code: "BNSP-DS.VERIFIED", type: "crystal" },
    skills: { label: "SKILLS // TENSOR MATRIX", code: "PYTHON-PYTORCH.CV", type: "cube" },
    contact: { label: "COLOPHON // RADAR BEACON", code: "BEACON.DISPATCH", type: "sphere" },
  };

  const currentMeta = sectionMetadata[activeSection] || sectionMetadata.cover;

  // Sembunyikan floating widget jika sedang di section projects karena sudah memiliki station terintegrasi
  if (activeSection === "projects") {
    return null;
  }

  return (
    <div
      aria-label="Active 3D Hologram Station"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 transition-all duration-500 hidden sm:block"
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="card-glass p-2.5 rounded-full border border-bronze/40 shadow-editorial text-forest hover:text-terracotta hover:scale-105 transition-all flex items-center gap-2 group"
          title="Buka 3D Hologram Station"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-mono text-[10px] tracking-wider font-semibold text-forest-dark pr-1">
            3D HOLOGRAM
          </span>
          <Eye size={14} className="text-bronze group-hover:text-forest" />
        </button>
      ) : (
        <div className="w-56 sm:w-64 bg-paper/90 backdrop-blur-md rounded-2xl border-2 border-bronze/50 shadow-2xl p-2 relative overflow-hidden transition-all duration-300">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-1.5 pb-1 mb-1 border-b border-bronze/30 text-[9px] font-mono">
            <span className="flex items-center gap-1 text-terracotta font-semibold tracking-wider">
              <Sparkles size={10} />
              ACTIVE HOLOGRAM
            </span>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-forest/60 hover:text-terracotta p-0.5 rounded transition-colors"
              title="Minimize Hologram"
            >
              <EyeOff size={12} />
            </button>
          </div>

          {/* 3D Hologram Render with Scanline */}
          <ActiveHologramStation
            sectionId={activeSection}
            projectType={currentMeta.type}
            title={currentMeta.label}
            subtitle={currentMeta.code}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};
