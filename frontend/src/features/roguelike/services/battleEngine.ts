import { BattleState, BattleTurnResult, MathTaskGenerator, PlayerState } from '../domain/types';
import { hasMistakeForgiveness } from './relicEngine';

const round = (value: number) => Math.round(value * 100) / 100;

export const createBattleResolver = (taskGenerator: MathTaskGenerator) => {
  const resolveTurn = (
    battle: BattleState,
    player: PlayerState,
    answer: string,
    answerTimeMs: number,
    now: number
  ): { battle: BattleState; player: PlayerState; result: BattleTurnResult } => {
    const numeric = Number(answer.replace(',', '.'));
    const isCorrect = Number.isFinite(numeric) && Math.abs(numeric - battle.currentTask.answer) < 0.01;
    const isFast = isCorrect && answerTimeMs <= battle.enemy.speedPressureMs;
    const speedBonus = isFast ? 1 + player.speedBonusMultiplier : 1;

    let nextPlayer = { ...player };
    let enemy = { ...battle.enemy };
    let damageToEnemy = 0;
    let damageToPlayer = 0;

    if (isCorrect) {
      nextPlayer.combo += 1;
      nextPlayer.bestCombo = Math.max(nextPlayer.bestCombo, nextPlayer.combo);
      damageToEnemy = Math.max(1, Math.round((nextPlayer.baseDamage + Math.floor(nextPlayer.combo / 3)) * speedBonus));
      enemy.hp = Math.max(0, enemy.hp - damageToEnemy);
      nextPlayer.correct += 1;
    } else {
      const forgivable = hasMistakeForgiveness(nextPlayer) && !nextPlayer.mistakesForgivenInBattle;
      if (forgivable) {
        nextPlayer.mistakesForgivenInBattle = true;
      } else {
        nextPlayer.combo = 0;
        const punish = Math.max(2, Math.round(enemy.damage * 0.45));
        nextPlayer.hp = Math.max(0, nextPlayer.hp - punish);
        damageToPlayer += punish;
      }
    }

    nextPlayer.solved += 1;
    enemy.actionsUntilAttack -= 1;

    if (enemy.actionsUntilAttack <= 0 && enemy.hp > 0) {
      const incoming = Math.max(1, enemy.damage - nextPlayer.armor);
      nextPlayer.hp = Math.max(0, nextPlayer.hp - incoming);
      damageToPlayer += incoming;
      enemy.actionsUntilAttack = enemy.attackEveryActions;
    }

    const nextTask = taskGenerator.generate({
      depth: battle.currentTask.tier,
      operations: ['+', '-', '*', '/'],
      min: 2,
      max: 20 + battle.currentTask.tier,
      chained: battle.currentTask.tier > 10
    }, now);

    const victory = enemy.hp <= 0;
    const defeat = nextPlayer.hp <= 0;

    const result: BattleTurnResult = {
      isCorrect,
      damageToEnemy,
      damageToPlayer,
      answerTimeMs,
      nextTask,
      logLine: isCorrect
        ? `✔ ${battle.currentTask.prompt} — урон ${damageToEnemy}${isFast ? ' (быстро!)' : ''}`
        : '✖ Ошибка, противник перехватывает инициативу.',
      victory,
      defeat
    };

    return {
      battle: {
        ...battle,
        enemy,
        currentTask: nextTask,
        actionLog: [result.logLine, ...battle.actionLog].slice(0, 6)
      },
      player: {
        ...nextPlayer,
        hp: round(nextPlayer.hp)
      },
      result
    };
  };

  return { resolveTurn };
};
