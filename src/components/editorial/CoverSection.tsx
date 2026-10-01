import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileDown } from "lucide-react";
import type { Profile } from "../../types/portfolio";

interface CoverSectionProps {
  profile: Profile;
  tags?: string[];
  onExplore?: () => void;
}

export const CoverSection: React.FC<CoverSectionProps> = ({ profile, tags, onExplore }) => {
  const displayName = (profile.preferredName || profile.fullName || "").toUpperCase();

  return (
    <motion.div
      key="cover-content"
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {profile.editorialRole && (
          <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
            {profile.editorialRole}
          </span>
        )}
        {profile.location && (
          <span className="text-xs font-mono text-bronze-dark font-medium">
            {profile.location}
          </span>
        )}
      </div>

      <h1 className="font-editorial text-6xl sm:text-7xl lg:text-8xl font-bold text-[#E06D53] tracking-tight leading-none">
        {displayName}
      </h1>

      {profile.editorialTitle && (
        <h2 className="font-sans text-lg sm:text-xl font-semibold text-forest-dark leading-snug">
          {profile.editorialTitle}
        </h2>
      )}

      {profile.bio && (
        <p className="text-forest/85 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
          {profile.bio}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded text-xs font-mono bg-paper text-forest-dark border border-bronze/35 font-medium shadow-sm"
            >
              #{tag.replace(/\s+/g, "")}
            </span>
          ))}
        </div>
      )}

      <div className="pt-2 flex flex-wrap items-center gap-5">
        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-forest-dark hover:text-[#E06D53] transition-colors group py-2"
        >
          <span>EXPLORE CASE STUDIES</span>
          <ArrowRight
            size={16}
            className="text-[#E06D53] transition-transform duration-300 group-hover:translate-x-1.5"
          />
        </button>

        {profile.pdfResumeUrl && (
          <a
            href={profile.pdfResumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bronze/35 bg-paper-card text-forest text-xs font-mono hover:bg-forest hover:text-paper transition-all"
          >
            <FileDown size={14} />
            <span>Curriculum Vitae</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};
