import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setOnboarded } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    const id = username.trim();
    login(id);
    setLoading(true);
    try {
      const profile = await apiFetch<{ is_onboarded?: boolean }>(`/api/users/${id}/profile`);
      if (profile.is_onboarded) {
        setOnboarded(true);
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch {
      navigate("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md border-2 border-primary/10">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl mb-3"
            >
              🏆
            </motion.div>
            <CardTitle className="font-display text-3xl">
              Super<span className="text-primary">Set</span>
            </CardTitle>
            <CardDescription className="text-base">
              Enter your username to start training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl text-center text-lg"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={!username.trim() || loading}
              >
                {loading ? "Checking..." : "Let's Go 💪"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
