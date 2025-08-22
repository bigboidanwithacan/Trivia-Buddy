import timers from 'node:timers/promises';


export const wait = timers.setTimeout;

// array of chat id's where a game is currently occurring.
// At the end of a game, id should be removed from this array.
export const currentGameChats = [];

// used to hold session tokens for channels
export const sessionTokens = new Map();