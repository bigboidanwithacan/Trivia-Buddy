import { MAX_PLAYERS } from '../../util/constants.js';
import { leaderboardOutput } from './showLeaderboard.js';

export async function findWinner(game) {
	// can be multiple winners as long as they all have the same amount of points
	const winnerPoints = (!game.options.teams) ?
		Math.max(...Array.from(game.players.values(), player => player.points)) :
		Math.max(...Array.from(game.teams.values(), teamArr => teamArr[0]));

	if (winnerPoints === 0) {
		await game.interaction.channel.send('## No one won <:sab:1401562453992538172>. Nobody scored any points so there are no winners for this game :(');
		return;
	}

	const winners = [];

	if (!game.options.teams) {
		for (const [id, playerData] of game.players.entries()) {
			if (playerData.points === winnerPoints) {
				winners.push(id);
			}
		}
		await game.interaction.channel.send(`## <@${winners.join('>, <@')}> won the game! <a:yahoo:1405055893061632122>`);
	}
	else {
		for (const [teamName, teamArr] of game.teams.entries()) {
			if (teamArr[0] === winnerPoints) {
				winners.push(teamName);
			}
		}
		await game.interaction.channel.send(`## ${winners.join(', ')} won the game! <a:yahoo:1405055893061632122>`);
	}

	const ephemeral = false;
	await leaderboardOutput(game, MAX_PLAYERS, game.interaction, ephemeral);
}
