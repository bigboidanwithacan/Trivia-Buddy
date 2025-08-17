import { Collection, Events, MessageFlags } from 'discord.js';
import { logger, Chalk } from '../utility/logger.js';
import { loadConfig } from '../utility/configLoader.js';

const config = await loadConfig();

const logChalk = new Chalk();

export const name = Events.InteractionCreate;

export async function execute(interaction) {
	const { commandName } = interaction;
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			logger.error(`No command matching ${interaction.commandName} was found.`);
			logChalk.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		const { cooldowns } = interaction.client;

		if (!cooldowns.has(commandName)) {
			cooldowns.set(commandName, new Collection());
		}

		// Keep track of the current time
		// Then figure out if there exists a cooldown timer for the command
		const now = Date.now();
		const timestamps = cooldowns.get(commandName);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

		// Figure out if the user is on cooldown for this command
		// if not then keep track of the new cooldown timer, if so then inform user that they are on cooldown
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1_000);
				return interaction.reply({
					content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		// only i (my main account) am allowed to reload commands
		if (commandName === 'reload') {
			if (interaction.user.id != config.myUserId) {
				return interaction.reply({
					content: 'Sorry you are not authorized to use this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			logger.error(error);
			logChalk.error(`${commandName} was not able to execute!`);
			console.log(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
			else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
	else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(commandName);
		if (!command) {
			logger.error(`No command matching ${interaction.commandName} was found.`);
			logChalk.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.autocomplete(interaction);
		}
		catch (error) {
			console.error(error);
		}
	}
}