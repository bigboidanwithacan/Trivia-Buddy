import { MessageFlags, ButtonStyle } from 'discord.js';
import { currentGameChats, wait } from '../../util/reusableVars.js';
import { extractOptions } from './commandHandling.js';
import { once } from 'events';
import { START_WAIT, ROUND_WAIT, ROUND_BUFFER, SMALL_DELAY, REGULAR_DELAY, categoryToId, API_ERROR_MESSAGE } from './../../util/constants.js';
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
		const { query } = await extractOptions(game.interaction, game);
		const category = await categoryToId;
		if (game.options.category !== null && !category.find(c => c.category === game.options.category)) {
			game.interaction.editReply('Invalid category selected. Please choose from the provided options.');
			currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
			game.emitter.removeAllListeners('endQuiz');
			return;
		}
		const results = await APICall(game, query);
		if (typeof results === 'string') {
			const message = await API_ERROR_MESSAGE;
			game.interaction.editReply(message.find(err => err.name === results).message);
			currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
			game.emitter.removeAllListeners('endQuiz');
			return;
		}
		if (results === null || results === undefined) {
			game.interaction.editReply({
				content: 'Sorry we could not fetch questions at this time from [Open Trivia Database](https://opentdb.com/!)',
			});
			currentGameChats.splice(currentGameChats.indexOf(game.interaction.channel.id), 1);
			game.emitter.removeAllListeners('endQuiz');
			return;
		}
		await joinGame(game.interaction, game);

		const controller = new AbortController();
		await Promise.race([
			new Promise(res => {
				setTimeout(() => {
					res();
				}, START_WAIT + SMALL_DELAY);
			}),
			once(game.emitter, 'startQuiz', { signal: controller.signal }),
			once(game.emitter, 'endQuiz', { signal: controller.signal }),
		]);

		await controller.abort();

		let questionCounter = 1;
		game.quizStart = true;
		// for loop below will be the whole of the quiz, each loop will be a question
		for (const singleQuestion of results) {
			await game.waitWhilePaused();
			if (game.quizEnd) break;
			const roundController = new AbortController();
			// First create the message to send to user with the questions and answer choices
			// then handle the responses of the users to the questions
			game.setCurrentQuestion(singleQuestion);
			const message = await sendQuestion(game, questionCounter);
			await responseHandler(game, message);

			// wait here until either a user answers correctly, until the timer runs out, or everyone gets the answer wrong
			let timer = null;
			await Promise.race([
				once(game.emitter, 'correctAnswer', { signal: roundController.signal }),
				new Promise(res => timer = setTimeout(async () => {
				// announce no one got the question right, and then make correct answer button red
					disableButton(message, ButtonStyle.Danger);
					await game.interaction.channel.send('### Times up! Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
					res();
				}, ROUND_WAIT)),
				once(game.emitter, 'allAnswered', { signal: roundController.signal }),
				new Promise(res => {
					if (game.quizEnd) {
						res();
					}
				}),
			]);
			await clearTimeout(timer);

			if (results.length === questionCounter || game.quizEnd || (game.options.maxPoints !== null && findTopScore(game) >= game.options.maxPoints)) {
				await wait(SMALL_DELAY);
				await game.interaction.channel.send('# Game over!');
				await wait(SMALL_DELAY);
				const winnerMessage = await game.interaction.channel.send('### And the winner is...');
				await wait(REGULAR_DELAY - SMALL_DELAY);
				winnerMessage.delete();
				break;
			}
			questionCounter++;
			for (const player of game.players.values()) {
				player.answer = null;
			}
			await wait (SMALL_DELAY);
			await showMessageTimer(game.interaction, (ROUND_BUFFER - SMALL_DELAY), `## Time until round ${questionCounter} starts`);
			await showLeaderboard(game);
			await roundController.abort();
		}
		await wait(SMALL_DELAY);
		await findWinner(game.interaction, game.players);
		game.commandCollector.stop('The game has ended');
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