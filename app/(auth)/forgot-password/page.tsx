import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定",
  description: "登録済みのメールアドレスにパスワード再設定用のリンクを送信します。",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
