/* =========================================================================
 * 鮨サクセス — 効果適用・判定ロジック（純粋ロジック・DOM非依存）
 *
 * ステータスのプレイ中の意味はここで実装される：
 * - メンタル   … ストレス増加量を軽減
 * - コミュ力   … 大将/同僚評価の上昇量を増幅
 * - やる気     … 経験点の獲得倍率（ストレス過多でさらに減衰）
 * - 作業力/接客力/判断力 … checkChance による各種イベントの成功率
 * ========================================================================= */

const Logic = (() => {

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* number | [min,max] → 確定値 */
  function roll(v) {
    if (Array.isArray(v)) return v[0] + Math.floor(Math.random() * (v[1] - v[0] + 1));
    return v;
  }

  /* やる気 → 経験点倍率（ストレス過多でペナルティ） */
  function expMult(player) {
    const m = BALANCE.motivation;
    let mult = m.expMultMin + player.meters.motivation / m.expMultDiv;
    if (player.meters.stress >= BALANCE.stress.tiredThreshold) mult *= BALANCE.stress.tiredExpPenalty;
    return mult;
  }

  /* 成功判定の確率（表示用にも使う） */
  function checkChance(player, check) {
    const c = BALANCE.checks;
    const sum = (check.stats || []).reduce((a, k) => a + (player.stats[k] || 0), 0);
    const base = check.base != null ? check.base : c.base;
    const div = check.statDiv != null ? check.statDiv : c.statDiv;
    return clamp(base + sum / div, c.min, c.max);
  }

  /* 成功判定を実行 */
  function statCheck(player, check) {
    const chance = checkChance(player, check);
    return { ok: Math.random() < chance, chance };
  }

  const LABELS = {
    work: "作業力", service: "接客力", judgment: "判断力", mental: "メンタル", comm: "コミュ力",
    stamina: "体力", stress: "ストレス", motivation: "やる気",
    boss: "大将評価", coworker: "同僚評価", customer: "客評価", exp: "経験点", all: "全能力",
  };

  /**
   * 効果セットを player に適用し、ログ用サマリ文字列を返す。
   * - stress の増加はメンタルで軽減
   * - boss/coworker の増加はコミュ力で増幅
   * - exp はやる気倍率を適用
   */
  function applyEffects(player, eff) {
    if (!eff) return "";
    const parts = [];
    const commMult = 1 + (player.stats.comm || 0) / BALANCE.comm.evalGainDiv;

    for (const [k, raw] of Object.entries(eff)) {
      let v = roll(raw);
      if (v === 0) continue;

      if (k === "exp") {
        v = Math.max(1, Math.round(v * expMult(player)));
        player.exp = (player.exp || 0) + v;
      } else if (k === "all") {
        for (const t of TRAINABLE) player.stats[t] = clamp(player.stats[t] + v, 0, 100);
      } else if (k === "stamina") {
        player.stats.stamina = clamp(player.stats.stamina + v, 0, player.stats.maxStamina);
      } else if (k === "stress") {
        if (v > 0) {
          const relief = Math.max(
            BALANCE.stress.mentalReliefMin,
            1 - (player.stats.mental || 0) / BALANCE.stress.mentalReliefDiv
          );
          v = Math.max(1, Math.round(v * relief));
        }
        player.meters.stress = clamp(player.meters.stress + v, 0, 100);
      } else if (k === "motivation") {
        player.meters.motivation = clamp(player.meters.motivation + v, 0, 100);
      } else if (k === "boss" || k === "coworker") {
        if (v > 0) v = Math.round(v * commMult);
        player.evals[k] = clamp(player.evals[k] + v, 0, 100);
      } else if (k === "customer") {
        player.evals.customer = clamp(player.evals.customer + v, 0, 100);
      } else if (player.stats[k] != null) {
        player.stats[k] = clamp(player.stats[k] + v, 0, 100);
      } else {
        continue;
      }
      parts.push(`${LABELS[k] || k}${v > 0 ? "+" : ""}${v}`);
    }
    return parts.join(" ");
  }

  return { roll, clamp, expMult, checkChance, statCheck, applyEffects, LABELS };
})();
