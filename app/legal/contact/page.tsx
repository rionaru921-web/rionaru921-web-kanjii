import type { Metadata } from "next";
import LegalContent from "@/components/legal/LegalContent";
import ContactForm from "@/components/legal/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "幹事ラボへのご質問・ご要望・不具合報告はこちらのフォームからお送りください。",
};

export default function ContactPage() {
  return (
    <LegalContent title="お問い合わせ" lastUpdated="2026年3月">
      <p className="mb-8">
        幹事ラボに関するご質問・ご要望・不具合報告は、以下のフォームよりお送りください。送信ボタンを押すとお使いのメールソフトが起動し、内容が入力された状態でメールを作成できます。
      </p>

      <ContactForm />
    </LegalContent>
  );
}
