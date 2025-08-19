/*
// MADE GOOD PROGRESS SO FAR
// 	TO-DO
// 		ADD OPTIONS TO QUIZZES
//			ASIDE FROM THE API OPTIONS, ALSO HAVE A FIRST TO HOW EVER MANY POINTS OPTION
// 		PAUSE GAME
//			IN CONJUNCTION WITH EXIT GAME DUE TO USE OF SPECIAL CHARACTER COMMAND(i.e !pause, !exit)

//		END GAME PREMATURELY
//			IN CONJUNCTION WITH PAUSE GAME DUE TO USE OF SPECIAL CHARACTER COMMAND(i.e !pause, !exit)

//		MAKE SOME OF THE MESSAGES DISPLAY COMPONENTS OR EMBEDS (optional)
//			FOR EXAMPLE THE WINNER TEXT CAN BE A DISPLAY COMPONENT THAT HAS MARKDOWN TO MAKE IT LARGE OR SOMETHING LIKE THAT
*/

import { ButtonStyle, MessageFlags } from 'discord.js';
import { wait, currentGameChats } from '../util/reusableVars.js';
import { once } from 'events';
import { START_WAIT, ROUND_WAIT, ROUND_BUFFER, SMALL_DELAY, REGULAR_DELAY } from './../util/constants.js';
import { showLeaderboard } from './helpers/showLeaderboard.js';
import { disableButton } from './helpers/disableButton.js';
import { showMessageTimer } from './helpers/showMessageTimer.js';
import { sendQuestion } from './helpers/sendQuestion.js';
import { APICall } from './helpers/apiCall.js';
import { joinGame } from './helpers/joinGame.js';
import { responseHandler } from './helpers/responseHandling.js';
import { findWinner } from './helpers/findWinner.js';
import { commandDefinition, extractOptions } from './helpers/handleCommand.js';
import { Game } from './helpers/gameClass.js';

export const data = commandDefinition;

export { autocomplete } from './helpers/handleCommand.js';

export async function execute(interaction) {
	if (currentGameChats.find(id => id === interaction.channel.id)) {
		interaction.reply({
			content: 'Sorry there is a game currently going on in this chat! Please head over to another text chat or thread to start a game.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	await interaction.deferReply();
	// TO-DO
	// from this and below call runGame.js function and encapsulate the code below into that function
	// then i can have a promise race between the function in runGame.js finishing first or an event listener that listens for the 'endQuiz' event
	const game = new Game(interaction);
	currentGameChats.push(interaction.channel.id);

	try {
		// when adding options add variables to pass into the APICall() function
		game.emitter.once('endQuiz', () => {
			interaction.channel.send('This quiz has been prematurely ended! <:sab:1401562453992538172>');
			return;
		});
		const { query, endGameOnPoints } = await extractOptions(interaction, game);
		if (endGameOnPoints === true) {
		// the game should now go to max points not till the last question
		// TO-DO
		}
		const results = await APICall(interaction, query);
		if (results === null || results === undefined) {
			interaction.editReply({
				content: 'Sorry we could not fetch questions at this time from [Open Trivia Database](https://opentdb.com/!)',
			});
			currentGameChats.splice(currentGameChats.indexOf(interaction.channel.id), 1);
			return;
		}
		const players = await joinGame(interaction, game);

		await Promise.race([
			new Promise(res => {
				setTimeout(() => {
					res();
				}, START_WAIT + 500);
			}),
			once(game.emitter, 'startQuiz'),
		]);

		let questionCounter = 1;
		game.quizStart = true;
		// for loop below will be the whole of the quiz, each loop will be a question
		for (const singleQuestion of results) {
		// First create the message to send to user with the questions and answer choices
		// then handle the responses of the users to the questions
			const message = await sendQuestion(interaction, singleQuestion, questionCounter);
			await responseHandler(game, interaction, players, message);

			// wait here until either a user answers something right or until the timer runs out
			let timer = null;
			await Promise.race([
				once(game.emitter, 'correctAnswer'),
				new Promise(res => timer = setTimeout(async () => {
				// announce no one got the question right, and then make correct answer button red
					disableButton(message, ButtonStyle.Danger);
					await interaction.channel.send('### Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
					res();
				}, ROUND_WAIT)),
				once(game.emitter, 'allAnswered'),
			]);
			await clearTimeout(timer);
			game.cleanEmitter();

			if (results.length === questionCounter || game.foundWinner === true) {
				await wait(SMALL_DELAY / 2);
				await interaction.channel.send('# Game over!');
				await wait(SMALL_DELAY / 2);
				const winnerMessage = await interaction.channel.send('### And the winner is...');
				await wait(REGULAR_DELAY);
				winnerMessage.delete();
				break;
			}
			questionCounter++;
			for (const player of players.values()) {
				player.answer = null;
			}
			await wait (SMALL_DELAY);
			await showMessageTimer(interaction, (ROUND_BUFFER - 1_000), `## Time until round ${questionCounter} starts`);
			await showLeaderboard(interaction, players);

		}


		await findWinner(interaction, players);
		game.commandCollector.stop('gameEnd');
		game.quizEnd = true;
		game.cleanEmitter();
		currentGameChats.splice(currentGameChats.indexOf(interaction.channel.id), 1);
	}
	catch (error) {
		interaction.followUp({
			content: 'Sorry we had trouble running this command!',
			flags: MessageFlags.Ephemeral,
		});
		console.error(error);
		currentGameChats.splice(currentGameChats.indexOf(interaction.channel.id), 1);
		return;
	}
}