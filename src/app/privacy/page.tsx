import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle className="text-4xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 leading-8 text-zinc-300">
          <p>
            Night Bottle は、サービス提供のために投稿 URL、任意コメント、タグ、通報内容、管理ログ、および不正対策目的のハッシュ化 IP 情報を取得します。
          </p>
          <p>
            取得した情報は、投稿交換処理、モデレーション、スパム対策、法令対応、権利侵害対応のために利用します。氏名やメールアドレスなど、通常の利用で直接的な個人情報は収集しません。
          </p>
          <p>
            外部サービスとして Supabase を利用する場合、データは Supabase 上に保存されます。環境変数未設定時は、開発用モックデータのみを利用します。
          </p>
          <p>
            法令に基づく場合を除き、取得情報を第三者へ提供しません。ただし、権利侵害や違法行為への対応のため、必要最小限の範囲で開示する場合があります。
          </p>
          <p>
            削除依頼やお問い合わせは削除依頼ページから受け付けます。運営が必要と判断した場合、関連ログを確認のうえ対応します。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
