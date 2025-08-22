import { BIG_DELAY } from '../../util/constants.js';
import { currentGameChats, wait } from '../../util/reusableVars.js';

export async function APICall(game, query) {
	const apiUrl = `https://opentdb.com/api.php?${query}`;
	const response = await fetch(apiUrl).catch(error => {
		console.error(error);
		game.interaction.reply('Sorry there was a problem fetching the questions! Please try again at a later date or try some of our other quiz options!');
		return null;
	});
	const json = await response.json();

	if (json.response_code === 1) {
		return 'err1';
	}
	if (json.response_code === 2) {
		return 'err2';
	}
	if (json.response_code === 3) {
		// delete current session token and fetch a new one from openTDB
		currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
		game.getSessionToken();
		await wait(BIG_DELAY);
		const results = await APICall(game.interaction, query);
		return results;
	}
	if (json.response_code === 4) {
		await fetch(`https://opentdb.com/api_token.php?command=reset&token=${game.getSessionToken(game.interaction.channel.id)}`);
		const tempQuery = trimQuery(query);
		await wait(BIG_DELAY);
		const results = await APICall(game.interaction, tempQuery);
		return results;
	}
	if (json.response_code == 5) {
		return 'err5';
	}

	const { results } = json;

	return results;
}

function trimQuery(query) {
	return query.slice(0, query.indexOf('&token'));
}