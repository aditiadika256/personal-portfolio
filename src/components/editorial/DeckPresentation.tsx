import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ProjectPopoutHologram } from "../3d/ProjectPopoutHologram";
import { SectionPopoutHologram } from "../3d/SectionPopoutHologram";
import { CARD_CONTENT } from "./MiniCard";
import { CoverSection } from "./CoverSection";
import { ProjectSpread } from "./ProjectSpread";
import { ExperiencePage } from "./ExperiencePage";
import { CredentialsSection } from "./CredentialsSection";
import { SkillsMatrix } from "./SkillsMatrix";
import { FooterSection } from "./FooterSection";
import type { PortfolioData } from "../../types/portfolio";

const SECTION_CONFIGS = [
  {
    id: "cover",
    title: "PORTRAIT REF // EXECUTIVE INTEL",
    label: "COVER",
    bgColor: "#F8FAE5",
    theme: "light",
  },
  {
    id: "projects",
    title: "MODEL ARCHIVE // CASE STUDIES",
    label: "PROJECTS",
    bgColor: "#1A3026",
    theme: "dark",
  },
  {
    id: "experience",
    title: "CHRONICLE REF // CAREER MILESTONES",
    label: "EXPERIENCE",
    bgColor: "#EFECE6",
    theme: "light",
  },
  {
    id: "credentials",
    title: "ACCREDITATION // VERIFIED RECORD",
    label: "CREDENTIALS",
    bgColor: "#0D1B15",
    theme: "dark",
  },
  {
    id: "skills",
    title: "CAPABILITY MATRIX // TECHNICAL ARSENAL",
    label: "SKILLS",
    bgColor: "#F8FAE5",
    theme: "light",
  },
  {
    id: "contact",
    title: "COLOPHON // DIRECT DISPATCH",
    label: "CONTACT",
    bgColor: "#2D4F41",
    theme: "dark",
  },
];



interface DeckPresentationProps {
  data: PortfolioData;
  isNavHovered?: boolean;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const DeckPresentation: React.FC<DeckPresentationProps> = ({
  data,
  isNavHovered: _isNavHovered,
  activeSection,
  onSectionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering3D, setIsHovering3D] = useState<boolean>(false);
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);

  // Responsive device classification for perspective scaling
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardsData = [
    {
      id: "cover",
      text: `SPATIAL PORTRAIT · ${(data.profile.preferredName || data.profile.fullName || "").toUpperCase()}`,
      image: CARD_CONTENT.cover.image,
    },
    {
      id: "projects",
      text: `CASE STUDIES // ${(data.projects[0]?.title ? data.projects[0].title.slice(0, 24) : "PROJECTS").toUpperCase()}`,
      image: CARD_CONTENT.project.image,
    },
    {
      id: "experience",
      text: `CAREER // ${(data.experiences[0]?.institution ? data.experiences[0].institution.slice(0, 24) : "EXPERIENCE").toUpperCase()}`,
      image: CARD_CONTENT.experience.image,
    },
    {
      id: "credentials",
      text: `ACCREDITATION // ${data.certifications.length} CERTS · ${data.educations.length} DEGREES`,
      image: CARD_CONTENT.credentials.image,
    },
    {
      id: "skills",
      text: `CAPABILITY MATRIX // ${data.skills.hardSkills.length} DOMAINS`,
      image: CARD_CONTENT.skills.image,
    },
    {
      id: "contact",
      text: `DISPATCH // ${(data.profile.location || "CONTACT").toUpperCase()}`,
      image: CARD_CONTENT.footer.image,
    },
  ];

  // Setup scroll tracking for 6 sections (600vh total height)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Continuous virtual index from 0 to 5
  const vIndex = useTransform(scrollYProgress, [0, 1], [0, 5]);

  // Smooth background color interpolation
  const backgroundColor = useTransform(
    vIndex,
    [0, 1, 2, 3, 4, 5],
    SECTION_CONFIGS.map((s) => s.bgColor)
  );

  // Sync activeIndex with scroll progress
  useMotionValueEvent(vIndex, "change", (latest) => {
    const rounded = Math.round(latest);
    const clamped = Math.max(0, Math.min(5, rounded));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
      const sectionId = SECTION_CONFIGS[clamped].id;
      if (activeSection !== sectionId) {
        onSectionChange(sectionId);
      }
    }
  });

  const scrollToSectionIndex = (index: number) => {
    const wh = window.innerHeight;
    const targetY = index * wh;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(targetY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const currentProject = data.projects[activeProjectIdx] || data.projects[0];
  const isDark = SECTION_CONFIGS[activeIndex]?.theme === "dark";
  const preferredName = data.profile.preferredName || data.profile.fullName || "PORTFOLIO";

  const pFactor = isMobile ? 0.35 : isTablet ? 0.65 : 1.0;

  return (
    <div ref={containerRef} className="relative w-full h-[600vh]">
      {/* Anchor targets for direct navigation */}
      {SECTION_CONFIGS.map((s, idx) => (
        <div
          key={s.id}
          id={s.id}
          className="absolute w-full pointer-events-none"
          style={{ top: `${idx * 100}vh`, height: "100vh" }}
        />
      ))}

      {/* ========================================================
       * STICKY FULLSCREEN PRESENTATION STAGE (100vh)
       * ======================================================== */}
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between selection:bg-terracotta selection:text-paper"
        style={{ backgroundColor }}
      >
        {/* Robin Noguier Left Accent Vertical Bar */}
        <div className="absolute left-0 top-12 bottom-12 w-1.5 bg-[#E06D53] rounded-r-full hidden lg:block opacity-85 shadow-[0_0_12px_rgba(224,109,83,0.5)] z-50" />

        {/* Top Editorial Subheader */}
        <div className="relative z-30 pt-6 px-6 sm:px-12 lg:px-16 flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E06D53] font-bold">
              SECTION 0{activeIndex + 1} // {SECTION_CONFIGS[activeIndex].title}
            </span>
            <span className={`text-xs font-mono hidden sm:inline ${isDark ? "text-paper/40" : "text-forest/40"}`}>
              •
            </span>
            <span className={`text-xs font-mono hidden sm:inline ${isDark ? "text-paper/60" : "text-forest/60"}`}>
              {preferredName.toUpperCase()} EDITORIAL
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-[#E06D53] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CARD DECK ACTIVE
            </span>
          </div>
        </div>

        {/* ========================================================
         * MAIN STAGE: GRID LAYOUT (LEFT: ANGLED DECK, RIGHT: EDITORIAL)
         * ======================================================== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-4 sm:px-8 lg:px-12 relative overflow-visible">
          
          {/* ========================================================
           * LEFT COLUMN: THE CONTINUOUS STICKY CINEMATIC 3D CARD DECK
           * Perspective camera at bottom-left looking toward top-right
           * ======================================================== */}
          <div 
            className="lg:col-span-7 relative flex flex-col items-center justify-center h-full min-h-[520px] select-none"
          >
            <div
              className="relative w-full flex flex-col items-center justify-center"
            >
              {cardsData.map((card, i) => {
                const relative = useTransform(vIndex, (v) => i - v);
                
                // Continuous motion along the 3D ascending track (bottom-left to top-right)
                // Tuned spacing to match landscape cards (height ~330-370px)
                const y = useTransform(relative, (r) => r * 280);
                const x = useTransform(relative, (r) => r * -45 * pFactor); // moves along diagonal vanishing line
                
                // Scale: active card is closest and most prominent (1.0), inactive scale down
                const scale = useTransform(relative, (r) => {
                  const dist = Math.abs(r);
                  return Math.max(0.85, 1 - dist * 0.08);
                });

                // Unified 3D perspective rotation (strictly identical angle across all cards in deck):
                // Card above, active card, and card below remain 100% parallel with identical pitch, yaw, and roll.
                const rotateX = 16 * pFactor;
                const rotateY = 24 * pFactor;
                const rotateZ = -8 * (isMobile ? 0.5 : 1.0);

                const opacity = useTransform(relative, (r) => {
                  const dist = Math.abs(r);
                  if (dist > 1.8) return 0;
                  if (dist > 0.8) return 0.75 - (dist - 0.8) * 0.75;
                  return 1;
                });
                
                const zIndex = useTransform(relative, (r) => Math.round(30 - Math.abs(r) * 8));

                const isCurrentActive = activeIndex === i;

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => scrollToSectionIndex(i)}
                    className={`absolute w-[90vw] max-w-[420px] sm:max-w-none sm:w-[580px] lg:w-[640px] xl:w-[720px] 2xl:w-[760px] h-[210px] sm:h-[290px] lg:h-[330px] xl:h-[370px] 2xl:h-[390px] cursor-pointer overflow-visible select-none`}
                    style={{
                      x,
                      y,
                      scale,
                      opacity,
                      zIndex,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* 1. TILTED CARD PANEL (Angled 3D Surface / Pedestal in cinematic perspective) */}
                    <motion.div
                      className={`absolute inset-0 rounded-3xl overflow-hidden transition-[border-color,box-shadow,background-color] duration-300 ${
                        isCurrentActive
                          ? "border-2 border-[#E06D53] ring-4 ring-[#E06D53]/25 shadow-[-25px_40px_80px_rgba(0,0,0,0.7),0_15px_30px_rgba(224,109,83,0.3)] bg-gradient-to-br from-[#1E3329] via-[#14241D] to-[#0A130F]"
                          : "border border-white/20 hover:border-[#E06D53]/50 shadow-[-15px_25px_50px_rgba(0,0,0,0.6)] bg-slate-900"
                      }`}
                      style={{
                        transformPerspective: isMobile ? 1200 : isTablet ? 1150 : 1100,
                        rotateX,
                        rotateY,
                        rotateZ,
                        transformOrigin: "center center",
                      }}
                    >
                      {/* Subtle 3D Surface Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-black/40 pointer-events-none z-10" />

                      {/* Non-active preview card */}
                      {!isCurrentActive ? (
                        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.text}
                            className="w-full h-full object-cover filter grayscale contrast-125 opacity-60"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[9px] font-mono text-paper/80 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D53]" />
                            <span>SECTION 0{i + 1}</span>
                          </div>
                          <span className="absolute bottom-3 left-4 text-[10px] font-mono text-paper bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm tracking-wider">
                            {card.text}
                          </span>
                        </div>
                      ) : (
                        /* ACTIVE CARD SURFACE: telemetry tag, radar emitter ring, active label */
                        <div className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between text-paper">
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(rgba(248,250,229,0.3)_0.5px,transparent_0.5px)] [background-size:16px_16px] pointer-events-none" />
                          
                          {/* Telemetry Tag */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-bronze-light uppercase tracking-wider relative z-20">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#E06D53] animate-pulse" />
                              <span className="font-bold text-paper">ACTIVE // {SECTION_CONFIGS[i].label} · 0{i + 1}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#E06D53]/20 text-[#E06D53] font-semibold border border-[#E06D53]/30">
                              LIVE RADAR
                            </span>
                          </div>

                          {/* Holographic Emitter Ring on the angled card floor */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[180px] sm:w-[240px] lg:w-[280px] h-[70px] sm:h-[90px] lg:h-[105px] rounded-full border border-[#E06D53]/30 bg-[radial-gradient(ellipse_at_center,rgba(224,109,83,0.2)_0%,transparent_70%)] animate-pulse shadow-[0_0_35px_rgba(224,109,83,0.25)]" />
                          </div>

                          {/* Bottom Active Label */}
                          <div className="flex items-center justify-between text-[9px] font-mono text-bronze-light relative z-20">
                            <span>INTERACTIVE SPATIAL DECK</span>
                            <span className="text-[#E06D53] font-semibold">CLICK OR SCROLL TO NAVIGATE</span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* 2. UPRIGHT POPOUT STAGE:
                     * Does NOT tilt with the card (stands straight up perpendicular to the viewer).
                     * Elevated in Z space (translateZ(85px)) so it bursts OUT of the tilted card plane!
                     */}
                    {isCurrentActive && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto z-30 overflow-visible"
                        style={{
                          transform: "translateZ(85px)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {i === 0 && (
                          <motion.img
                            src="/me.png"
                            alt={`${preferredName} Portrait`}
                            className="h-[340px] sm:h-[400px] lg:h-[440px] xl:h-[480px] max-w-none object-contain pointer-events-auto select-none mt-[-80px] sm:mt-[-100px] lg:mt-[-140px] xl:mt-[-160px]"
                            style={{
                              transformOrigin: "bottom center",
                              filter: "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.6))",
                            }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                          />
                        )}

                        {i === 1 && currentProject && (
                          <div
                            onMouseEnter={() => setIsHovering3D(true)}
                            onMouseLeave={() => setIsHovering3D(false)}
                            className="w-full flex flex-col items-center justify-center scale-[1.05] sm:scale-[1.18] lg:scale-[1.28]"
                          >
                            <ProjectPopoutHologram
                              projectId={currentProject.id}
                              category={currentProject.category}
                              isHovered={isHovering3D}
                            />
                          </div>
                        )}

                        {i === 2 && (
                          <div className="w-full flex items-center justify-center scale-[1.05] sm:scale-[1.18] lg:scale-[1.28]">
                            <SectionPopoutHologram type="experience" isHovered={isHovering3D} />
                          </div>
                        )}

                        {i === 3 && (
                          <div className="w-full flex items-center justify-center scale-[1.05] sm:scale-[1.18] lg:scale-[1.28]">
                            <SectionPopoutHologram type="credentials" isHovered={isHovering3D} />
                          </div>
                        )}

                        {i === 4 && (
                          <div className="w-full flex items-center justify-center scale-[1.05] sm:scale-[1.18] lg:scale-[1.28]">
                            <SectionPopoutHologram type="skills" isHovered={isHovering3D} />
                          </div>
                        )}

                        {i === 5 && (
                          <div className="w-full flex items-center justify-center scale-[1.05] sm:scale-[1.18] lg:scale-[1.28]">
                            <SectionPopoutHologram type="contact" isHovered={isHovering3D} />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
           * RIGHT COLUMN: ACTIVE SECTION EDITORIAL STAGE (MODULAR COMPONENTS)
           * ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-center px-4 sm:px-8 lg:px-10 py-6 max-h-[85vh] overflow-y-auto no-scrollbar z-20">
            <AnimatePresence mode="wait">
              {activeIndex === 0 && (
                <CoverSection
                  profile={data.profile}
                  tags={data.skills.hardSkills.flatMap((c) => c.items).slice(0, 4)}
                  onExplore={() => scrollToSectionIndex(1)}
                />
              )}

              {activeIndex === 1 && (
                <ProjectSpread
                  projects={data.projects}
                  activeProjectIdx={activeProjectIdx}
                  onProjectChange={setActiveProjectIdx}
                />
              )}

              {activeIndex === 2 && (
                <ExperiencePage
                  experiences={data.experiences}
                />
              )}

              {activeIndex === 3 && (
                <CredentialsSection
                  educations={data.educations}
                  certifications={data.certifications}
                />
              )}

              {activeIndex === 4 && (
                <SkillsMatrix
                  skills={data.skills}
                />
              )}

              {activeIndex === 5 && (
                <FooterSection
                  profile={data.profile}
                />
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Navigation Hint Bar */}
        <div className="relative z-30 pb-4 px-6 sm:px-12 lg:px-16 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#E06D53]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D53]" />
            <span>0{activeIndex + 1} / 06 — {SECTION_CONFIGS[activeIndex].label}</span>
          </div>

          <div className={`hidden sm:flex items-center gap-4 ${isDark ? "text-paper/50" : "text-forest/50"}`}>
            <span>SCROLL OR USE ARROW KEYS TO BROWSE CARDS</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
