const TRANSLATIONS: Record<string, string> = {
  "User already registered": "このメールアドレスは既に登録されています。ログイン画面をご利用ください。",
  "Password should be at least 6 characters": "パスワードは6文字以上で設定してください。",
  "Password should be at least 8 characters": "パスワードは8文字以上で設定してください。",
  "Unable to validate email address: invalid format": "メールアドレスの形式が正しくありません。",
  "Email rate limit exceeded": "メール送信の上限に達しました。しばらくしてから再度お試しください。",
  "Signup requires a valid password": "パスワードを入力してください。",
  "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません。",
  "Email not confirmed": "メールアドレスが未確認です。確認メールをご確認ください。",
  "For security purposes, you can only request this after": "セキュリティのため、しばらく時間をおいてから再度お試しください。",
  "Failed to fetch": "通信エラーが発生しました。ネットワーク接続をご確認のうえ再度お試しください。",
};

export function translateSupabaseError(message: string): string {
  for (const [key, value] of Object.entries(TRANSLATIONS)) {
    if (message.includes(key)) return value;
  }
  return message;
}
