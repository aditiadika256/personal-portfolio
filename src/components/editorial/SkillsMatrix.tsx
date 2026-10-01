import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, BarChart3, Code2, Network } from "lucide-react";
import type { SkillMatrix } from "../../types/portfolio";

interface SkillsMatrixProps {
  skills: SkillMatrix;
}

export const SkillsMatrix: React.FC<SkillsMatrixProps> = ({ skills }) => {
  const [selectedCatIdx, setSelectedCatIdx] = useState<number>(0);
  const currentSkillCat = skills.hardSkills[selectedCatIdx] || skills.hardSkills[0];

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("intelligence") || category.toLowerCase().includes("ai")) {
      return <Cpu size={16} className="text-[#E06D53]" />;
    }
    if (category.toLowerCase().includes("analytic") || category.toLowerCase().includes("data")) {
      return <BarChart3 size={16} className="text-forest" />;
    }
    if (category.toLowerCase().includes("program") || category.toLowerCase().includes("database")) {
      return <Code2 size={16} className="text-bronze-dark" />;
    }
    return <Network size={16} className="text-forest-dark" />;
  };

  return (
    <motion.div
      key="skills-content"
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
          {currentSkillCat?.category}
        </span>
        <span className="text-xs font-mono text-bronze-dark font-medium">
          {currentSkillCat?.items.length} CORE CAPABILITIES
        </span>
      </div>

      <h2 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E06D53] tracking-tight leading-none">
        STACK
      </h2>

      {currentSkillCat?.category && (
        <h3 className="font-sans text-lg sm:text-xl font-semibold text-forest-dark leading-snug">
          {currentSkillCat.category}
        </h3>
      )}

      {currentSkillCat?.items && (
        <p className="text-forest/80 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
          Specialized proficiency and applied technical competencies in {currentSkillCat.category}.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {currentSkillCat?.items.map((skill, sIdx) => (
          <span
            key={sIdx}
            className="px-2.5 py-1 rounded text-xs font-mono bg-paper text-forest-dark border border-bronze/35 font-medium shadow-sm"
          >
            #{skill}
          </span>
        ))}
      </div>

      {/* Skills Category Tabs */}
      <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {skills.hardSkills.map((cat, idx) => (
          <button
            key={cat.category || idx}
            onClick={() => setSelectedCatIdx(idx)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono transition-all whitespace-nowrap ${
              selectedCatIdx === idx
                ? "bg-[#E06D53] text-paper font-semibold shadow-sm"
                : "bg-paper-card border border-bronze/35 text-forest hover:bg-forest/10"
            }`}
          >
            <span>{getCategoryIcon(cat.category)}</span>
            <span>{cat.category}</span>
          </button>
        ))}
      </div>

      {/* Soft Skills Section */}
      {skills.softSkills && skills.softSkills.length > 0 && (
        <div className="pt-3 border-t border-forest/10">
          <p className="text-[10px] font-mono text-bronze-dark uppercase tracking-wider mb-2">
            ✦ Core Professional Competencies
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.softSkills.map((softSkill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-sans bg-forest/5 text-forest border border-forest/15"
              >
                {softSkill}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
