// 幹事ラボ AI幹事コーチ — レベル定義（MVP版、固定しきい値）

export type CoachLevel = {
  level: number;
  name: string;
  emoji: string;
  minSessions: number;
  nextThreshold: number | null;
  description: string;
};

const LEVELS: CoachLevel[] = [
  {
    level: 1,
    name: "幹事見習い",
    emoji: "🌱",
    minSessions: 0,
    nextThreshold: 3,
    description: "まずは1回、幹事を経験してみましょう",
  },
  {
    level: 2,
    name: "幹事の心得",
    emoji: "🥉",
    minSessions: 3,
    nextThreshold: 10,
    description: "基本を身につけた頼れる幹事です",
  },
  {
    level: 3,
    name: "一人前の幹事",
    emoji: "🥈",
    minSessions: 10,
    nextThreshold: 30,
    description: "仲間から信頼される幹事に成長中",
  },
  {
    level: 4,
    name: "幹事マスター",
    emoji: "🥇",
    minSessions: 30,
    nextThreshold: 100,
    description: "どんな集まりも安心して任せられます",
  },
  {
    level: 5,
    name: "伝説の幹事",
    emoji: "🏮",
    minSessions: 100,
    nextThreshold: null,
    description: "幹事の頂点、みんなの憧れの存在です",
  },
];

export function calculateLevel(completedSessions: number): CoachLevel {
  const level = [...LEVELS].reverse().find((l) => completedSessions >= l.minSessions);
  return level ?? LEVELS[0];
}

export function progressToNext(completedSessions: number): {
  current: number;
  threshold: number | null;
  percentage: number;
} {
  const current = calculateLevel(completedSessions);
  if (current.nextThreshold === null) {
    return { current: completedSessions, threshold: null, percentage: 100 };
  }
  const prevThreshold = current.minSessions;
  const range = current.nextThreshold - prevThreshold;
  const progress = completedSessions - prevThreshold;
  return {
    current: completedSessions,
    threshold: current.nextThreshold,
    percentage: Math.min(100, Math.max(0, (progress / range) * 100)),
  };
}
