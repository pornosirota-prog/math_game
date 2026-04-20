const test = require('node:test');
const assert = require('node:assert/strict');

const {
  evaluateLinearExpression,
  isAnswerCorrect,
  normalizeNumericInput
} = require('../.tmp-strategy-tests/shared/math/answerValidation.js');
const { ArithmeticTaskGenerator } = require('../.tmp-strategy-tests/mathgame/generators/ArithmeticTaskGenerator.js');

test('division answer 154 / 14 accepts 11 as correct', () => {
  assert.equal(isAnswerCorrect('11', 999, '154 / 14'), true);
  assert.equal(isAnswerCorrect('10.9', 11, '154 / 14'), false);
});

test('negative answer -58 is accepted as correct', () => {
  assert.equal(isAnswerCorrect('-58', -58, '2 - 60'), true);
  assert.equal(isAnswerCorrect('−58', -58, '2 - 60'), true);
  assert.equal(isAnswerCorrect('-57', -58, '2 - 60'), false);
});

test('isAnswerCorrect supports comma decimal and trimmed input', () => {
  assert.equal(isAnswerCorrect(' 3,5 ', 3.5, '7 / 2'), true);
  assert.equal(isAnswerCorrect('3.4', 3.5), false);
});

test('evaluateLinearExpression computes left-to-right and blocks invalid syntax', () => {
  assert.equal(evaluateLinearExpression('-58'), -58);
  assert.equal(evaluateLinearExpression('10 - -68'), 78);
  assert.equal(evaluateLinearExpression('6 × -4'), -24);
  assert.equal(evaluateLinearExpression('100 / 10 / 2'), 5);
  assert.equal(evaluateLinearExpression('5 + 4 * 2'), 18);
  assert.equal(Number.isNaN(evaluateLinearExpression('2 ** 4')), true);
  assert.equal(Number.isNaN(evaluateLinearExpression('10 / 0')), true);
});

test('normalizeNumericInput parses expression safely', () => {
  assert.equal(normalizeNumericInput('2 + 3 * 4'), 14);
  assert.equal(normalizeNumericInput(' (12 - 2) / 5 '), 2);
  assert.equal(normalizeNumericInput('−58'), -58);
  assert.equal(normalizeNumericInput('18 ÷ -3'), -6);
  assert.equal(Number.isNaN(normalizeNumericInput('alert(1)')), true);
});

test('arithmetic generator division tasks always match prompt evaluation', () => {
  const generator = new ArithmeticTaskGenerator();
  const template = {
    id: 'division-regression',
    tier: 2,
    taskKind: 'arithmetic',
    operations: ['/'],
    numberSpecs: [
      { min: 120, max: 240 },
      { min: 11, max: 20 }
    ],
    expectedTimeMs: 5000,
    challengeWeight: 1,
    allowNegativeResult: false
  };

  for (let i = 0; i < 300; i += 1) {
    const task = generator.generate(template, 30);
    const evaluated = evaluateLinearExpression(task.prompt);
    assert.equal(Number.isFinite(evaluated), true, `Prompt must be finite: ${task.prompt}`);
    assert.ok(Math.abs(task.answer - evaluated) < 0.01, `Prompt and answer mismatch for ${task.prompt}`);
  }
});

test('arithmetic generator negative-enabled tasks stay compatible with answer validation', () => {
  const generator = new ArithmeticTaskGenerator();
  const template = {
    id: 'negative-subtraction-regression',
    tier: 2,
    taskKind: 'arithmetic',
    operations: ['-'],
    numberSpecs: [
      { min: 2, max: 30 },
      { min: 31, max: 90 }
    ],
    expectedTimeMs: 4000,
    challengeWeight: 1,
    allowNegativeResult: true
  };

  let observedNegative = false;

  for (let i = 0; i < 300; i += 1) {
    const task = generator.generate(template, 22);
    const evaluated = evaluateLinearExpression(task.prompt);
    assert.equal(task.answer, evaluated, `Prompt and answer mismatch for ${task.prompt}`);
    assert.equal(isAnswerCorrect(String(task.answer), task.answer, task.prompt), true);
    if (task.answer < 0) {
      observedNegative = true;
      assert.equal(isAnswerCorrect(`\u2212${Math.abs(task.answer)}`, task.answer, task.prompt), true);
    }
  }

  assert.equal(observedNegative, true, 'Should generate at least one negative answer');
});

test('arithmetic generator mixed operations still keeps answer and prompt consistent', () => {
  const generator = new ArithmeticTaskGenerator();
  const template = {
    id: 'mixed-consistency',
    tier: 3,
    taskKind: 'arithmetic',
    operations: ['+', '-', '*', '/'],
    numberSpecs: [
      { min: 2, max: 30 },
      { min: 2, max: 30 },
      { min: 2, max: 30 }
    ],
    expectedTimeMs: 5200,
    challengeWeight: 1.3,
    allowNegativeResult: false
  };

  for (let i = 0; i < 300; i += 1) {
    const task = generator.generate(template, 45);
    const evaluated = evaluateLinearExpression(task.prompt);
    assert.equal(Number.isFinite(evaluated), true, `Prompt must be finite: ${task.prompt}`);
    assert.ok(Math.abs(task.answer - evaluated) < 0.01, `Mismatch in generated task: ${task.prompt}`);
  }
});
