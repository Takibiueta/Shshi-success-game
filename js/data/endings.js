/* =========================================================================
 * 鮨サクセス — エンディング定義
 * 配列の上から順に条件判定し、最初に満たしたものが採用される。
 * cond のキー: stressMin / judgmentMin / mentalMin / coworkerMin / coworkerMax
 *              / bossMin / bossMax / customerMin / totalMin（能力5種の合計）
 * ========================================================================= */

const ENDINGS = [
  {
    id: "burnout", title: "燃え尽き退職", icon: "🔥",
    cond: { stressMin: 80 },
    comment: "限界まで頑張りすぎた。ある朝、暖簾をくぐる足が止まった——。腕は確かに上がった。でも、心が先に折れてしまった。休むことも、仕事のうちだったのに。",
  },
  {
    id: "ace", title: "現場のエース", icon: "🌟",
    cond: { coworkerMin: 65, customerMin: 65, totalMin: 260 },
    comment: "腕は店一番、仲間からもお客さんからも信頼される存在に。「あいつに任せれば大丈夫」——その一言が、何よりの勲章だ。",
  },
  {
    id: "bossPet", title: "大将のお気に入り（孤立）", icon: "👔",
    cond: { bossMin: 70, coworkerMax: 35 },
    comment: "大将の信頼は厚い。だが振り返れば、隣で笑ってくれる同僚はいなかった。出世はした。けれど、休憩室はいつも静かだ。",
  },
  {
    id: "fieldAlly", title: "現場の味方", icon: "🤝",
    cond: { coworkerMin: 70, bossMax: 35 },
    comment: "同僚たちの絶大な信頼を得た。大将とはぶつかってばかりだったが、現場が困った時、皆が頼るのはあなただ。「上に嫌われても、俺たちはお前につくよ」",
  },
  {
    id: "tenshoku", title: "転職成功", icon: "🚪",
    cond: { judgmentMin: 65, mentalMin: 65, stressMin: 55 },
    comment: "ストレスは溜まった。だが鍛えた判断力と折れない心は本物だった。ヘッドハンターの名刺を握りしめ、新天地へ。「この店で学んだことは、無駄じゃなかった」",
  },
  {
    id: "survive", title: "なんとか生存", icon: "🍵",
    cond: {},
    comment: "突出したものはないが、20週間を走り切った。これは紛れもなく、ひとつの実績だ。物語はまだ続く。次はどんな寿司職人になろうか。",
  },
];
