"use client";

import { useEffect, useState } from "react";

interface Greeting {
  emoji: string;
  text: string;
}

function getGreeting(): Greeting {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return { emoji: "☀️", text: "おはようございます" };
  if (hour >= 11 && hour < 18) return { emoji: "🌤️", text: "こんにちは" };
  if (hour >= 18 && hour < 23) return { emoji: "🌙", text: "こんばんは" };
  return { emoji: "✨", text: "お疲れさまです" };
}

interface WelcomeHeroProps {
  displayName: string;
}

export default function WelcomeHero({ displayName }: WelcomeHeroProps) {
  const [greeting, setGreeting] = useState<Greeting>(getGreeting);

  // Recompute after mount so the greeting reflects the visitor's local time
  // rather than the server's render time.
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="animate-fade-in-up rounded-3xl bg-gold-gradient p-6 sm:p-8 shadow-warm text-white">
      <p className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
        {greeting.emoji} {greeting.text}、{displayName}さん
      </p>
      <p className="text-sm sm:text-base mt-2 text-white/90">今日はどんな集まりを企画しますか?</p>
    </div>
  );
}
