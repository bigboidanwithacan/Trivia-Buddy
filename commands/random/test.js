import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('test')
	.setDescription('Command used to test whatever stuff');

export async function execute(interaction) {
	await interaction.reply('test!');
}
