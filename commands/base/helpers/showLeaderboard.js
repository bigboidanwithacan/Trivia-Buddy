import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, MessageFlags } from 'discord.js';
import { ROUND_BUFFER } from '../../util/constants.js';
import { wait } from '../../util/reusableVars.js';

export async function showLeaderboard(game) {
	const leaderboardButton = new ButtonBuilder()
		.setCustomId('roundLeaderButton')
		.setLabel('Leaderboard')
		.setStyle(ButtonStyle.Secondary);

	const leaderRow = new ActionRowBuilder()
		.setComponents([leaderboardButton]);

	const leaderboardMessage = await game.interaction.channel.send({
		content: 'Click the button below to see the leaderboard and your place!',
		components: [leaderRow],
	});

	const leaderboardCollector = leaderboardMessage.createMessageComponentCollector({ time: ROUND_BUFFER, componentType: ComponentType.Button });

	leaderboardCollector.on('collect', async (buttonInteraction) => {
		// respond to this and make an ephemeral message with an embed that shows leaderboard
		await leaderboardOutput(game, 3, buttonInteraction, true);
	});

	await wait(ROUND_BUFFER);
	leaderboardMessage.delete();
}

export async function leaderboardOutput(game, maxPosition, interaction, ephemeralBoolean) {
	if (game.options.teams) {
		return await teamLeaderboardOutput(game, interaction, ephemeralBoolean);
	}
	const maxPlayers = (maxPosition > game.players.size) ? game.players.size : maxPosition;
	const embed = new EmbedBuilder()
		.setTitle(`Top ${maxPlayers} leaderboard`);
	const positions = [];
	for (const player of game.players.keys()) {
		positions.push({ id: player, points: game.players.get(player).points });
	}
	let foundMyself = false;
	positions.sort((a, b) => b.points - a.points);
	let prevPoints = positions[0].points, playerCount = 0, playerPosition = 1, samePointPlayersInARow = 0;
	for (const player of positions) {
		if (playerCount === maxPosition) break;
		if (prevPoints === player.points && playerCount > 0) samePointPlayersInARow++;
		else samePointPlayersInARow = 0;
		prevPoints = player.points;
		embed.addFields({ name: `#${playerPosition - samePointPlayersInARow}`, value: `<@${player.id}> with ${player.points} points` });
		if (player.id === interaction.user.id) {
			foundMyself = true;
		}
		playerCount++;
		playerPosition++;
	}

	// Ephemeral messages only allowed in replies and follow ups i believe
	// also ephemeral leaderboards are only when someone clicks a button so it will output their position if they are in the game but not in the top how every many positions the leaderboard shows
	if (ephemeralBoolean) {
		if (!foundMyself && game.players.has(interaction.user.id)) {
			console.log(positions);
			embed.addFields({ name: `#${positions.findIndex(pos => pos.id === interaction.user.id) + 1}`, value: `<@${interaction.user.id}> with ${game.players.get(interaction.user.id).points}` });
		}
		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	// Assume that the interaction has already been replied to here so safe to just send to channel
	await interaction.channel.send({
		embeds: [embed],
	});
}

async function teamLeaderboardOutput(game, interaction, ephemeralBoolean) {
	// TODO, finish outputting leaderboard for teams
	const embed = new EmbedBuilder()
		.setTitle(`Top ${game.options.teamAmount} leaderboard`);

	const positions = [];
	for (const team of game.teams.keys()) {
		positions.push({ team: team, points: game.teams.get(team)[0] });
	}
	positions.sort((a, b) => b.points - a.points);
	let prevPoints = null, samePointTeamsInARow = 0, teamPosition = 1;
	for (const team of positions) {
		if (prevPoints === team.points) samePointTeamsInARow++;
		else samePointTeamsInARow = 0;

		const teamArray = game.teams.get(team.team);
		prevPoints = team.points;
		embed.addFields({ name: `#${teamPosition - samePointTeamsInARow}`, value: `${team.team}: ${team.points} points\nMembers: <@${teamArray.slice(1).join('>, <@')}>` });
		teamPosition++;
	}

	if (ephemeralBoolean) {
		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	// Assume that the interaction has already been replied to here so safe to just send to channel
	await interaction.channel.send({
		embeds: [embed],
	});
}
