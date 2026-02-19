import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Moon, Sparkles, Bot } from "lucide-react";

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

function RecoveryOrb() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 1 }}
      className="relative flex items-center justify-center"
      style={{ width: 180, height: 180 }}
    >
      {/* Slow outer pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-purple-400/15"
          style={{ width: 60 + i * 40, height: 60 + i * 40 }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.6, ease: "easeInOut" }}
        />
      ))}

      {/* Core orb — cooler blue-purple for rest/recovery */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.9), rgba(109,40,217,0.85) 60%, rgba(49,46,129,0.9))",
          boxShadow: "0 0 40px rgba(139,92,246,0.45), 0 0 70px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
        animate={{ boxShadow: [
          "0 0 40px rgba(139,92,246,0.45), 0 0 70px rgba(139,92,246,0.18)",
          "0 0 55px rgba(139,92,246,0.6), 0 0 90px rgba(139,92,246,0.25)",
          "0 0 40px rgba(139,92,246,0.45), 0 0 70px rgba(139,92,246,0.18)",
        ]}}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        <Moon className="h-9 w-9 text-white/85" strokeWidth={1.5} />
      </motion.div>

      {/* Floating z's */}
      {[0, 0.8, 1.6].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute font-display font-bold text-purple-300/50 select-none"
          style={{ fontSize: 14 - i * 2, right: 24 + i * 8, top: 20 + i * 8 }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -18, -36] }}
          transition={{ repeat: Infinity, duration: 2.5, delay, ease: "easeOut" }}
        >
          z
        </motion.span>
      ))}
    </motion.div>
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
            <RecoveryOrb />
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
              <p className="text-muted-foreground text-sm mt-2 flex items-center justify-center gap-1.5">
                — Max
                <Bot className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              </p>
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
