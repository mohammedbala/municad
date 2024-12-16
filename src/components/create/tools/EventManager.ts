import EventEmitter from 'eventemitter3';

export const eventManager = new EventEmitter();

export const EVENTS = {
  SHAPE_COMPLETE: 'shape:complete',
  SELECTION_CHANGE: 'selection:change',
  SHAPE_MOVE: 'shape:move',
  SHAPE_DELETE: 'shape:delete',
  SHAPE_UPDATE: 'shape:update',
  MAP_CHANGED: 'map:changed'
} as const;