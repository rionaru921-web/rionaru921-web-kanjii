import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "幹事ラボにログインして、幹事の仕事をもっとシンプルに。",
};

export default function LoginPage() {
  return <LoginForm />;
}
