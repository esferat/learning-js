/**
 * Static metadata of the programme modules — hand-structured from section 2
 * («Структура программы и трудозатраты по модулям») of the source document.
 *
 * The document combines React and Next.js into one «Модуль 4» (112 ч); the app
 * splits them into two modules (48 ч + 64 ч). Display numbers are id + 1, so
 * React is «Модуль 5» and Next.js is «Модуль 6» (see src/lib/renumber.ts).
 */

export interface ModuleHours {
  theory: number;
  practice: number;
  assignment: number;
  total: number;
}

export interface PortfolioProject {
  name: string;
  stack: string;
  proves: string;
}

export interface ModuleInfo {
  id: number;
  title: string;
  /** Chapter numbers (from the source document) that belong to this module. */
  chapterNums: number[];
  hours: ModuleHours;
  /** Estimated days at 9 h/day. */
  daysAt9: number;
  /** What has to be handed in at the end of the module. */
  assignment: string;
  stack: string;
  portfolio?: PortfolioProject[];
}

export const PROGRAM = {
  title: 'Программа обучения Fullstack Middle+/Senior',
  subtitle: 'Паттерны и SOLID · React · Node.js · NestJS · Next.js · PostgreSQL · Kafka · AI',
  totalHours: 672,
  totalWeeks: 18,
  intensity: '8–10 часов в день',
  revision: 'Редакция 1.4',
  interviewQuestions: 120,
} as const;

export const MODULES: ModuleInfo[] = [
  {
    id: 0,
    title: 'JavaScript: теория и выравнивание базы',
    chapterNums: [3],
    hours: { theory: 16, practice: 22, assignment: 2, total: 40 },
    daysAt9: 4.4,
    assignment: 'Практическое задание «Утилитарная библиотека и событийный роутер» (2 ч)',
    stack: 'Типы, замыкания, this, прототипы, асинхронность, ESM',
  },
  {
    id: 1,
    title: 'Node.js: фундамент и глубина',
    chapterNums: [4],
    hours: { theory: 16, practice: 32, assignment: 8, total: 56 },
    daysAt9: 6,
    assignment: 'Тестовое задание №1. «Сервис агрегации логов» (8 ч)',
    stack: 'V8, libuv, event loop, стримы, worker_threads, тесты',
    portfolio: [
      {
        name: 'Сервис агрегации логов',
        stack: 'Node.js без фреймворка, streams, worker_threads',
        proves: 'глубокое знание runtime',
      },
    ],
  },
  {
    id: 2,
    title: 'TypeScript для бэкенда',
    chapterNums: [5],
    hours: { theory: 8, practice: 14, assignment: 2, total: 24 },
    daysAt9: 3,
    assignment: 'Тестовое задание №2 (мини). «Типобезопасный клиент API» (2 ч)',
    stack: 'Инструментальные типы, zod, границы слоёв',
  },
  {
    id: 3,
    title: 'Паттерны и NestJS: архитектура бэкенда',
    chapterNums: [6, 7],
    hours: { theory: 36, practice: 60, assignment: 16, total: 112 },
    daysAt9: 12.4,
    assignment: 'Рефакторинг «god-сервиса» (4 ч) + Тестовое задание №3 «Платёжный сервис» (12 ч)',
    stack: 'SOLID, GoF, чистый код, NestJS, микросервисы, CQRS',
    portfolio: [
      {
        name: 'Платёжный сервис',
        stack: 'NestJS, PostgreSQL, Swagger, e2e-тесты',
        proves: 'архитектура бэкенда, идемпотентность',
      },
      {
        name: 'Рефакторинг «god-сервиса»',
        stack: 'SOLID, Strategy/Repository/Adapter/Facade, чистый код',
        proves: 'умение проектировать и объяснять компромиссы на ревью',
      },
    ],
  },
  {
    id: 4,
    title: 'React: компоненты, состояние, хуки и данные',
    chapterNums: [8],
    hours: { theory: 18, practice: 26, assignment: 4, total: 48 },
    daysAt9: 5.3,
    assignment: 'Практическое задание «React SPA „Дашборд“» (4 ч)',
    stack: 'React-хуки, реконсилиация, контекст, производительность, RTK Query (кратко)',
    portfolio: [
      {
        name: 'React SPA «Дашборд»',
        stack: 'React: хуки, кастомные хуки, ErrorBoundary, RTK Query (кратко)',
        proves: 'модель React: состояние, эффекты, перерендеры',
      },
    ],
  },
  {
    id: 5,
    title: 'Next.js: fullstack-разработка',
    chapterNums: [9],
    hours: { theory: 18, practice: 38, assignment: 8, total: 64 },
    daysAt9: 7.1,
    assignment: 'Тестовое задание №4. «Fullstack-дашборд заказов» (8 ч)',
    stack: 'App Router, RSC, server actions, кеширование, авторизация, Core Web Vitals',
    portfolio: [
      {
        name: 'Fullstack-дашборд',
        stack: 'Next.js (App Router, RSC, server actions) + NestJS',
        proves: 'умение разделять сервер/клиент',
      },
    ],
  },
  {
    id: 6,
    title: 'Базы данных: PostgreSQL, MongoDB, Redis',
    chapterNums: [10],
    hours: { theory: 20, practice: 44, assignment: 8, total: 72 },
    daysAt9: 8,
    assignment: 'Тестовое задание №5. «Модель данных и оптимизация» (8 ч)',
    stack: 'Транзакции, MVCC, индексы, EXPLAIN, миграции, кеш',
    portfolio: [
      {
        name: 'Каталог с оптимизацией SQL',
        stack: 'PostgreSQL, индексы, EXPLAIN, миграции, Redis-кеш',
        proves: 'работа с данными на уровне senior',
      },
    ],
  },
  {
    id: 7,
    title: 'Kafka и event-driven архитектура',
    chapterNums: [11],
    hours: { theory: 18, practice: 30, assignment: 8, total: 56 },
    daysAt9: 6,
    assignment: 'Тестовое задание №6. «Event-driven платформа заказов» (8 ч)',
    stack: 'Гарантии доставки, KafkaJS, outbox, saga, DLQ, схемы событий',
    portfolio: [
      {
        name: 'Event-driven платформа заказов',
        stack: 'Kafka, outbox, DLQ, идемпотентность, testcontainers',
        proves: 'микросервисы и надёжность',
      },
    ],
  },
  {
    id: 8,
    title: 'Эксплуатация, безопасность, производительность',
    chapterNums: [12],
    hours: { theory: 14, practice: 30, assignment: 4, total: 48 },
    daysAt9: 5,
    assignment: 'Тестовое задание №7 (мини). «Наблюдаемость и выкат» (4 ч)',
    stack: 'Docker, CI/CD, логи/метрики/трейсы, безопасность, устойчивость',
  },
  {
    id: 9,
    title: 'Итоговые ТЗ, рефакторинг, code review',
    chapterNums: [13],
    hours: { theory: 6, practice: 34, assignment: 16, total: 56 },
    daysAt9: 6,
    assignment: 'Итоговый капстоун «Платформа заказов» (32 ч) + рефакторинг и code review (24 ч)',
    stack: 'Капстоун, чек-лист code review, рефакторинг чужого кода',
  },
  {
    id: 10,
    title: 'Подготовка к интервью (fullstack middle+/senior)',
    chapterNums: [14],
    hours: { theory: 10, practice: 22, assignment: 8, total: 40 },
    daysAt9: 4,
    assignment: 'Банк вопросов раздела 19, 3–4 STAR-истории, 2 мок-интервью',
    stack: 'Структура интервью, методика подготовки, портфолио и резюме',
  },
  {
    id: 11,
    title: 'AI-инструменты: промпты, навыки, агенты',
    chapterNums: [15, 16],
    hours: { theory: 22, practice: 28, assignment: 6, total: 56 },
    daysAt9: 6.2,
    assignment: '«Промпт-кит и регрессия» (2 ч) + «Агентная конвейерная линия» (4 ч)',
    stack: 'Системные промпты, AGENTS.md, skills, роли, permissions, метрики',
    portfolio: [
      {
        name: 'Промпт-кит и агентная линия',
        stack: 'AGENTS.md, skills, промпты и роли кодер/ревьюер/аналитик',
        proves: 'инженерия работы с AI: метрики, верификация, безопасность',
      },
    ],
  },
];

export const TOTAL_HOURS = MODULES.reduce((sum, m) => sum + m.hours.total, 0);

export function getModule(id: number): ModuleInfo | undefined {
  return MODULES.find((m) => m.id === id);
}

/** Короткие названия модулей для бокового подменю. */
export const MODULE_SHORT: Record<number, string> = {
  0: 'JavaScript',
  1: 'Node.js',
  2: 'TypeScript',
  3: 'Паттерны и NestJS',
  4: 'React',
  5: 'Next.js',
  6: 'Базы данных',
  7: 'Kafka',
  8: 'Эксплуатация и безопасность',
  9: 'Итоговые ТЗ и ревью',
  10: 'Подготовка к интервью',
  11: 'AI: промпты и агенты',
};

// ---------------------------------------------------------------------------
// Java Spring Backend — второе направление (content/java-spring.json → гл. 21–38)
// ---------------------------------------------------------------------------

export const JAVA_PROGRAM = {
  title: 'Программа обучения Java Spring Backend',
  subtitle: 'Java · Spring Boot · JPA · Security · Kafka · тесты · Docker',
  totalHours: 600,
  totalWeeks: 15,
  intensity: '6–8 часов в день',
  revision: 'Редакция 1.0',
  interviewQuestions: 35,
} as const;

export const JAVA_MODULES: ModuleInfo[] = [
  {
    id: 0,
    title: 'Java Core: типы, ООП, коллекции',
    chapterNums: [23],
    hours: { theory: 28, practice: 16, assignment: 4, total: 48 },
    daysAt9: 5.3,
    assignment: 'Тестовое задание «Утилиты и структуры данных» (4 ч)',
    stack: 'Java: типы, ООП, equals/hashCode, коллекции',
  },
  {
    id: 1,
    title: 'Продвинутое Java: стримы, Optional, record',
    chapterNums: [24],
    hours: { theory: 24, practice: 12, assignment: 4, total: 40 },
    daysAt9: 4.4,
    assignment: 'Тестовое задание «Обработка заказов стримами» (4 ч)',
    stack: 'Лямбды, Optional, Stream API, record/sealed',
  },
  {
    id: 2,
    title: 'Параллелизм и JVM',
    chapterNums: [25],
    hours: { theory: 32, practice: 24, assignment: 8, total: 64 },
    daysAt9: 7.1,
    assignment: 'Тестовое задание «Потокобезопасный банк-счёт» (8 ч)',
    stack: 'Синхронизация, пулы, гонки, GC, диагностика JVM',
  },
  {
    id: 3,
    title: 'Spring Boot и IoC',
    chapterNums: [26],
    hours: { theory: 28, practice: 14, assignment: 6, total: 48 },
    daysAt9: 5.3,
    assignment: 'Тестовое задание «Скелет сервиса с конфигурацией» (6 ч)',
    stack: 'IoC, жизненный цикл бинов, конфигурация, профили, actuator',
  },
  {
    id: 4,
    title: 'Веб-слой Spring: REST, валидация, ошибки',
    chapterNums: [27],
    hours: { theory: 24, practice: 18, assignment: 6, total: 48 },
    daysAt9: 5.3,
    assignment: 'Тестовое задание «API таск-трекера» (6 ч)',
    stack: 'REST, DTO-валидация, advice, correlation id, CORS',
  },
  {
    id: 5,
    title: 'Spring Data JPA и БД',
    chapterNums: [28],
    hours: { theory: 28, practice: 20, assignment: 8, total: 56 },
    daysAt9: 6.2,
    assignment: 'Тестовое задание «Банк-счёт на JPA» (8 ч)',
    stack: 'JPA, N+1, транзакции Spring, миграции, EXPLAIN',
  },
  {
    id: 6,
    title: 'Spring Security: JWT и роли',
    chapterNums: [29],
    hours: { theory: 24, practice: 10, assignment: 6, total: 40 },
    daysAt9: 4.4,
    assignment: 'Тестовое задание «Вход с ролями и токенами» (6 ч)',
    stack: 'Аутентификация, JWT-конвейер, роли, CSRF/CORS, секреты',
  },
  {
    id: 7,
    title: 'Тестирование: JUnit, Mockito, Testcontainers',
    chapterNums: [30],
    hours: { theory: 20, practice: 22, assignment: 6, total: 48 },
    daysAt9: 5.3,
    assignment: 'Тестовое задание «Тестовое покрытие сервиса» (6 ч)',
    stack: 'JUnit 5, Mockito, слои тестов, Testcontainers, контракты',
  },
  {
    id: 8,
    title: 'Микросервисы и интеграции',
    chapterNums: [31],
    hours: { theory: 32, practice: 24, assignment: 8, total: 64 },
    daysAt9: 7.1,
    assignment: 'Тестовое задание «Событийная платформа заказов» (8 ч)',
    stack: 'Kafka, Redis-кеш, retry/circuit breaker, идемпотентность',
  },
  {
    id: 9,
    title: 'Эксплуатация: Docker, CI/CD, JVM на проде',
    chapterNums: [32],
    hours: { theory: 24, practice: 18, assignment: 6, total: 48 },
    daysAt9: 5.3,
    assignment: 'Тестовое задание «Прод-готовность сервиса» (6 ч)',
    stack: 'Docker для JVM, CI/CD, Micrometer/Prometheus, диагностика',
  },
  {
    id: 10,
    title: 'Капстоун: платформа заказов',
    chapterNums: [33],
    hours: { theory: 8, practice: 32, assignment: 16, total: 56 },
    daysAt9: 6.2,
    assignment: 'Капстоун «Платформа заказов» (56 ч)',
    stack: 'Spring Boot, JPA, Kafka, Security, Docker, CI',
  },
  {
    id: 11,
    title: 'Подготовка к интервью',
    chapterNums: [34],
    hours: { theory: 16, practice: 16, assignment: 8, total: 40 },
    daysAt9: 4.4,
    assignment: 'Банк вопросов раздела 17, мок-интервью, портфолио',
    stack: 'Код-раунд, Java/Spring-блок, system design, STAR',
  },
];

export const JAVA_MODULE_SHORT: Record<number, string> = {
  0: 'Java Core',
  1: 'Продвинутое Java',
  2: 'Параллелизм и JVM',
  3: 'Spring Boot и IoC',
  4: 'Веб-слой Spring',
  5: 'Spring Data JPA',
  6: 'Spring Security',
  7: 'Тестирование',
  8: 'Микросервисы',
  9: 'Эксплуатация',
  10: 'Капстоун',
  11: 'Подготовка к интервью',
};

// ---------------------------------------------------------------------------
// Реестр направлений: ключ = сегмент маршрута (/fs, /java)
// ---------------------------------------------------------------------------

export interface ProgramDef {
  id: string;
  path: string;
  /** Подпись в логотипе сайдбара. */
  short: string;
  switchLabel: string;
  info: typeof PROGRAM | typeof JAVA_PROGRAM;
  modules: ModuleInfo[];
  shortTitles: Record<number, string>;
  introChapters: number[];
  checklistChapter: number;
  planChapter: number;
  interviewChapter: number;
  resourcesChapter: number;
}

export const PROGRAMS: Record<string, ProgramDef> = {
  fs: {
    id: 'fs',
    path: '/fs',
    short: 'Fullstack Middle+/Senior',
    switchLabel: 'Fullstack',
    info: PROGRAM,
    modules: MODULES,
    shortTitles: MODULE_SHORT,
    introChapters: [1, 2],
    checklistChapter: 17,
    planChapter: 18,
    interviewChapter: 19,
    resourcesChapter: 20,
  },
  java: {
    id: 'java',
    path: '/java',
    short: 'Java Spring Backend',
    switchLabel: 'Java Spring',
    info: JAVA_PROGRAM,
    modules: JAVA_MODULES,
    shortTitles: JAVA_MODULE_SHORT,
    introChapters: [21, 22],
    checklistChapter: 35,
    planChapter: 36,
    interviewChapter: 37,
    resourcesChapter: 38,
  },
};
