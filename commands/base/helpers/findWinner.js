import { MAX_PLAYERS } from '../../util/constants.js';
import { leaderboardOutput } from './showLeaderboard.js';

export async function findWinner(interaction, players) {
	// can be multiple winners as long as they all have the same amount of points
	const winnerPoints = Math.max(...Array.from(players.values(), player => player.points));

	if (winnerPoints === 0) {
		await interaction.channel.send('## No one won <:sab:1401562453992538172>. Nobody scored any points so there are no winners for this game :(');
		return;
	}

	const winners = [];
	for (const [id, playerData] of players.entries()) {
		if (playerData.points === winnerPoints) {
			winners.push(id);
		}
	}

	await interaction.channel.send(`## <@${winners.join('>, <@')}> won the game! <a:yahoo:1405055893061632122>`);

	const ephemeral = false;
	await leaderboardOutput(players, MAX_PLAYERS, interaction, ephemeral);
}