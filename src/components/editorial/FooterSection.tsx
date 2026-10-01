import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, FileDown } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../icons/SocialIcons";
import type { Profile } from "../../types/portfolio";

interface FooterSectionProps {
  profile: Profile;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ profile }) => {
  return (
    <motion.div
      key="contact-content"
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 text-paper"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
          DIRECT CHANNELS
        </span>
        {profile.location && (
          <span className="text-xs font-mono text-bronze-light font-medium uppercase">
            {profile.location}
          </span>
        )}
      </div>

      <h2 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E06D53] tracking-tight leading-none">
        DISPATCH
      </h2>

      {profile.availabilityStatus && (
        <h3 className="font-sans text-lg sm:text-xl font-semibold text-paper leading-snug">
          {profile.availabilityStatus}
        </h3>
      )}

      {profile.bio && (
        <p className="text-paper/70 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
          {profile.bio.length > 200 ? `${profile.bio.slice(0, 200)}…` : profile.bio}
        </p>
      )}

      <div className="space-y-2 pt-2 text-xs font-mono">
        <div className="flex items-center gap-3 text-paper/90">
          <Mail size={14} className="text-[#E06D53]" />
          <span>{profile.email}</span>
        </div>
        <div className="flex items-center gap-3 text-paper/90">
          <Phone size={14} className="text-[#E06D53]" />
          <span>{profile.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-paper/90">
          <MapPin size={14} className="text-[#E06D53]" />
          <span>{profile.location}</span>
        </div>
      </div>

      <div className="pt-3 flex items-center gap-3">
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg border border-paper/20 bg-paper/10 text-paper hover:bg-paper hover:text-forest-dark transition-all"
            title="GitHub"
          >
            <GithubIcon size={16} />
          </a>
        )}
        {profile.linkedinUrl && (
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg border border-paper/20 bg-paper/10 text-paper hover:bg-paper hover:text-forest-dark transition-all"
            title="LinkedIn"
          >
            <LinkedinIcon size={16} />
          </a>
        )}
        {profile.pdfResumeUrl && (
          <a
            href={profile.pdfResumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E06D53] text-paper font-mono text-xs font-bold hover:bg-[#d05d43] transition-all"
          >
            <FileDown size={14} />
            <span>Download Resume</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};
