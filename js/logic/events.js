/* =========================================================================
 * 鮨サクセス — イベント抽選ロジック（DOM非依存）
 * 大将評価/同僚評価の状態で発生イベントが変わる（対立軸の体感）。
 * ========================================================================= */

const EventLogic = (() => {

  /* 発生条件チェック */
  function condOk(player, cond) {
    if (!cond) return true;
    const e = player.evals, m = player.meters;
    if (cond.bossMin != null && e.boss < cond.bossMin) return false;
    if (cond.bossMax != null && e.boss > cond.bossMax) return false;
    if (cond.coworkerMin != null && e.coworker < cond.coworkerMin) return false;
    if (cond.coworkerMax != null && e.coworker > cond.coworkerMax) return false;
    if (cond.stressMin != null && m.stress < cond.stressMin) return false;
    return true;
  }

  /* 今週のイベントを重み付き抽選（候補なしなら null） */
  function pick(player) {
    const pool = EVENTS.filter(ev =>
      (!ev.pos || ev.pos === player.position) && condOk(player, ev.cond)
    );
    if (pool.length === 0) return null;
    const weights = pool.map(ev => ev.weight || 1);
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  return { condOk, pick };
})();
