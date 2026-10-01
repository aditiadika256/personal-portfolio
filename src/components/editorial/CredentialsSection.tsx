import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Education, Certification } from "../../types/portfolio";

interface CredentialsSectionProps {
  educations: Education[];
  certifications: Certification[];
}

export const CredentialsSection: React.FC<CredentialsSectionProps> = ({
  educations,
  certifications,
}) => {
  const [credentialTab, setCredentialTab] = useState<"certifications" | "education">("certifications");

  return (
    <motion.div
      key={`credentials-${credentialTab}`}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 text-paper"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-[#E06D53]/15 text-[#E06D53] font-semibold border border-[#E06D53]/25 whitespace-nowrap">
          {credentialTab === "certifications"
            ? `${certifications.length} VERIFIED CREDENTIALS`
            : `${educations.length} ACADEMIC DEGREES`}
        </span>
        <span className="text-xs font-mono text-bronze-light font-medium">
          OFFICIAL RECORD
        </span>
      </div>

      <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E06D53] tracking-tight leading-none">
        {credentialTab === "certifications" ? "ACCREDITATION" : "ACADEMIA"}
      </h2>

      {/* Switcher Tabs */}
      <div className="pt-1 flex items-center gap-3">
        <button
          onClick={() => setCredentialTab("certifications")}
          className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all whitespace-nowrap ${
            credentialTab === "certifications"
              ? "bg-[#E06D53] text-paper font-semibold shadow-sm"
              : "bg-paper/10 text-paper/70 border border-paper/15 hover:bg-paper/20"
          }`}
        >
          Certifications ({certifications.length})
        </button>
        <button
          onClick={() => setCredentialTab("education")}
          className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all whitespace-nowrap ${
            credentialTab === "education"
              ? "bg-[#E06D53] text-paper font-semibold shadow-sm"
              : "bg-paper/10 text-paper/70 border border-paper/15 hover:bg-paper/20"
          }`}
        >
          Education ({educations.length})
        </button>
      </div>

      {/* Dynamic List Content */}
      <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1 no-scrollbar">
        {credentialTab === "certifications" ? (
          certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-3 rounded-xl bg-paper/5 border border-paper/10 hover:border-[#E06D53]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-sans font-semibold text-sm text-paper">{cert.name}</h4>
                  <p className="text-xs font-mono text-bronze-light">{cert.issuer}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper/10 text-paper/90 border border-paper/15">
                    {cert.issueYear}
                  </span>
                  {cert.category && (
                    <p className="text-[9px] font-mono text-paper/50 mt-1 uppercase">
                      {cert.category}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          educations.map((edu) => (
            <div
              key={edu.id}
              className="p-3 rounded-xl bg-paper/5 border border-paper/10 hover:border-[#E06D53]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-sans font-semibold text-sm text-paper">{edu.degree}</h4>
                  <p className="text-xs font-mono text-bronze-light">
                    {edu.institution} • {edu.period}
                  </p>
                </div>
                {edu.gpa && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E06D53]/20 text-[#E06D53] border border-[#E06D53]/30 font-bold shrink-0">
                    GPA {edu.gpa}
                  </span>
                )}
              </div>
              {edu.finalProject && (
                <div className="mt-2 pt-2 border-t border-paper/10">
                  <p className="text-[11px] font-sans text-paper/85">
                    <span className="font-semibold text-[#E06D53]">Final Project:</span>{" "}
                    {edu.finalProject.title}
                  </p>
                  {edu.finalProject.domain && (
                    <p className="text-[9px] font-mono text-paper/60 mt-0.5">
                      Domain: {edu.finalProject.domain}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
