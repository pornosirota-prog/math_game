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
cd I:\math_game\frontend
npm install
npm run dev
```

Frontend поднимется на `http://localhost:5173`.

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
