import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "新規登録",
  description: "幹事ラボに無料で登録。飲み会の幹事業務をシンプルに、お店選びから割り勘まであなたの手間を大幅削減します。",
};

export default function SignupPage() {
  return <SignupForm />;
}
