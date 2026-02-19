import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import ConstellationCanvas from "@/components/ConstellationCanvas";

const coaches = [
  { emoji: "🏋️", label: "Iron", desc: "Strength & hypertrophy", tagline: "Build raw power" },
  { emoji: "🧘", label: "Yoga", desc: "Flexibility & recovery", tagline: "Find your flow" },
  { emoji: "⚡", label: "HIIT", desc: "Cardio & endurance", tagline: "Push your limits" },
  { emoji: "🥊", label: "Kickboxing", desc: "Power & agility", tagline: "Unleash your force" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + coaches.length) % coaches.length);
  const next = () => setCurrent((c) => (c + 1) % coaches.length);

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">
      <ConstellationCanvas />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl tracking-tight text-white">
          Super<span className="text-purple-400">Set</span>
        </h2>
        <Button
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => navigate("/login")}
        >
          Log in
        </Button>
      </header>

      {/* Left arrow */}
      <button
        onClick={prev}
        aria-label="Previous coach"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/30 hover:text-white/80 transition-colors p-2"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        aria-label="Next coach"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/30 hover:text-white/80 transition-colors p-2"
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      {/* Main hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-purple-400 fill-purple-400" />
            AI-Powered Fitness Engine
          </span>
        </motion.div>

        {/* Hero heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-display text-[clamp(4rem,12vw,9rem)] font-bold tracking-tight leading-none text-white mb-6"
          style={{ textShadow: "0 0 120px rgba(168,85,247,0.25)" }}
        >
          Super<span className="text-purple-400">Set</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="text-lg md:text-xl text-white/45 mb-10 max-w-md leading-relaxed"
        >
          Four specialized AI coaches. Real-time adaptive workouts tailored to your body and goals.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
        >
          <Button
            size="lg"
            className="rounded-full px-10 text-base font-semibold bg-white text-black hover:bg-white/90 shadow-lg shadow-black/30 transition-all"
            onClick={() => navigate("/login")}
          >
            Start Training →
          </Button>
        </motion.div>

        {/* Coach carousel indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <span className="text-3xl mb-2 block">{coaches[current].emoji}</span>
              <p className="font-display font-semibold text-white/80 text-sm tracking-wide uppercase">
                {coaches[current].label}
              </p>
              <p className="text-white/35 text-xs mt-0.5">{coaches[current].desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-3">
            {coaches.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-5 bg-purple-400" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-white/15">
        Built with 🔥 by Aashish Ravindran
      </footer>
    </div>
  );
}
