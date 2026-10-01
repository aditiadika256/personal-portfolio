import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CARD_CONTENT } from "./MiniCard";

const CARDS = [
  { id: "cover", content: CARD_CONTENT.cover, color: "bg-paper", overlay: "bg-forest-ultradark/30", border: "border-paper/15" },
  { id: "projects", content: CARD_CONTENT.project, color: "bg-forest-dark", overlay: "bg-paper/10", border: "border-bronze/25" },
  { id: "experience", content: CARD_CONTENT.experience, color: "bg-paper-muted", overlay: "bg-forest-dark/20", border: "border-bronze/25" },
  { id: "credentials", content: CARD_CONTENT.credentials, color: "bg-forest-ultradark", overlay: "bg-paper/15", border: "border-paper/15" },
  { id: "skills", content: CARD_CONTENT.skills, color: "bg-paper", overlay: "bg-forest-dark/20", border: "border-bronze/25" },
  { id: "contact", content: CARD_CONTENT.footer, color: "bg-forest", overlay: "bg-paper/10", border: "border-paper/15" },
];

export const GlobalCardDeck: React.FC = () => {
  const { scrollY } = useScroll();
  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const updateMeasurements = () => {
      const wh = window.innerHeight;
      setWindowHeight(wh);
      const newBoundaries = CARDS.map((card) => {
        const el = document.getElementById(card.id);
        return el ? el.offsetTop : 0;
      });
      // Ensure strictly increasing
      for (let i = 1; i < newBoundaries.length; i++) {
        if (newBoundaries[i] <= newBoundaries[i - 1]) {
          newBoundaries[i] = newBoundaries[i - 1] + 1;
        }
      }
      setBoundaries(newBoundaries);
    };

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    const observer = new MutationObserver(updateMeasurements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    const interval = setInterval(updateMeasurements, 500);
    setTimeout(() => { clearInterval(interval); observer.disconnect(); }, 2000);

    return () => {
      window.removeEventListener("resize", updateMeasurements);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const input = [0];
  const output = [0];

  if (boundaries.length > 0 && windowHeight > 0) {
    for (let i = 1; i < boundaries.length; i++) {
      const prevB = boundaries[i - 1];
      const B = boundaries[i];
      let transitionStart = B - windowHeight * 0.75;
      if (transitionStart < prevB) {
        transitionStart = prevB;
      }

      if (transitionStart > input[input.length - 1]) {
        input.push(transitionStart);
        output.push(i - 1);
      }

      input.push(B);
      output.push(i);
    }
    const lastB = boundaries[boundaries.length - 1];
    input.push(lastB + windowHeight);
    output.push(boundaries.length - 1);
  } else {
    input.push(1000, 2000, 3000, 4000, 5000);
    output.push(1, 2, 3, 4, 5);
  }

  const vIndex = useTransform(scrollY, input, output);

  // Layout transform for the container:
  // Cards on LEFT for ALL sections
  const containerLeft = useTransform(vIndex, [0, 1, 2, 3, 4, 5], ["25%", "25%", "25%", "25%", "25%", "25%"]);
  const containerX = useTransform(vIndex, [0, 1], ["-50%", "-50%"]);
  const containerWidth = useTransform(vIndex, [0, 1], ["50%", "50%"]);

  return (
    <motion.div
      className="fixed top-0 h-screen pointer-events-none z-[20] flex flex-col items-center justify-center overflow-visible"
      style={{
        left: containerLeft,
        x: containerX,
        width: containerWidth,
      }}
    >
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center max-w-[500px]"
        style={{ transform: "rotate(-11deg) skewX(-2deg)" }}
      >
        {CARDS.map((card, i) => {
          const relative = useTransform(vIndex, (v) => i - v);

          const y = useTransform(relative, [-2, -1, 0, 1, 2], [-480, -240, 0, 240, 480]);
          // Removed dynamic rotate and scale to ensure pergerakan lurus (straight movement)
          
          // Active card (0) fades out completely so the local section's hologram and pedestal show through
          const opacity = useTransform(relative, [-1.5, -0.9, -0.1, 0, 0.1, 0.9, 1.5], [0, 1, 0, 0, 0, 1, 0]);
          const zIndex = useTransform(relative, (r) => 10 - Math.abs(r) * 10);

          return (
            <motion.div
              key={card.id}
              className={`absolute w-[340px] sm:w-[420px] lg:w-[480px] h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 ${card.border}`}
              style={{
                y,
                opacity,
                zIndex,
              }}
            >
              <img
                src={card.content.image}
                alt={card.content.text}
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className={`absolute inset-0 ${card.overlay} mix-blend-multiply`} />
              
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute bottom-3 left-4 text-[10px] font-mono text-paper bg-black/60 px-2 py-0.5 rounded backdrop-blur-md tracking-wider">
                {card.content.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
