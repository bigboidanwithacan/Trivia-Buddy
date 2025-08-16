import { REST, Routes } from 'discord.js';
import { loadConfig } from './configLoader.js';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { Chalk, logger } from './logger.js';

const logChalk = new Chalk();

const config = await loadConfig();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const commandsFolderPath = path.join(__dirname, '..', 'commands');
const commandsFolder = fs.readdirSync(commandsFolderPath);
for (const folder of commandsFolder) {
	const commandsPath = path.join(commandsFolderPath, folder);
	const commandFiles = fs.readdirSync(commandsPath);
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		// in case i have some helper stuff for a command, i will create a folder where the command file is
		// and i do not want that folder to create issues when trying to load up commands
		const checkForFolder = await fs.promises.stat(filePath);
		if (checkForFolder.isDirectory()) {
			continue;
		}
		const commandModule = await import(pathToFileURL(filePath).href);
		const command = { ...commandModule };
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			// utility folder does not always house commands
			// sometimes it houses functions and possibly modules that are helpful to commands
			// therefore if a non command file is found just skip the error output
			if (folder === 'util') {
				continue;
			}
			logChalk.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(config.token);

(async () => {
	try {
		logChalk.info(`Started refreshing ${commands.length} application (/) commands.`);

		// This is for individual discord servers, comment this out and uncomment the code below for global deployment
		for (const guildId of config.guildIds) {
			const data = await rest.put(
				Routes.applicationGuildCommands(config.clientId, guildId),
				{
					body: commands,
				},
			);
			logChalk.info(`Successfully reloaded ${data.length} application (/) commands in the guild: ${guildId}.`);
		}

		// const data = await rest.put(
		//     Routes.applicationCommands(clientId),
		//     {
		//         body: commands
		//     },
		// );
		// logChalk.info(`Successfully reloaded ${data.length} application (/) commands.`);

	}
	catch (error) {
		console.error(error);
		logChalk.error(error);
	}
})();
