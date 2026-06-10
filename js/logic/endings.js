/* =========================================================================
 * 鮨サクセス — エンディング判定ロジック（DOM非依存）
 * ENDINGS（data/endings.js）を上から順に評価し、最初に合致したものを返す。
 * ========================================================================= */

const EndingLogic = (() => {

  function matches(player, total, cond) {
    const s = player.stats, e = player.evals, m = player.meters;
    if (cond.stressMin   != null && m.stress < cond.stressMin) return false;
    if (cond.judgmentMin != null && s.judgment < cond.judgmentMin) return false;
    if (cond.mentalMin   != null && s.mental < cond.mentalMin) return false;
    if (cond.coworkerMin != null && e.coworker < cond.coworkerMin) return false;
    if (cond.coworkerMax != null && e.coworker > cond.coworkerMax) return false;
    if (cond.bossMin     != null && e.boss < cond.bossMin) return false;
    if (cond.bossMax     != null && e.boss > cond.bossMax) return false;
    if (cond.customerMin != null && e.customer < cond.customerMin) return false;
    if (cond.totalMin    != null && total < cond.totalMin) return false;
    return true;
  }

  /* total = 育成5能力の合計 */
  function decide(player, total) {
    for (const end of ENDINGS) {
      if (matches(player, total, end.cond)) return end;
    }
    return ENDINGS[ENDINGS.length - 1];
  }

  return { decide, matches };
})();
