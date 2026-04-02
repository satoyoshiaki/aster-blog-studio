import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "第1条 適用",
    body:
      "本規約は、Night Bottle における匿名おすすめ交換機能および関連サービスの利用条件を定めるものです。利用者は本規約に同意したうえで本サービスを利用するものとします。",
  },
  {
    title: "第2条 利用条件",
    body:
      "本サービスは18歳以上の方のみ利用できます。利用者は、日本法その他適用法令に違反しない範囲で、公式販売元または公式配信元の URL のみを投稿しなければなりません。",
  },
  {
    title: "第3条 禁止事項",
    body:
      "未成年を想起させる表現、違法撮影物、権利侵害コンテンツ、スパム、虚偽情報、他者に不利益を与える投稿、システムへの過度な負荷を生じさせる行為を禁止します。",
  },
  {
    title: "第4条 投稿の取扱い",
    body:
      "投稿内容は自動または手動で審査される場合があります。運営は、規約違反の疑いがある投稿を承認せず、または削除することができます。",
  },
  {
    title: "第5条 免責",
    body:
      "運営は、外部サイト上の作品内容、品質、合法性、表示内容について保証しません。利用者は自己の責任で外部リンク先を利用するものとします。",
  },
  {
    title: "第6条 規約変更",
    body:
      "運営は必要に応じて本規約を変更できます。変更後の規約は、本サイト上に掲載した時点から効力を生じます。",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle className="text-4xl">利用規約</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-xl text-white">{section.title}</h2>
              <p className="leading-8 text-zinc-300">{section.body}</p>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
