# Idle Incremental Full-Stack Game

Полноценный MVP браузерной idle/incremental игры с расширяемой архитектурой:
- Spring Boot backend (JWT + Google OAuth2, JPA, Flyway, H2/PostgreSQL-ready)
- React + TypeScript frontend (компонентный UI, sound/animation/theme слои)

## Технологии
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, H2, Flyway, Lombok, MapStruct, OAuth2 Client, JWT
- Frontend: React, TypeScript, Vite, Zustand, Axios

## Структура проекта
- `backend/` — API, security, game-domain, persistence
- `frontend/` — страницы, компоненты, API client, store, sound/animations/theme

## Запуск backend
```bash
cd backend
mvn spring-boot:run
```

Backend поднимется на `http://localhost:8080`.
postgresql://neondb_owner:npg_Vx3hieE0FZkK@ep-lingering-surf-albswyft.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
## Запуск frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Для локальной разработки используйте `VITE_API_BASE_URL=http://localhost:8080` в `.env.local`.
Для production используйте `VITE_API_BASE_URL=https://mathgame-production-70b3.up.railway.app` (см. `frontend/.env.production`).

Frontend поднимется на `http://localhost:5173`.


## Переменные окружения URL
- Frontend:
  - `VITE_API_BASE_URL` — базовый URL backend API и OAuth login (`http://localhost:8080` локально, `https://mathgame-production-70b3.up.railway.app` в production).
- Backend:
  - `APP_FRONTEND_BASE_URL` — URL frontend для OAuth success redirect/CORS (`http://localhost:5173` локально, `https://math-game-8q8.pages.dev` в production).
  - `APP_BACKEND_BASE_URL` — optional backend base URL (`http://localhost:8080` локально, `https://mathgame-production-70b3.up.railway.app` в production).

## H2 Console
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:idlegame;MODE=PostgreSQL;DB_CLOSE_DELAY=-1`
- user: `sa`, password: пусто

## Переключение на PostgreSQL
1. Поднимите PostgreSQL и создайте БД `idlegame`.
2. Отредактируйте `backend/src/main/resources/application-postgres.yml`.
3. Запускайте backend с профилем:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=postgres
   ```
4. Flyway автоматически применит миграции из `db/migration`.

## Где менять игровой баланс и формулу уровней
- Формула уровней: `backend/src/main/java/com/example/idlegame/service/game/level/QuadraticLevelFormula.java`
- Начальные значения игрока: `AuthService`, `OAuth2LoginSuccessHandler`

## Где менять сундуки и награды
- Конфиг сундуков: `ChestConfiguration`
- Стратегии наград: пакет `service/game/reward`
- Добавление нового типа награды: enum `RewardType` + новая `RewardStrategy`

## Где менять звуки и анимации
- Sound registry: `frontend/src/sound/soundConfig.ts`
- Sound manager: `frontend/src/sound/soundManager.ts`
- Animation registry: `frontend/src/animations/animationConfig.ts`
- CSS-анимации/тема: `frontend/src/theme/styles.css`

## Основные API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/player/profile`
- `GET /api/player/progress`
- `GET /api/chest/list`
- `POST /api/chest/open`
- `POST /api/rewards/daily-claim`
- `GET /api/boost/active`

## Seed/demo
Flyway миграция `V1__init.sql` создает demo-игрока:
- email: `demo@game.local`
- password: `demo123`

## Расширение дальше
- Переносите chest/reward конфиги из Java в БД/JSON.
- Добавляйте новые boost types через `BoostEffect` registry.
- Добавляйте игровые action-модули как отдельные service/domain пакеты.
- Подключайте Lottie/Howler без изменения core game flow, заменяя только animation/sound layer.

## Новый режим: Strategy Mode (MVP)

Добавлен отдельный стратегический режим на роуте ` /strategy ` (доступен после авторизации).

### Как открыть
1. Войдите в аккаунт.
2. Откройте боковое меню и выберите пункт **«Стратегия»**.
3. Либо перейдите через страницу **«Режимы»** → **Strategy Mode (MVP)**.

### Что добавлено
- Отдельная страница стратегического режима с изолированным состоянием.
- Карта 3x3 территорий с соседством, стартовым владением центральной территорией.
- Бой за соседнюю территорию через решение математических задач по таймеру.
- Прогресс захвата, серия ответов, штраф за ошибки.
- Захват территории + награды ресурсами (золото и припасы).
- Лог последних действий, сводка по последнему бою.

### Архитектура Strategy feature
`frontend/src/features/strategy/`:
- `StrategyPage.tsx` — orchestration/экран режима.
- `domain/` — сущности карты, территорий, боёв и extension point типы.
- `services/`:
  - `mathChallenge.ts` — генератор задач (`MathTaskGenerator`).
  - `battleEngine.ts` — расчёт боевой сессии (`BattleEngine`, `DifficultyStrategy`).
  - `rewardCalculator.ts` — расчёт наград (`RewardCalculator`).
- `store/strategyGameStore.ts` — чистые функции состояния режима (создание, выбор территории, старт/тик/ответ в бою, завершение).
- `ui/` — небольшие UI-компоненты (карта, панель боя, ресурсы, лог).
- `config/strategyConfig.ts` — параметры сложности/баланса и константы.

### Точки расширения (заложены в коде)
- `TerritoryType`, `TileEffect` / `TerritoryEffect`
- `BattleMode`, `DifficultyStrategy`
- `MathTaskGenerator`
- `RewardCalculator`
- `Unit`, `Building`, `Ability`

Эти интерфейсы позволяют добавлять новые механики (типы территорий, PvE/PvP, ежедневные события, сезонные модификаторы) без переписывания ядра.

## Новый режим: Подземелье Счёта (Math Roguelike MVP)

Добавлен отдельный endless roguelike-lite режим на роуте `/roguelike` (доступен после авторизации), изолированный от классического режима `/game`.

### Как открыть
1. Войдите в аккаунт.
2. Перейдите в боковом меню в **«Подземелье»** или откройте страницу **«Режимы»** → **«Подземелье Счёта (Roguelike)»**.
3. Для возврата в старый режим используйте кнопку **«Классический режим»** в HUD страницы roguelike.

### Core loop режима
- На каждом шаге предлагаются 3 процедурно сгенерированные комнаты (`fight`, `elite`, `treasure`, `event`, `shop`, `rest`).
- В бою игрок решает математические задачи, наносит урон, накапливает combo и speed bonus.
- После победы выдаются награды: золото, кристаллы, иногда выбор реликвии.
- Event/Shop/Rest комнаты дают альтернативные источники прогресса.
- При смерти показывается сводка run и обновляется рекорд глубины.

### Где лежит архитектура roguelike feature
`frontend/src/features/roguelike/`:
- `RoguelikePage.tsx` — page/container и связывание экранов.
- `domain/types.ts` — доменные интерфейсы (`RunState`, `BattleState`, `Reward`, `RelicDefinition`, `EventDefinition`, `RunSummary` и др.).
- `store/runEngine.ts` — чистые функции игрового цикла (выбор комнат, бой, награды, события, магазин, summary).
- `store/useRoguelikeRun.ts` — state orchestration + persistence рекордов.
- `services/`:
  - `roomGenerator.ts` — процедурная генерация комнат с весами и ограничениями.
  - `difficultyStrategy.ts` — `MathDifficultyScaler` (рост сложности по глубине).
  - `mathTaskGenerator.ts` — генерация математических задач.
  - `battleEngine.ts` — расчёт хода боя и штрафов за ошибки.
  - `rewardCalculator.ts` — масштабирование наград от риска и качества игры.
  - `relicEngine.ts` — data-driven применение реликвий.
  - `eventEngine.ts`, `shopEngine.ts` — отдельные домены событий/магазина.
  - `persistence.ts` — localStorage (`mathgame.roguelike.best.v1`).
- `config/enemies.ts`, `config/relics.ts`, `config/theme.ts` — data-driven конфиги врагов, реликвий и визуальных токенов темы.
- `ui/` — изолированные UI панели (`RoomChoicePanel`, `BattlePanel`, `RewardPanel`, `EventPanel`, `ShopPanel`, `RestPanel`, `GameOverPanel`, `DungeonHud`).

### Как расширять дальше (extension points)
- Добавить врага: `config/enemies.ts` + (опционально) новый `behavior` в battle engine.
- Добавить реликвию: `config/relics.ts` + обработка нового `RelicEffect.type` в `services/relicEngine.ts`.
- Добавить новую комнату: расширить `RoomType` и генерацию в `services/roomGenerator.ts`, затем подключить отдельную UI/обработчик в `RoguelikePage.tsx` и `store/runEngine.ts`.
- Изменить кривую сложности: `services/difficultyStrategy.ts`.
- Изменить генерацию задач: `services/mathTaskGenerator.ts`.
- Добавить meta progression/daily challenges/boss fights: новые сервисы, не ломая текущий loop в `store/runEngine.ts`.

### Тесты логики roguelike
- `frontend/tests/roguelike.test.cjs` проверяет:
  - scaling сложности;
  - генерацию комнат;
  - расчёт наград;
  - применение реликвий;
  - progression run (battle → reward → next depth);
  - формирование summary после смерти.

## Dungeon Analytics (ECharts + optional assets fallback)

Для режима `/roguelike` добавлен изолированный аналитический слой с вкладкой **«Статистика»** и post-run обзором после смерти.

### Что добавлено
- Пакеты frontend: `echarts`, `echarts-for-react`.
- Новая аналитическая страница: `frontend/src/features/roguelike/analytics/components/DungeonAnalyticsPage.tsx`.
- Отдельные chart components:
  - `DepthProfileChart`, `ErrorHeatmapChart`, `AccuracyDepthChart`, `MathTypeBreakdownChart`.
- Отдельные builders для ECharts options:
  - `buildDepthProfileOption.ts`
  - `buildErrorHeatmapOption.ts`
  - `buildAccuracyByDepthOption.ts`
  - `buildMathTypePieOption.ts`
- Модели аналитики: `frontend/src/features/roguelike/analytics/models/types.ts`.
- Mapper run state → analytics: `frontend/src/features/roguelike/analytics/utils/runAnalyticsMapper.ts`.

### Optional assets architecture (без обязательных import)
- Manifest путей: `frontend/src/features/roguelike/assets/assetManifest.ts`.
- Resolver: `frontend/src/features/roguelike/assets/optionalAssets.ts` (`getOptionalAsset`).
- Hook проверки загрузки: `frontend/src/features/roguelike/analytics/hooks/useOptionalImage.ts`.
- Optional-компоненты:
  - `OptionalBackground`
  - `OptionalRoomIcon`
  - `OptionalEnemyPortrait`
  - `OptionalRelicArt`

### Куда складывать картинки
Рекомендуемая структура `frontend/public/assets/dungeon/`:
- `backgrounds/dungeon-main.webp`
- `backgrounds/dungeon-summary.webp`
- `backgrounds/dungeon-panel-texture.webp`
- `ui/frame-top.webp`, `ui/card-stone.webp`, `ui/torch-left.webp`, `ui/torch-right.webp`, `ui/divider.webp`
- `room-icons/fight.webp`, `elite.webp`, `chest.webp`, `shop.webp`, `rest.webp`, `event.webp`, `death.webp`
- `enemies/skeleton.webp`, `goblin.webp`, `mage.webp`
- `relics/relic-book.webp`, `relic-shield.webp`, `relic-crystal.webp`
- `charts/chart-overlay.webp`, `charts/chart-glow.webp`
- `fallback/placeholder-room.svg`, `fallback/placeholder-enemy.svg`, `fallback/placeholder-relic.svg`

Если этих файлов нет, UI остаётся рабочим: применяются градиенты, тёмные панели, emoji/SVG fallback-иконки и декоративные placeholders.

### Как добавить новый room type icon
1. Добавьте файл в `public/assets/dungeon/room-icons/`.
2. Пропишите путь в `assetManifest.ts`.
3. Добавьте fallback-эмодзи/иконку в `OptionalRoomIcon`.
4. При необходимости расширьте `RunRoomType` и mapper.

### Как добавить новый enemy portrait
1. Положите изображение в `public/assets/dungeon/enemies/`.
2. Добавьте ключ в `assetManifest.ts`.
3. Расширьте маппинг выбора портрета в `OptionalEnemyPortrait`.

### Как добавить новый график
1. Создайте builder в `analytics/charts/`.
2. Создайте визуальный chart component в `analytics/components/`.
3. Подключите компонент в `DungeonAnalyticsPage`.
4. Если нужны данные — расширьте `RunAnalytics` и `runAnalyticsMapper`.

### Тесты
Добавлены тесты для:
- mapper run state → analytics
- построения depth profile option
- fallback asset resolver/state

Файл: `frontend/tests/roguelike-analytics.test.cjs`.
