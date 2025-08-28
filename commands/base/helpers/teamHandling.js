import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { REGULAR_DELAY, ROUND_WAIT, BIG_DELAY } from '../../util/constants.js';

export async function teamCreate(game) {
	if (!game.options.teams) {
		if (!game.quizStart && !game.quizEnd && !game.quizPaused) {
			const message = await game.interaction.channel.send('Game is starting!');
			setTimeout(() => message.delete(), BIG_DELAY);
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, REGULAR_DELAY);
			});
		}
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
	const start = Math.floor((now + ROUND_WAIT) / 1_000);

	const message = await game.interaction.channel.send({
		content: `How many teams do you want in the game? <t:${start}:R>`,
		components: [selectRow],
	});

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
			await message.delete();
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

	const now = Date.now();
	const start = Math.floor((now + ROUND_WAIT) / 1_000);

	const selectTeamMessage = await game.interaction.channel.send({
		content: `Join your preferred team! <t:${start}:R>`,
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

		console.log(selectTeamMessage.components[0].components);

		let disabledButtons = 0, joinedTeam = 0;
		collector.on('collect', async (buttonInteraction) => {
			game.teams.get(buttonInteraction.customId).push(buttonInteraction.user.id);
			const teamArray = game.teams.get(buttonInteraction.customId);
			console.log(buttonInteraction.component);
			await buttonInteraction.reply({
				content: `You have joined ${buttonInteraction.component.data.label}`,
				flags: MessageFlags.Ephemeral,
			});
			joinedTeam++;
			console.log(teamArray);
			console.log('array length', teamArray.length - 1);
			console.log(`The formula and result: ⌈${game.players.size} / ${game.options.teams}⌉ = `, (Math.ceil(game.players.size / game.options.teams)));
			if ((teamArray.length - 1) >= (Math.ceil(game.players.size / game.options.teams))) {
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
			if (disabledButtons === game.options.teams || joinedTeam === game.players.size) {
				collector.stop('Everyone has joined the match!');
			}
		});

		collector.on('end', async () => {
			await selectTeamMessage.delete();
			if (!game.quizStart && !game.quizEnd && !game.quizPaused) {
				const message = await game.interaction.channel.send('Game is starting!');
				setTimeout(() => message.delete(), BIG_DELAY);
			}
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, REGULAR_DELAY);
			});
			res();
		});

	});
}