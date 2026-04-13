# Adaptive difficulty flow (MVP)

## 1) Core entities

- `FlowState`
  - `difficultyScore` (0..100)
  - `currentTier`
  - `avgAnswerTimeMs` (EMA)
  - `accuracyRate` (EMA)
  - `correctStreak` / `wrongStreak`
  - `templateMastery[templateId]` (0..100)
- `DifficultyTemplate`
  - progression tier
  - fixed numeric profile (`numberSpecs`)
  - operation set
  - `expectedTimeMs`
- `TaskAttempt`
  - correctness
  - `answerMs`
  - template metadata (`templateId`, `tier`, `expectedTimeMs`)

## 2) Progression model

Progression prioritizes number magnitude, then amount of terms, then mixed operations.

1. 2 single-digit addition
2. single + double
3. 2 doubles without carry
4. 2 doubles with carry
5. 2 triples light carry
6. 2 triples with carry
7. 3 doubles
8. 2 doubles + 1 triple
9. 3 triples
10. mixed `+` and `-`

## 3) Update formulas after each answer

- `speedRatio = expectedTimeMs / answerMs`
- Correct answer:
  - `+4` if `speedRatio >= 1.25`
  - `+3` if `speedRatio >= 1.0`
  - `+2` if `speedRatio >= 0.75`
  - `+1` otherwise
  - streak bonus: `+1/+2/+3` for 3/5/8 correct in a row
- Wrong answer:
  - base `-4`
  - extra `-2` on wrong streak >=2
  - extra `-2` on wrong streak >=3
- clamp score to `0..100`
- EMA updates:
  - `avg = old * 0.8 + current * 0.2`
  - `accuracy = old * 0.8 + (correct?1:0) * 0.2`
- mastery update per template:
  - correct fast: `+4`
  - correct slow: `+2`
  - wrong: `-3`

## 4) Next task selection

1. `targetTier` derived from `difficultyScore` bands.
2. Tier sampling:
   - 70% target
   - 20% one tier below
   - 10% one tier above
3. Inside chosen tier, prefer template with the lowest mastery (keeps balanced practice).
