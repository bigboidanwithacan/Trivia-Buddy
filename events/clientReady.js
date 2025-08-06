import { Events } from 'discord.js';
import { logger } from './../utility/logger.js';

// module.exports = {
// 	name: Events.ClientReady(),

// 	execute(client){
// 		console.log(`Client is ready! Logged in as ${client.user.tag}`);
// 	}
// }

export const name = Events.ClientReady;

export const once = true;

export function execute(client) {
	console.log(`Client is ready! Logged in as ${client.user.tag}`);
	logger.info(`Client is ready! Logged in as ${client.user.tag}`);
}