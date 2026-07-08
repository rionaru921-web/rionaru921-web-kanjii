import Logo from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center ink-wash px-4 py-12">
      <div className="mb-8">
        <Logo size="lg" href="/" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
