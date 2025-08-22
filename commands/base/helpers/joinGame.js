import { ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, MessageFlags, EmbedBuilder } from 'discord.js';
import { joinedMessages, MAX_PLAYERS, START_WAIT } from '../../util/constants.js';

export async function joinGame(interaction, game) {
	const joinButton = new ButtonBuilder()
		.setCustomId('join')
		.setLabel('Join The Game!')
		.setEmoji('👉')
		.setStyle(ButtonStyle.Success);

	const joinRow = new ActionRowBuilder()
		.addComponents(joinButton);

	const now = Date.now();
	const start = Math.floor((now + START_WAIT) / 1_000);

	const embed = new EmbedBuilder()
		.setTitle('Game Options');
	for (const option of Object.entries(game.options)) {
		if (option[1] !== null) {
			embed.addFields({ name: option[0], value: `${option[1]}` });
		}
	}
	await interaction.editReply(`${interaction.user} has just initiated a trivia game! Click the button below to join. Countdown till the trivia game starts <t:${start}:R>`);
	await game.interaction.channel.send({ embeds: [embed] });
	setTimeout(async () => await interaction.deleteReply(), START_WAIT);

	const joinMessage = await interaction.channel.send({
		content: 'Click the button below to join the game if you are not the current host!',
		components: [joinRow],
	});

	// this will be used to keep track of everything that a player needs to have
	game.players.set(interaction.user.id, { points: 0, answer: null });

	const joinFilter = async (buttonInteraction) => {
		if (!(game.players.has(buttonInteraction.user.id))) {
			return true;
		}
		await buttonInteraction.reply({
			content: joinedMessages[Math.floor(Math.random() * joinedMessages.length)],
			flags: MessageFlags.Ephemeral,
		});
		return false;
	};

	const joinButtonCollector = joinMessage.createMessageComponentCollector({
		filter: joinFilter,
		componentType: ComponentType.Button,
		time: START_WAIT,
		maxUsers: MAX_PLAYERS,
	});

	joinButtonCollector.on('collect', async (buttonInteraction) => {
		game.players.set(buttonInteraction.user.id, { points: 0, answer: null });
		await buttonInteraction.reply({
			content: 'You have joined the game!',
			flags: MessageFlags.Ephemeral,
		});
	});

	joinButtonCollector.on('end', async () => {
		if (!game.quizStart && !game.quizEnd && !game.quizPaused) {
			const message = await interaction.channel.send('Game is starting!');
			setTimeout(() => message.delete(), 5_000);
		}
	});
}