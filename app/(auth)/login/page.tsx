import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "幹事ラボにログインして、AIによる幹事代行サービスをご利用ください。",
};

export default function LoginPage() {
  return <LoginForm />;
}
