import { leaderboardOutput } from './showLeaderboard.js';

export async function findWinner(interaction, players) {
	// can be multiple winners as long as they all have the same amount of points
	const winnerPoints = Math.max(...Array.from(players.values(), player => player.points));
	const winners = [];
	for (const [id, playerData] of players.entries()) {
		if (playerData.points === winnerPoints) {
			winners.push(id);
		}
	}

	if (winnerPoints === 0) {
		await interaction.channel.send('## No one won <:sab:1401562453992538172>. Nobody scored any points so there are no winners for this game :(');
	}
	else {
		await interaction.channel.send(`## <@${winners.join('>, <@')}> won the game! <a:yahoo:1405055893061632122>`);
	}

	await leaderboardOutput(players, 8, interaction, false);
}