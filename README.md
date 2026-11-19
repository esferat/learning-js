# learning-js

Трекер программы обучения **«Fullstack Middle+/Senior (NodeJS, NestJS, NextJS)»**
(672 часа, 18 недель, редакция 1.4).

Весь контент программы — модули, теория, чеклисты, план по неделям, банк интервью-вопросов —
извлекается из исходного .docx и живёт в структурированных JSON-файлах. Отмеченный прогресс
сохраняется в localStorage.

## Стек

- **React 19** + **TypeScript 7**
- **Ant Design 6** (+ `@ant-design/icons`)
- **React Router 7**
- **Vite 8**

## Возможности

| Страница | Что делает |
| --- | --- |
| `/` Дашборд | Прогресс в часах (из 672), закрытые темы, выученные вопросы, чек-листы, недели, полоса прогресса по каждому модулю |
| `/modules` | Таблица 12 модулей: часы (теория/практика/ТЗ), прогресс, статус, оценка дней. React и Next.js — отдельные модули (5 и 6). В сайдбаре «Модули» (300px) — подменю: модули → темы в нумерации документа |
| `/modules/:id/:n` | **Одна тема за раз**: теория, примеры кода, таблицы; чекбокс «закрыто», навигация вперёд/назад и выбор темы из списка. `/modules/:id` открывает первую незакрытую тему |
| `/program` | Цель, входные требования, формат, трудозатраты, карта проектов портфолио |
| `/checklists` | Чек-листы раздела 17 с отметками «Да/Нет» |
| `/plan` | План на 18 недель: недели отмечаются по мере прохождения + таблицы трудозатрат |
| `/interview` | 120 вопросов: вкладки по блокам, поиск, раскрытие конспекта, отметка «выучено» |
| `/resources` | Документация, инструменты, порядок работы с программой |

Код в теории оформлен как окно редактора: подсветка синтаксиса (highlight.js,
автоопределение JavaScript/TypeScript/SQL/Markdown/YAML/Dockerfile), номера строк,
бейдж языка и кнопка копирования. Промпты AI-модулей показываются без подсветки
с бейджем «промпт», а «Примечание: …» — светлой выноской.

Прогресс хранится в `localStorage` под ключом `learning-js:progress:v1`,
сброс — кнопка на дашборде.

## Команды

```bash
pnpm install      # зависимости
pnpm dev          # dev-сервер на http://localhost:5173
pnpm build        # typecheck + прод-сборка в dist/
pnpm preview      # просмотр прод-сборки
pnpm extract      # заново извлечь контент из .docx (см. ниже)
```

## Docker

Многостадийная сборка: `node:22-slim` (typecheck + vite build) → `nginx:1.29-alpine`
со статикой и SPA-fallback.

```bash
docker build -t learning-js .
docker run -d --rm -p 8080:80 --name learning-js learning-js
# → http://localhost:8080
```

Что даёт `nginx.conf`:

- глубокие ссылки (`/modules/3`, `/interview`, …) отдаются через `try_files … /index.html`;
- `/assets/*` кешируется на год (`immutable`, хеши в именах файлов), `index.html` — без кеша;
- gzip для html/css/js/json/svg;
- `HEALTHCHECK` по корню.

## Структура

```
src/
  data/         curriculum.ts (модули, часы, портфолио), content.ts (ленивая загрузка глав),
                derive.ts (разбор интервью/чек-листов/недель), chapters/*.json, meta.json
  lib/          highlight.ts (детекция языка + подсветка highlight.js)
  progress/     ProgressContext.tsx (состояние + localStorage), stats.ts (расчёт процентов)
  components/   BlockList.tsx (рендер блоков), UnitizedContent.tsx (темы с чекбоксами)
  layout/       AppLayout.tsx (Sider + шапка с прогрессом)
  pages/        Dashboard, Modules, Module, Program, Checklists, Plan, Interview, Resources, NotFound
Dockerfile      многостадийная сборка → nginx со статикой (см. раздел Docker)
nginx.conf      SPA-fallback, кеш assets, gzip
```
