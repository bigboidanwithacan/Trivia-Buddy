import { MessageFlags, ButtonStyle } from 'discord.js';
import { currentGameChats, wait } from '../../util/reusableVars.js';
import { extractOptions } from './handleCommand.js';
import { once } from 'events';
import { START_WAIT, ROUND_WAIT, ROUND_BUFFER, SMALL_DELAY, REGULAR_DELAY } from './../../util/constants.js';
import { showLeaderboard } from './showLeaderboard.js';
import { disableButton } from './disableButton.js';
import { showMessageTimer } from './showMessageTimer.js';
import { sendQuestion } from './sendQuestion.js';
import { APICall } from './apiCall.js';
import { joinGame } from './joinGame.js';
import { responseHandler } from './responseHandling.js';
import { findWinner } from './findWinner.js';
import { logger } from '../../../utility/logger.js';

export async function runGame(game) {
	currentGameChats.push(game.interaction.channel.id);

	try {
		// when adding options add variables to pass into the APICall() function
		const { query, endGameOnPoints } = await extractOptions(game.interaction, game);
		if (endGameOnPoints === true) {
		// the game should now go to max points not till the last question
		// TO-DO
		}
		const results = await APICall(game.interaction, query);
		if (results === null || results === undefined) {
			game.interaction.editReply({
				content: 'Sorry we could not fetch questions at this time from [Open Trivia Database](https://opentdb.com/!)',
			});
			currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
			return;
		}
		await joinGame(game.interaction, game);

		await Promise.race([
			new Promise(res => {
				setTimeout(() => {
					res();
				}, START_WAIT + 500);
			}),
			once(game.emitter, 'startQuiz'),
			once(game.emitter, 'endQuiz'),
		]);

		let questionCounter = 1;
		game.quizStart = true;
		// for loop below will be the whole of the quiz, each loop will be a question
		for (const singleQuestion of results) {
			await game.waitWhilePaused();
			if (game.quizEnd) break;
			// First create the message to send to user with the questions and answer choices
			// then handle the responses of the users to the questions
			const message = await sendQuestion(game.interaction, singleQuestion, questionCounter);
			await responseHandler(game, game.interaction, game.players, message);

			// wait here until either a user answers something right or until the timer runs out
			let timer = null;
			await Promise.race([
				once(game.emitter, 'correctAnswer'),
				new Promise(res => timer = setTimeout(async () => {
				// announce no one got the question right, and then make correct answer button red
					disableButton(message, ButtonStyle.Danger);
					await game.interaction.channel.send('### Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
					res();
				}, ROUND_WAIT)),
				once(game.emitter, 'allAnswered'),
				once(game.emitter, 'endQuiz'),
			]);
			await clearTimeout(timer);
			game.cleanEmitter();

			if (results.length === questionCounter || game.foundWinner === true || (game.options.maxPoints !== null && findTopScore(game) >= game.options.maxPoints)) {
				await wait(SMALL_DELAY / 2);
				await game.interaction.channel.send('# Game over!');
				await wait(SMALL_DELAY / 2);
				const winnerMessage = await game.interaction.channel.send('### And the winner is...');
				await wait(REGULAR_DELAY);
				winnerMessage.delete();
				break;
			}
			questionCounter++;
			for (const player of game.players.values()) {
				player.answer = null;
			}
			await wait (SMALL_DELAY);
			await showMessageTimer(game.interaction, (ROUND_BUFFER - 1_000), `## Time until round ${questionCounter} starts`);
			await showLeaderboard(game.interaction, game.players);
			game.emitter.removeAllListeners('endQuiz');
		}
		await findWinner(game.interaction, game.players);
		game.commandCollector.stop('gameEnd');
		game.quizEnd = true;
		game.cleanEmitter();
		currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
	}
	catch (error) {
		game.interaction.followUp({
			content: 'Sorry we had trouble running this command!',
			flags: MessageFlags.Ephemeral,
		});
		logger.error(error);
		console.error(error);
		currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
		return;
	}
}

function findTopScore(game) {
	const positions = [];
	for (const player of game.players.keys()) {
		positions.push({ id: player, points: game.players.get(player).points });
	}
	positions.sort((a, b) => b.points - a.points);
	return positions[0].points;
}