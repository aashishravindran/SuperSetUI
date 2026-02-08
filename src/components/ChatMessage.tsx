import { cn } from "@/lib/utils";
import { CoachBadge } from "./CoachBadge";
import { motion } from "framer-motion";

type ChatMessageProps = {
  content: string;
  isUser: boolean;
  coach?: string;
};

export function ChatMessage({ content, isUser, coach }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm"
        )}
      >
        {!isUser && coach && (
          <div className="mb-1.5">
            <CoachBadge coach={coach} size="sm" />
          </div>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
}
