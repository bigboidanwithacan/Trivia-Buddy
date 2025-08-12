import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadConfig } from './utility/configLoader.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from './utility/logger.js';
import { Chalk } from './utility/logger.js';

const logChalk = new Chalk();


const config = await loadConfig();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
] });

client.commands = new Collection();
client.cooldowns = new Collection();

const commandsFolderPath = path.join(__dirname, 'commands');
const commandsFolder = fs.readdirSync(commandsFolderPath);
for (const folder of commandsFolder) {
	const commandsPath = path.join(commandsFolderPath, folder);
	const commandFiles = fs.readdirSync(commandsPath);
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const commandModule = await import(pathToFileURL(filePath).href);
		const command = { ...commandModule };
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			logChalk.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsFolderPath = path.join(__dirname, 'events');
const eventsFolder = fs.readdirSync(eventsFolderPath);
for (const file of eventsFolder) {
	const filePath = path.join(eventsFolderPath, file);
	const eventModule = await import(pathToFileURL(filePath).href);
	const event = { ...eventModule };
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

process.on('unhandledRejection', error => {
	logChalk.error('Unhandled promise rejection', error);
	logger.error('Unhandled promise rejection', error);
});

client.login(config.token);