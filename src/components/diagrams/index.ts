/**
 * Visual schemes for supplement blocks ({ "t": "diagram", "id": "…" }).
 * Registered in BlockList via DIAGRAMS.
 */
import type { ComponentType } from 'react';
import { EventLoopDiagram } from './EventLoopDiagram';

export const DIAGRAMS: Record<string, ComponentType> = {
  'event-loop': EventLoopDiagram,
};
