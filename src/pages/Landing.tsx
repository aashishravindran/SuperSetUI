import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Flame, Heart, Zap } from "lucide-react";

const coaches = [
  { icon: Dumbbell, label: "Iron", emoji: "🏋️", desc: "Strength & hypertrophy", color: "text-iron" },
  { icon: Heart, label: "Yoga", emoji: "🧘", desc: "Flexibility & recovery", color: "text-yoga" },
  { icon: Zap, label: "HIIT", emoji: "⚡", desc: "Cardio & endurance", color: "text-hiit" },
  { icon: Flame, label: "Kickboxing", emoji: "🥊", desc: "Power & agility", color: "text-kickboxing" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl tracking-tight">
          Super<span className="text-primary">Set</span>
        </h2>
        <Button variant="ghost" onClick={() => navigate("/login")}>
          Log in
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Your AI
            <br />
            <span className="bg-gradient-to-r from-primary via-energy to-accent bg-clip-text text-transparent">
              Fitness Coach
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
            Four specialized AI coaches. One app. Real-time workouts tailored to your body and goals.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            onClick={() => navigate("/login")}
          >
            Get Started 💪
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl w-full"
        >
          {coaches.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl bg-card/80 backdrop-blur border border-border p-5 text-center hover:border-primary/30 transition-colors"
            >
              <span className="text-3xl mb-2 block">{c.emoji}</span>
              <h3 className={`font-display font-semibold ${c.color}`}>{c.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        Built with 🔥 by Aashish Ravindran
      </footer>
    </div>
  );
}
