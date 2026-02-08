import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Moon, Sparkles } from "lucide-react";

const recoveryMessages = [
  "Rest is where strength is built. Your muscles are growing stronger right now.",
  "Champions know when to push and when to recover. Today, you're being a champion.",
  "Your body is doing incredible work behind the scenes. Trust the process.",
  "Recovery isn't weakness—it's wisdom. You're playing the long game.",
  "Every great athlete knows: rest days are training days for your nervous system.",
];

const recoveryTips = [
  { icon: "💧", title: "Hydrate", desc: "Drink plenty of water to flush toxins" },
  { icon: "😴", title: "Sleep Well", desc: "Aim for 7-9 hours of quality rest" },
  { icon: "🧘", title: "Stretch", desc: "Light mobility work aids recovery" },
  { icon: "🥗", title: "Nourish", desc: "Protein and nutrients fuel repair" },
];

function RecoveryRobot() {
  return (
    <motion.svg
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 1 }}
      width="180"
      height="180"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl"
    >
      <rect x="40" y="50" width="120" height="100" rx="20" className="fill-card stroke-secondary" strokeWidth="3" />
      <motion.path
        d="M 50 55 Q 100 10 150 55"
        className="fill-secondary/30 stroke-secondary"
        strokeWidth="2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      />
      <motion.circle
        cx="155"
        cy="35"
        r="8"
        className="fill-secondary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
      />
      <motion.g animate={{ y: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
        <path d="M 60 90 Q 75 85 90 90" className="stroke-secondary" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 110 90 Q 125 85 140 90" className="stroke-secondary" strokeWidth="4" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.path
        d="M 75 120 Q 100 135 125 120"
        className="stroke-secondary"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <rect x="25" y="75" width="15" height="40" rx="5" className="fill-muted" />
      <rect x="160" y="75" width="15" height="40" rx="5" className="fill-muted" />
      <rect x="60" y="150" width="80" height="30" rx="10" className="fill-muted stroke-border" strokeWidth="2" />
      <motion.g
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <circle cx="100" cy="165" r="10" className="fill-secondary/30" />
        <circle cx="100" cy="165" r="6" className="fill-secondary" />
      </motion.g>
      <motion.text
        x="160"
        y="50"
        className="fill-secondary/60 text-lg font-bold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 0], y: [10, -10, -30] }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 0 }}
      >
        z
      </motion.text>
      <motion.text
        x="170"
        y="40"
        className="fill-secondary/40 text-base font-bold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 0], y: [10, -10, -30] }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
      >
        z
      </motion.text>
      <motion.text
        x="178"
        y="32"
        className="fill-secondary/20 text-sm font-bold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 0], y: [10, -10, -30] }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
      >
        z
      </motion.text>
    </motion.svg>
  );
}

export default function Recovery() {
  const navigate = useNavigate();
  const randomMessage = recoveryMessages[Math.floor(Math.random() * recoveryMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="font-display font-bold text-lg">
            Super<span className="text-primary">Set</span>
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <RecoveryRobot />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Moon className="h-5 w-5 text-secondary" />
            <span className="text-secondary font-medium uppercase tracking-wider text-sm">Recovery Day</span>
            <Moon className="h-5 w-5 text-secondary" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl md:text-4xl font-bold mb-4"
          >
            Time to Recharge
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed"
          >
            {randomMessage}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 mb-8">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-secondary mx-auto mb-3" />
              <p className="text-foreground font-medium text-lg">
                "The body achieves what the mind believes. Today, believe in rest."
              </p>
              <p className="text-muted-foreground text-sm mt-2">— Max 🤖</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-display text-xl font-semibold mb-4 text-center">Recovery Essentials</h3>
          <div className="grid grid-cols-2 gap-3">
            {recoveryTips.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <Card className="h-full hover:border-secondary/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl mb-2 block">{tip.icon}</span>
                    <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button variant="outline" size="lg" className="rounded-xl" onClick={() => navigate("/history")}>
            View Past Workouts
          </Button>
          <Button size="lg" className="rounded-xl bg-secondary hover:bg-secondary/90" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
