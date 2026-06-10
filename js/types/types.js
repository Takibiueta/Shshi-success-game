/* =========================================================================
 * 鮨サクセス — 型定義（JSDoc）
 * ビルドなしの素のJSなので、型は JSDoc typedef として一元管理する。
 * エディタ補完・レビュー用。ランタイムコードは置かない。
 * ========================================================================= */

/**
 * 効果セット。コマンド/イベント/アイテムの結果はすべてこの形で表す。
 * 値は number か [min, max]（実行時に乱数で確定）。
 * @typedef {Object} EffectSet
 * @property {number|[number,number]} [exp]        経験点（やる気倍率がかかる）
 * @property {number|[number,number]} [work]       作業力
 * @property {number|[number,number]} [service]    接客力
 * @property {number|[number,number]} [judgment]   判断力
 * @property {number|[number,number]} [mental]     メンタル
 * @property {number|[number,number]} [comm]       コミュ力
 * @property {number|[number,number]} [stamina]    体力
 * @property {number|[number,number]} [stress]     ストレス（+はメンタルで軽減される）
 * @property {number|[number,number]} [motivation] やる気
 * @property {number|[number,number]} [boss]       大将評価（+はコミュ力で増幅）
 * @property {number|[number,number]} [coworker]   同僚評価（+はコミュ力で増幅）
 * @property {number|[number,number]} [customer]   客評価
 * @property {number} [all]                        全能力に加算
 */

/**
 * 成功判定。chance = base + (対象ステータス合計) / statDiv（min/max でクランプ）。
 * @typedef {Object} CheckDef
 * @property {string[]} stats   判定に使うステータスキー（複数なら合計）
 * @property {number} [base]    基礎成功率（省略時 BALANCE.checks.base）
 * @property {number} [statDiv] ステータス→確率の係数（省略時 BALANCE.checks.statDiv）
 */

/**
 * 育成コマンド定義（data/commands.js）。
 * check がある場合は success / fail のどちらかが適用される。
 * @typedef {Object} CommandDef
 * @property {string} id
 * @property {string} icon
 * @property {string} name
 * @property {string} kind            ボタン色のキー（CSS data-kind）
 * @property {{stamina?: number}} [cost]
 * @property {EffectSet} [effects]    check なしの場合の効果
 * @property {CheckDef} [check]
 * @property {{effects: EffectSet, msg?: string}} [success]
 * @property {{effects: EffectSet, msg?: string}} [fail]
 * @property {string} note            ホバー時の説明
 */

/**
 * イベントの選択肢。check があると判定後 success / fail を適用。
 * @typedef {Object} EventChoice
 * @property {string} label
 * @property {EffectSet} [effects]
 * @property {string} [msg]
 * @property {string} [item]   入手アイテムID
 * @property {CheckDef} [check]
 * @property {{effects: EffectSet, msg: string, item?: string}} [success]
 * @property {{effects: EffectSet, msg: string}} [fail]
 */

/**
 * 発生条件。すべて満たすと候補に入る（省略 = 無条件）。
 * @typedef {Object} EventCond
 * @property {number} [bossMin]     大将評価がこれ以上
 * @property {number} [bossMax]     大将評価がこれ以下
 * @property {number} [coworkerMin]
 * @property {number} [coworkerMax]
 * @property {number} [stressMin]
 *
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} [chara]   立ち絵の話者（me/oyakata/heroine/rival）
 * @property {string} [expr]    表情
 * @property {string} [pos]     ポジション専用なら職種ID
 * @property {EventCond} [cond]
 * @property {number} [weight]  抽選の重み（省略 1）
 * @property {EventChoice[]} choices
 */

/**
 * エンディング定義（data/endings.js）。配列の先頭から条件を満たした最初のものが採用される。
 * @typedef {Object} EndingDef
 * @property {string} id
 * @property {string} title
 * @property {string} icon
 * @property {string} comment
 * @property {Object} cond  stressMin/judgmentMin/mentalMin/coworkerMin/coworkerMax/bossMin/bossMax/customerMin/totalMin
 */

/**
 * プレイヤー状態（game.js が生成・所有）。
 * @typedef {Object} PlayerState
 * @property {string} position
 * @property {number} week
 * @property {Object} stats    work/service/judgment/mental/comm/stamina/maxStamina
 * @property {number} exp
 * @property {{stress:number, motivation:number}} meters
 * @property {{boss:number, coworker:number, customer:number}} evals
 * @property {number} storeScore
 * @property {Object} items
 */
