import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { START_WAIT, BIG_DELAY, MAX_PLAYERS } from '../../util/constants.js';

export async function teamCreate(game) {
	if (!game.options.teams) {
		return;
	}
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

	const now = Date.now();
	const start = Math.floor((now + START_WAIT) / 1_000);

	const message = await game.interaction.editReply({
		content: `How many teams do you want in the game? <t:${start}:R>`,
		components: [selectRow],
		// if error check add withResponse: true, here
	});


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
		time: START_WAIT,
		max: 1,
	});

	return new Promise((res) => {

		teamCollector.on('collect', menuInteraction => {
			game.options.teamAmount = menuInteraction.values[0];
			game.createTeams(+menuInteraction.values[0]);
		});

		teamCollector.on('end', async () => {
			await game.interaction.deleteReply();
			// not awaiting because i want the function to return to runGame.js while joinTeams.js is still running
			// this will help with the flow of the program
			joinTeams(game);
			res();
		});
	});
}

async function joinTeams(game) {
	const buttonRow = new ActionRowBuilder();
	for (let i = 0; i < game.options.teamAmount; i++) {
		const tempButton = new ButtonBuilder()
			.setCustomId(`team${i + 1}`)
			.setLabel(`Team ${i + 1}`)
			.setStyle(ButtonStyle.Primary);

		buttonRow.addComponents(tempButton);
	}

	const now = Date.now();
	const start = Math.floor((now + START_WAIT) / 1_000);

	const selectTeamMessage = await game.interaction.channel.send({
		content: `Join your preferred team! <t:${start}:R>`,
		components: [buttonRow],
	});

	const filter = interaction => {
		if (game.players.has(interaction.user.id)) {
			interaction.reply({
				content: 'You have already joined a team!',
				flags: MessageFlags.Ephemeral,
			});
			return false;
		}
		return true;
	};

	const collector = selectTeamMessage.createMessageComponentCollector({
		filter: filter,
		componentType: ComponentType.Button,
		time: START_WAIT,
	});
	return new Promise((res) => {

		let disabledButtons = 0, joinedTeam = 0;
		collector.on('collect', async (buttonInteraction) => {
			game.teams.get(buttonInteraction.customId).push(buttonInteraction.user.id);
			game.players.set(buttonInteraction.user.id, { team: buttonInteraction.component.data.label, answer: null, points: 0 });
			const teamArray = game.teams.get(buttonInteraction.customId);
			await buttonInteraction.reply({
				content: `You have joined ${buttonInteraction.component.data.label}`,
				flags: MessageFlags.Ephemeral,
			});
			joinedTeam++;
			if ((teamArray.length - 1) >= (Math.ceil(MAX_PLAYERS / game.options.teamAmount))) {
				// disable specific button
				const newRow = new ActionRowBuilder();
				for (const button of selectTeamMessage.components[0].components) {
					const tempButton = new ButtonBuilder(button.toJSON());
					if (button.data.custom_id === buttonInteraction.customId) {
						tempButton.setDisabled(true);
					}
					newRow.addComponents(tempButton);
				}
				await selectTeamMessage.edit({ content: `Join your preferred team! <t:${start}:R>`, components: [newRow] });
				disabledButtons++;
			}
			if (disabledButtons === game.options.teamAmount || joinedTeam === MAX_PLAYERS) {
				collector.stop('Max players reached');
			}
		});

		collector.on('end', async () => {
			await selectTeamMessage.delete();
			if (!game.quizStart && !game.quizEnd && !game.quizPaused) {
				const message = await game.interaction.channel.send('Game is starting!');
				setTimeout(() => message.delete(), BIG_DELAY);
			}
			res();
		});

	});
}