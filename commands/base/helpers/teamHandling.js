import { ActionRowBuilder, ComponentType, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { ROUND_WAIT } from '../../util/constants.js';

export async function teamCreate(game) {
	if (!game.options.teams) return;
	const menu = new StringSelectMenuBuilder()
		.setCustomId('team_selection_menu')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel('Two')
				.setDescription('A total of two teams')
				.setValue('2'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Three')
				.setDescription('A total of three teams')
				.setValue('3'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Four')
				.setDescription('A total of four teams')
				.setValue('4'),
		);

	const row = new ActionRowBuilder()
		.setComponents(menu);
	const message = await game.interaction.editReply({
		content: 'How many teams do you want in the game?',
		components: [row],
		withReply: true,
	});

	// console.log(message.components[0].components[0].toJSON());

	return new Promise((res) => {
		const messageFilter = interaction => {
			if (interaction.user.id === game.interaction.user.id) {
				return true;
			}
			interaction.reply({
				content: 'You cannot choose team sizes since you are not the quiz creator!',
				flags: MessageFlags.Ephemeral,
			});
			return false;
		};
		const teamCollector = message.createMessageComponentCollector({
			filter: messageFilter,
			componentType: ComponentType.StringSelect,
			time: ROUND_WAIT,
			max: 1,
		});

		teamCollector.on('collect', interaction => {
			game.options.teams = interaction.values[0];

		});

		teamCollector.on('end', async () => {
			await game.interaction.editReply({ components: [] });
			res();
		});
	});
}