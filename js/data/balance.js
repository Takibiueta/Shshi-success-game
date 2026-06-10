/* =========================================================================
 * 鮨サクセス — バランス定義（調整値はすべてここに集約）
 * ゲーム性のチューニングはこのファイルの数値をいじるだけで済むようにする。
 * ========================================================================= */

const BALANCE = {
  /* 初期値 */
  startMeters: { stress: 20, motivation: 70 },
  startEvals:  { boss: 40, coworker: 40, customer: 30 },

  /* 週ごとの自然変化 */
  weekly: { motivationDecay: 2 },

  /* ストレス */
  stress: {
    mentalReliefDiv: 200,   // 増加量 ×(1 - メンタル/この値)
    mentalReliefMin: 0.45,  // 軽減の下限倍率
    tiredThreshold: 70,     // これ以上で経験点効率ダウン
    tiredExpPenalty: 0.8,
    collapseAt: 100,        // 限界 → 強制ダウン
    collapse: { stress: -35, stamina: -25, motivation: -15 },
  },

  /* やる気 → 経験点倍率：min + やる気/div（やる気100で約1.4倍） */
  motivation: { expMultMin: 0.6, expMultDiv: 125 },

  /* コミュ力 → 大将/同僚評価の上昇倍率：1 + コミュ力/div */
  comm: { evalGainDiv: 150 },

  /* 成功判定のデフォルト：chance = base + ステータス合計/statDiv */
  checks: { base: 0.30, statDiv: 110, min: 0.15, max: 0.95 },

  /* イベント発生率と関係イベントの重み */
  events: {
    chance: 0.55,
    relationWeight: 2.5,   // 評価条件つきイベント（支援/孤立/引き立て/理不尽）
    tradeoffWeight: 1.4,   // 対立軸イベント
  },

  /* 評価のしきい値（イベント条件・エンディングで使用） */
  evalBands: { high: 60, low: 30 },

  /* 営業結果 → 評価への反映 */
  service: {
    customerRateMul: 24,   // (提供率-0.55)×この値 → 客評価
    bossScoreDiv: 400,     // スコア/この値 → 大将評価（上限あり）
    bossGainMax: 6,
    coworkerNoLost: 3,     // 逃し0なら同僚評価+
  },

  /* 能力アップ：現在値ごとの +1 コスト（上の行から順に判定） */
  allocCosts: [
    { min: 90, cost: 12 },
    { min: 80, cost: 8 },
    { min: 70, cost: 5 },
    { min: 60, cost: 3 },
    { min: 40, cost: 2 },
    { min: 0,  cost: 1 },
  ],
  mainDiscount: 0.7,       // 得意能力の割引率
};

/* 現在値 v の能力を +1 する経験点コスト */
function allocCostAt(v) {
  for (const r of BALANCE.allocCosts) if (v >= r.min) return r.cost;
  return 1;
}
