export default function HotpepperAttribution({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-center text-[11px] text-ink-muted ${className}`}>
      <a
        href="https://webservice.recruit.co.jp/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gold transition-colors"
      >
        Powered by ホットペッパー グルメ Webサービス
      </a>
    </p>
  );
}
