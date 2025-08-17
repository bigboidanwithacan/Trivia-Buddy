import timers from 'node:timers/promises';
import { EventEmitter } from 'events';


export const wait = timers.setTimeout;

// used later to wait for completion of rounds
export const emitter = new EventEmitter();

// making this an array just to get around the read only rules, and make it mutable even though its const (im a cheater yes i know)
export const instanceCounter = [];