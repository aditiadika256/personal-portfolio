import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Experience } from "../../types/portfolio";

interface ExperiencePageProps {
  experiences: Experience[];
  activeExpIdx?: number;
  onExpChange?: (index: number) => void;
}

const getInstitutionShort = (inst?: string): string => {
  if (!inst) return "EXP";
  const parenMatch = inst.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].length <= 8) return parenMatch[1].toUpperCase();
  const firstAcronym = inst.match(/\b[A-Z]{2,}\b/);
  if (firstAcronym) return firstAcronym[0].toUpperCase();
  const words = inst.split(/[–,]/)[0].trim();
  return words.length > 12 ? words.slice(0, 12).toUpperCase() : words.toUpperCase();
};

export const ExperiencePage: React.FC<ExperiencePageProps> = ({
  experiences,
  activeExpIdx: externalIdx,
  onExpChange,
}) => {
  const [internalIdx, setInternalIdx] = useState<number>(0);
  const activeIdx = externalIdx !== undefined ? externalIdx : internalIdx;

  const setIndex = (idx: number) => {
    if (onExpChange) onExpChange(idx);
    else setInternalIdx(idx);
  };

  const currentExp = experiences[activeIdx] || experiences[0];

  if (!currentExp) return null;

  return (
    <motion.div
      key={`experience-${currentExp.id || activeIdx}`}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
          {currentExp.institution}
        </span>
        <span className="text-xs font-mono text-bronze-dark font-medium">
          {currentExp.location ? `${currentExp.location} • ${currentExp.period}` : currentExp.period}
        </span>
      </div>

      <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E06D53] tracking-tight leading-none">
        {getInstitutionShort(currentExp.institution)}
      </h2>

      <h3 className="font-sans text-lg sm:text-xl font-semibold text-forest-dark leading-snug">
        {currentExp.role}
      </h3>

      {currentExp.department && (
        <p className="text-xs font-mono text-bronze-dark font-medium">
          ✦ {currentExp.department}
        </p>
      )}

      {currentExp.description && (
        <p className="text-forest/80 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
          {currentExp.description}
        </p>
      )}

      {currentExp.achievements && currentExp.achievements.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {currentExp.achievements.slice(0, 3).map((ach, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-forest/85">
              <CheckCircle2 size={13} className="text-[#E06D53] mt-0.5 shrink-0" />
              <span>{ach}</span>
            </div>
          ))}
        </div>
      )}

      {currentExp.technologies && currentExp.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentExp.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-paper text-forest-dark border border-bronze/35 font-medium shadow-sm"
            >
              #{tech}
            </span>
          ))}
        </div>
      )}

      {/* Experience Selector Pills */}
      {experiences.length > 1 && (
        <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {experiences.map((exp, idx) => (
            <button
              key={exp.id || idx}
              onClick={() => setIndex(idx)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all whitespace-nowrap ${
                activeIdx === idx
                  ? "bg-[#E06D53] text-paper font-semibold shadow-sm"
                  : "bg-paper-card border border-bronze/35 text-forest hover:bg-forest/10"
              }`}
            >
              0{idx + 1} // {getInstitutionShort(exp.institution)} · {exp.role}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
