import timers from 'node:timers/promises';
import { EventEmitter } from 'events';


export const wait = timers.setTimeout;

// used later to wait for completion of rounds
export const emitter = new EventEmitter();