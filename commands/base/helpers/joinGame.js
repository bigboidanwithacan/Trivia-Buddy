import { ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';
import { joinedMessages, startWait } from '../../util/constants.js';

export async function joinGame(interaction) {
	const joinButton = new ButtonBuilder()
		.setCustomId('join')
		.setLabel('Join The Game!')
		.setEmoji('👉')
		.setStyle(ButtonStyle.Success);

	const joinRow = new ActionRowBuilder()
		.addComponents(joinButton);

	const now = Date.now();
	const start = Math.floor((now + startWait) / 1_000);
	await interaction.editReply(`${interaction.user} has just initiated a trivia game! Click the button below to join. Countdown till the trivia game starts <t:${start}:R>`);
	setTimeout(async () => await interaction.deleteReply(), startWait);

	const joinMessage = await interaction.channel.send({
		content: 'Click the button below to join the game if you are not the current host!',
		components: [joinRow],
	});

	// this will be used to keep track of everything that a player needs to have
	const players = new Map();
	players.set(interaction.user.id, { points: 0, answer: null });

	const joinFilter = async (buttonInteraction) => {
		if (!(players.has(buttonInteraction.user.id))) {
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
		time: startWait,
		maxUsers: 8,
	});

	joinButtonCollector.on('collect', async (buttonInteraction) => {
		players.set(buttonInteraction.user.id, { points: 0, answer: null });
		await buttonInteraction.reply({
			content: 'You have joined the game!',
			flags: MessageFlags.Ephemeral,
		});
	});

	joinButtonCollector.on('end', async () => {
		const message = await interaction.channel.send('Game is starting!');
		setTimeout(() => message.delete(), 5_000);
	});

	return players;
}