import { useState } from "react";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { SmoothScroll } from "./components/layout/SmoothScroll";
import { FloatingActionMenu } from "./components/layout/FloatingActionMenu";
import { DeckPresentation } from "./components/editorial/DeckPresentation";
import { VerticalNavRail } from "./components/layout/VerticalNavRail";
import { FirebaseTester } from "./components/FirebaseTester";
import { X } from "lucide-react";

export function App() {
  const { data, isFallback, refetch } = usePortfolioData();
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("cover");
  const [isNavHovered, setIsNavHovered] = useState<boolean>(false);

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const sectionIds = ["cover", "projects", "experience", "credentials", "skills", "contact"];
    const index = sectionIds.indexOf(sectionId);
    if (index !== -1) {
      const wh = window.innerHeight;
      const targetY = index * wh;
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.0 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
  };

  return (
    <SmoothScroll>
      <div className="relative w-full min-h-screen bg-paper text-forest selection:bg-terracotta selection:text-paper font-sans">
        {/* Vertical Section Indicator Rail (Robin Noguiér Style) */}
        <VerticalNavRail
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onHoverChange={setIsNavHovered}
        />

        {/* Fallback Data Notice Badge (if Firestore is offline or before migration) */}
        {isFallback && (
          <div className="bg-bronze/15 border-b border-bronze/30 py-1.5 px-4 text-center text-xs font-mono text-bronze-dark z-50 fixed top-0 left-0 right-0 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse"></span>
            <span>Mode Cadangan Offline (Local Fallback Aktif). Buka tool database di kanan atas untuk sinkronisasi ke Firebase.</span>
          </div>
        )}

        {/* Floating Action Menu */}
        <FloatingActionMenu 
          onOpenAdmin={() => setShowAdminModal(true)}
          pdfUrl={data.profile.pdfResumeUrl}
        />

        {/* Main Robin Noguier Continuous Card Deck Presentation */}
        <DeckPresentation
          data={data}
          isNavHovered={isNavHovered}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Modal: Firebase Connection & Migration Tool */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ultradark/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border border-bronze/30">
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  refetch();
                }}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Tutup Modal"
              >
                <X size={20} />
              </button>

              <FirebaseTester />
            </div>
          </div>
        )}
      </div>
    </SmoothScroll>
  );
}

export default App;
