import Link from "next/link";
import { Sparkles, History, BookOpen, type LucideIcon } from "lucide-react";
import CreatePlanButton from "@/components/shared/CreatePlanButton";

interface ActionItem {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
}

// "新しいプランを作る" opens CreatePlanModal, which is the single entry
// point for every plan type (飲み会AI / 旅行AI / 自分で作る). Do not add a
// direct shortcut to /travel (or /nomikai/suggest) here again — that used
// to bypass the modal and confused users about which button to press.
const CREATE_PLAN_ACTION: ActionItem = {
  href: "__create_plan__",
  icon: Sparkles,
  title: "新しいプランを作る",
  description: "AIにおまかせ、または自分で入力",
};

const ACTIONS: ActionItem[] = [
  CREATE_PLAN_ACTION,
  { href: "/history", icon: History, title: "履歴を見る", description: "過去のプランを振り返る" },
  { href: "#", icon: BookOpen, title: "使い方を見る", description: "準備中", disabled: true },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="font-serif font-bold text-lg text-ink mb-4">⚡ クイックアクション</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          const card = (
            <div
              className={`animate-fade-in-up flex h-full flex-col gap-2 rounded-3xl bg-surface-tertiary shadow-warm p-5 transition-[box-shadow,transform] ${
                action.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-warm-hover hover:-translate-y-0.5"
              }`}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              title={action.disabled ? "準備中" : undefined}
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold">
                <Icon size={18} />
              </span>
              <p className="text-sm font-semibold text-ink">{action.title}</p>
              <p className="text-xs text-ink-muted">{action.description}</p>
            </div>
          );

          if (action.disabled) {
            return <div key={action.title}>{card}</div>;
          }

          if (action.href === CREATE_PLAN_ACTION.href) {
            return (
              <CreatePlanButton key={action.title} className="block h-full w-full text-left">
                {card}
              </CreatePlanButton>
            );
          }

          return (
            <Link key={action.title} href={action.href}>
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
