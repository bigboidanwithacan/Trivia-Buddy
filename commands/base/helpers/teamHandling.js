import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
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

	const selectRow = new ActionRowBuilder()
		.setComponents(menu);
	const message = await game.interaction.channel.send({
		content: 'How many teams do you want in the game?',
		components: [selectRow],
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

		teamCollector.on('collect', menuInteraction => {
			game.options.teams = menuInteraction.values[0];
			game.createTeams(menuInteraction.values[0]);
		});

		teamCollector.on('end', async () => {
			await game.interaction.deleteReply(message);
			await joinTeams(game);
			res();
		});
	});
}

async function joinTeams(game) {
	const buttonRow = new ActionRowBuilder();
	for (let i = 0; i < game.options.teams; i++) {
		const tempButton = new ButtonBuilder()
			.setCustomId(`team${i + 1}`)
			.setLabel(`Team ${i + 1}`)
			.setStyle(ButtonStyle.Primary);

		buttonRow.addComponents(tempButton);
	}

	const selectTeamMessage = await game.interaction.channel.send({
		content: 'Join your preferred team!',
		components: [buttonRow],
	});

	return new Promise((res) => {
		const filter = interaction => {
			if (game.players.has(interaction.user.id)) {
				return true;
			}
			interaction.reply({
				content: 'You have not joined the game, so you can\'t join a team!',
				flags: MessageFlags.Ephemeral,
			});
			return false;
		};

		const collector = selectTeamMessage.createMessageComponentCollector({
			filter: filter,
			componentType: ComponentType.Button,
			time: ROUND_WAIT,
		});

		let disabledButtons = 0, joinedTeam = 0;
		collector.on('collect', async (buttonInteraction) => {
			game.teams.get(buttonInteraction.customId).push(buttonInteraction.user.id);

			joinedTeam++;
			if (teamArray.length === (Math.ceil(game.players.size / game.options.teams) + 1)) {
				// disable specific button
				disabledButtons++;
				if (disabledButtons === game.options.teams || joinedTeam === game.players.size) {
					collector.stop('Everyone has joined the match!');
				}
			}
		});

		collector.on('end', () => {
			res();
		});

	});
}