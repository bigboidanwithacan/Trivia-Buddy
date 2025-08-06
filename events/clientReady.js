import { Events } from 'discord.js';
import { logger } from './../utility/logger.js';

export const name = Events.ClientReady;

export const once = true;

export function execute(client) {
	console.log(`Client is ready! Logged in as ${client.user.tag}`);
	logger.info(`Client is ready! Logged in as ${client.user.tag}`);
}