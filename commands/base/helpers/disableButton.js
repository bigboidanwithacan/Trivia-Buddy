import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export async function disableButton(message, buttonStyleCorrect) {
	const newRow = new ActionRowBuilder();
	for (const button of message.components[0].components) {
		if (button.data.custom_id === 'correct') {
			const tempButton = new ButtonBuilder(button.toJSON())
				.setStyle(buttonStyleCorrect)
				.setDisabled(true);
			newRow.addComponents(tempButton);
			continue;
		}
		const tempButton = new ButtonBuilder(button.toJSON())
			.setDisabled(true);
		newRow.addComponents(tempButton);
	}
	await message.edit({ content: ' ', components: [newRow] });
}