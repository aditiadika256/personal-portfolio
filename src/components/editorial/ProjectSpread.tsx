import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GithubIcon } from "../icons/SocialIcons";
import type { Project } from "../../types/portfolio";

interface ProjectSpreadProps {
  projects: Project[];
  activeProjectIdx?: number;
  onProjectChange?: (index: number) => void;
}

export const ProjectSpread: React.FC<ProjectSpreadProps> = ({
  projects,
  activeProjectIdx: externalIdx,
  onProjectChange,
}) => {
  const [internalIdx, setInternalIdx] = useState<number>(0);

  const activeIdx = externalIdx !== undefined ? externalIdx : internalIdx;
  const setIndex = (idx: number) => {
    if (onProjectChange) onProjectChange(idx);
    else setInternalIdx(idx);
  };

  const currentProject = projects[activeIdx] || projects[0];

  if (!currentProject) {
    return null;
  }

  return (
    <motion.div
      key={`projects-${currentProject.id || activeIdx}`}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 text-paper"
    >
      <div className="flex flex-wrap items-center gap-2">
        {currentProject.category && (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
            {currentProject.category}
          </span>
        )}
        <span className="text-xs font-mono text-bronze-light font-medium">
          {currentProject.organization
            ? `${currentProject.organization} • ${currentProject.period}`
            : currentProject.period}
        </span>
      </div>

      <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E06D53] tracking-tight leading-tight">
        {currentProject.title}
      </h2>

      {currentProject.summary && (
        <p className="text-paper/80 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
          {currentProject.summary}
        </p>
      )}

      {currentProject.highlights && currentProject.highlights.length > 0 && (
        <ul className="text-xs sm:text-sm font-sans text-paper/75 space-y-1 list-disc list-inside">
          {currentProject.highlights.slice(0, 3).map((item, idx) => (
            <li key={idx} className="line-clamp-1">{item}</li>
          ))}
        </ul>
      )}

      {currentProject.tags && currentProject.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentProject.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-paper/10 text-paper/90 border border-paper/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-2 flex items-center gap-4">
        {(currentProject.liveUrl || currentProject.githubUrl) && (
          <a
            href={currentProject.liveUrl || currentProject.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-paper hover:text-[#E06D53] transition-colors group py-2"
          >
            <span>OPEN CASE STUDY</span>
            <ArrowRight
              size={16}
              className="text-[#E06D53] transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </a>
        )}

        {currentProject.githubUrl && (
          <a
            href={currentProject.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-paper/20 bg-paper/10 text-paper hover:bg-paper hover:text-forest-dark transition-all"
            title="Inspect Source Code"
          >
            <GithubIcon size={16} />
          </a>
        )}
      </div>

      {/* Project Selector Navigation Pills */}
      {projects.length > 1 && (
        <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {projects.map((proj, idx) => (
            <button
              key={proj.id || idx}
              onClick={() => setIndex(idx)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all whitespace-nowrap ${
                activeIdx === idx
                  ? "bg-[#E06D53] text-paper font-semibold shadow-sm"
                  : "bg-paper/10 text-paper/70 hover:bg-paper/20 border border-paper/10"
              }`}
            >
              0{idx + 1} // {proj.title.length > 26 ? proj.title.slice(0, 26) + "…" : proj.title}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
