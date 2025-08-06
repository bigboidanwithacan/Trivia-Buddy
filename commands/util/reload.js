import { SlashCommandBuilder } from "discord.js";
import path from 'path';
import { pathToFileURL, fileURLToPath } from "url";
import {readdirSync, existsSync} from 'fs';
import { logger } from "../../utility/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
	.setName('reload')
	.setDescription('This command reloads other commands passed as an option.')
	.addStringOption(option => 
		option.setName('command')
			.setDescription('The command that is to be reloaded')
			.setRequired(true),
	);

export async function execute(interaction) {
	const required = true;
	const commandName = interaction.options.getString('command', required).toLowerCase();
	const command = interaction.client.commands.get(commandName);

	if (!command){
		return interaction.reply(`There is no command with the name \`${commandName}\`!`);
	}

	try {
		const commandsFolderPath = path.join(__dirname);
		// i haven't found a better way to truncate the current file name and folder name from the path
		const correctFolderPath = path.join(commandsFolderPath.slice(0, -5));
		const commandsFolder = readdirSync(correctFolderPath);
		let correctFolder = '';
		for (const folder of commandsFolder){
			const currentPathCheck = path.join(correctFolderPath, folder, `${commandName}.js`);
			if (existsSync(currentPathCheck)) {
				correctFolder = folder;
				break;
			}
				
		}
		const commandPath = path.join(correctFolderPath, correctFolder,`${commandName}.js`);
		 // Convert to a file URL and add a query to bypass the cache
		const commandUrl = `${pathToFileURL(commandPath).href}?update=${Date}`;

		// dynamically import the command
		const newCommandModule = await import(commandUrl);
		const newCommand = { ...newCommandModule };

		interaction.client.commands.set(newCommand.data.name, newCommand);
		await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
	}
	catch (error) {
		console.error(error);
		logger.error(error);
		await interaction.reply(`There was an error while reloading command \`${commandName}\`:\n\`${error.message}\``)
	}
}