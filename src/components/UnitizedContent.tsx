import { Checkbox } from 'antd';
import type { Block, Unit } from '../types';
import { unitKey } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';
import { BlockList } from './BlockList';

export interface Segment {
  unit: Unit;
  /** Parent h2 title when the unit is an h3 subsection. */
  group?: string;
  /** Blocks that belong to the group heading but precede its first h3. */
  pre: Block[];
  blocks: Block[];
}

export function buildSegments(blocks: Block[], units: Unit[]): { preamble: Block[]; segments: Segment[] } {
  const unitAt = new Map(units.map((u) => [u.i, u]));
  const firstUnit = units.length > 0 ? Math.min(...units.map((u) => u.i)) : blocks.length;
  const preamble = blocks.slice(0, firstUnit);
  const segments: Segment[] = [];
  let pendingGroup: { title: string; pre: Block[] } | null = null;

  for (let i = firstUnit; i < blocks.length; i++) {
    const b = blocks[i];
    const unit = unitAt.get(i);
    if (unit) {
      segments.push({
        unit,
        group: pendingGroup?.title,
        pre: pendingGroup?.pre ?? [],
        blocks: [b],
      });
      pendingGroup = null;
    } else if (b.t === 'h2') {
      // Section heading whose subsections are the actual units.
      pendingGroup = { title: b.text, pre: [] };
    } else if (pendingGroup) {
      pendingGroup.pre.push(b);
    } else {
      const last = segments[segments.length - 1];
      if (last) last.blocks.push(b);
      else preamble.push(b);
    }
  }
  return { preamble, segments };
}

function UnitBody({
  chapterNum,
  segment,
  preamble,
  showPreamble,
}: {
  chapterNum: number;
  segment: Segment;
  preamble: Block[];
  showPreamble: boolean;
}) {
  const { isDone, toggle } = useProgress();
  const { ns } = useProgram();
  const key = unitKey(ns, chapterNum, segment.unit.i);
  const checked = isDone('units', key);
  const isSub = segment.blocks[0].t === 'h3';
  const Heading = isSub ? 'h3' : 'h2';

  return (
    <section className={checked ? 'unit unit-done' : 'unit'}>
      {showPreamble && preamble.length > 0 && <BlockList blocks={preamble} />}
      {segment.group && <h2 className="doc-h2 group-title">{segment.group}</h2>}
      <div className="unit-head">
        <Heading className={isSub ? 'doc-h3 unit-title' : 'doc-h2 unit-title'}>{segment.unit.t}</Heading>
        <Checkbox checked={checked} onChange={() => toggle('units', key)}>
          закрыто
        </Checkbox>
      </div>
      {segment.pre.length > 0 && <BlockList blocks={segment.pre} />}
      <BlockList blocks={segment.blocks.slice(1)} />
    </section>
  );
}

/** Renders every unit of a chapter sequentially, each with a «закрыто» checkbox. */
export function UnitizedContent({ chapterNum, blocks, units }: { chapterNum: number; blocks: Block[]; units: Unit[] }) {
  const { preamble, segments } = buildSegments(blocks, units);
  return (
    <div className="unitized">
      {preamble.length > 0 && <BlockList blocks={preamble} />}
      {segments.map((segment) => (
        <UnitBody
          key={segment.unit.i}
          chapterNum={chapterNum}
          segment={segment}
          preamble={[]}
          showPreamble={false}
        />
      ))}
    </div>
  );
}

/** Renders exactly one unit of a chapter (one-topic-per-page mode). */
export function SingleUnit({
  chapterNum,
  blocks,
  units,
  index,
  showPreamble,
}: {
  chapterNum: number;
  blocks: Block[];
  units: Unit[];
  index: number;
  showPreamble?: boolean;
}) {
  const { preamble, segments } = buildSegments(blocks, units);
  const segment = segments[index];
  if (!segment) {
    return (
      <p className="muted">Тема не найдена — вернитесь к списку модулей.</p>
    );
  }
  return (
    <div className="unitized">
      <UnitBody
        chapterNum={chapterNum}
        segment={segment}
        preamble={preamble}
        showPreamble={Boolean(showPreamble)}
      />
    </div>
  );
}
