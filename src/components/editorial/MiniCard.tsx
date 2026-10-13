import React from 'react';
import { motion } from 'framer-motion';

export interface MiniCardProps {
  image: string;
  text: string;
  position: 'top' | 'bottom';
  overlayClass?: string;
  borderClass?: string;
}

export const MiniCard: React.FC<MiniCardProps> = ({ 
  image, 
  text, 
  position,
  overlayClass = "bg-forest-ultradark/30",
  borderClass = "border-paper/15" 
}) => {
  return (
    <motion.div 
      initial={{ y: position === 'top' ? 60 : 100, opacity: 0, scale: 0.95 }}
      whileInView={{ y: 0, opacity: position === 'top' ? 0.8 : 0.75, scale: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`w-80 sm:w-96 lg:w-[420px] h-28 sm:h-36 rounded-2xl overflow-hidden shadow-card border ${borderClass} ${
        position === 'top' ? 'mb-4' : 'mt-4'
      } relative group pointer-events-none`}
    >
      <img
        src={image}
        alt={text}
        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
        style={{ transform: "rotate(11deg) scale(1.2)" }}
      />
      <div className={`absolute inset-0 mix-blend-multiply ${overlayClass}`} />
      <span className="absolute bottom-2 left-3 text-[9px] font-mono text-paper bg-forest-ultradark/75 px-2 py-0.5 rounded backdrop-blur-sm tracking-wider">
        {text}
      </span>
    </motion.div>
  );
};

export const CARD_CONTENT = {
  init: {
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
    text: "SYSTEM INITIALIZATION SEQUENCE"
  },
  cover: {
    image: "/me.png",
    text: "SPATIAL PORTRAIT · ADITIA DIKA"
  },
  project: {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    text: "CASE STUDY // AI & WEB SYSTEMS"
  },
  experience: {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
    text: "NATIONAL RESEARCH COLLABORATION"
  },
  credentials: {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    text: "ACADEMIC HONORS & CERTIFICATIONS"
  },
  skills: {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    text: "TENSOR MATRIX & CAPABILITIES"
  },
  footer: {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    text: "GEO-DISPATCH RADAR // COMMUNICATION"
  },
  end: {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    text: "END OF TRANSMISSION // OFFLINE"
  }
};
