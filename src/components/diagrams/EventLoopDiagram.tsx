import { Fragment } from 'react';

interface Stage {
  key: string;
  n: number;
  title: string;
  desc: string;
  cls: string;
  badge?: string;
}

const STAGES: Stage[] = [
  {
    key: 'stack',
    n: 1,
    title: 'Стек вызовов',
    desc: 'Синхронный код выполняется здесь, по одному кадру за раз',
    cls: 'el-stack',
  },
  {
    key: 'apis',
    n: 2,
    title: 'Web APIs / libuv',
    desc: 'setTimeout, fetch, I/O, события — уходят в отдельный поток',
    cls: 'el-apis',
  },
  {
    key: 'micro',
    n: 3,
    title: 'Очередь микрозадач',
    desc: 'Промисы, queueMicrotask, process.nextTick',
    cls: 'el-micro',
    badge: 'ВСЕ сразу',
  },
  {
    key: 'macro',
    n: 4,
    title: 'Очередь макрозадач',
    desc: 'Таймеры, I/O, setImmediate, события DOM',
    cls: 'el-macro',
    badge: 'ОДНА за раз',
  },
];

/** Схема работы event loop: стек → внешние API → очереди → возврат в стек. */
export function EventLoopDiagram() {
  const [stack, apis, micro, macro] = STAGES;
  return (
    <figure className="el-diagram" aria-label="Схема работы event loop">
      <div className="el-flow">
        <div className={`el-box ${stack.cls}`}>
          <span className="el-n">{stack.n}</span>
          <h4>{stack.title}</h4>
          <p>{stack.desc}</p>
        </div>
        <span className="el-arrow" aria-hidden="true">
          async →
        </span>
        <div className={`el-box ${apis.cls}`}>
          <span className="el-n">{apis.n}</span>
          <h4>{apis.title}</h4>
          <p>{apis.desc}</p>
        </div>
        <span className="el-arrow" aria-hidden="true">
          колбэки →
        </span>
        <div className="el-queues">
          <div className={`el-box ${micro.cls}`}>
            <span className="el-n">{micro.n}</span>
            <h4>
              {micro.title} <em className="el-badge">{micro.badge}</em>
            </h4>
            <p>{micro.desc}</p>
          </div>
          <div className={`el-box ${macro.cls}`}>
            <span className="el-n">{macro.n}</span>
            <h4>
              {macro.title} <em className="el-badge">{macro.badge}</em>
            </h4>
            <p>{macro.desc}</p>
          </div>
        </div>
      </div>
      <div className="el-loop">
        <Fragment>
          ↺ Стек пуст → выполняются <strong>все</strong> микрозадачи → <strong>одна</strong> макрозадача → снова
          микрозадачи → (рендеринг, если есть время) → колбэки из очередей попадают в стек
        </Fragment>
      </div>
      <figcaption className="el-caption">
        Порядок строго детерминирован: setTimeout(fn, 0) — макрозадача, поэтому любой промис и queueMicrotask
        выполнятся раньше.
      </figcaption>
    </figure>
  );
}
