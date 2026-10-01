import React from "react";

interface VerticalNavRailProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export const VerticalNavRail: React.FC<VerticalNavRailProps> = ({
  activeSection,
  onSelectSection,
  onHoverChange,
}) => {
  const sections = [
    { id: "cover", num: "01", label: "Overview" },
    { id: "projects", num: "02", label: "Works & AI" },
    { id: "experience", num: "03", label: "Research" },
    { id: "credentials", num: "04", label: "Credentials" },
    { id: "skills", num: "05", label: "Skill Matrix" },
    { id: "contact", num: "06", label: "Colophon" },
  ];

  return (
    <aside
      aria-label="Section Navigation"
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {/* Glass pill container — visible on both light and dark section backgrounds */}
      <div className="flex flex-col items-center gap-3 py-3 px-1.5 bg-paper-dark/30 backdrop-blur-lg rounded-full border border-paper/10 shadow-lg">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className="group relative flex items-center justify-center transition-all duration-300"
              aria-label={`Jump to ${sec.label}`}
            >
              {/* Label — appears on hover, positioned to the left of the dot */}
              <span
                className={`absolute right-full mr-3 whitespace-nowrap text-[10px] font-mono tracking-widest uppercase transition-all duration-300 opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-md backdrop-blur-md shadow-md ${
                  isActive
                    ? "text-paper font-bold bg-forest-dark/80"
                    : "text-paper font-medium bg-paper-dark/70"
                }`}
              >
                {sec.label}
              </span>

              {/* Dot Indicator */}
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-1.5 h-5 bg-[#E06D53] shadow-[0_0_8px_rgba(224,109,83,0.5)]" // active pill
                    : "w-1.5 h-1.5 bg-paper/50 group-hover:bg-paper/90" // dot
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};
