import { REST, Routes } from "discord.js";
import { loadConfig } from "./configLoader.js";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from 'fs';
import { Chalk, logger } from './logger.js' 

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
		const commandModule = await import(pathToFileURL(filePath).href);
		const command = { ...commandModule };
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}else{
			logChalk.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(config.token);

(async () => {
	try{
		logChalk.info(`Started refreshing ${commands.length} application (/) commands.`);
		
		// This is for individual discord servers, comment this out and uncomment the code below for global deployment
		for (const guildId of config.guildIds) {
			const data = await rest.put(
				Routes.applicationGuildCommands(config.clientId, guildId),
				{
					body: commands,
				}
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
	catch(error){
		console.error(error);
		logChalk.error(error);
	}
})();
