/*
// MADE GOOD PROGRESS SO FAR
// 	TO-DO
// 		FIX LEADERBOARD ISSUE (HAVE IT SKIP POSITIONS IF TIED EXAMPLE BELOW)
//			1 ARC: 2 POINTS
//  		1 DIL: 2 POINTS
// 			3 DAN: 1 POINTS  // THIS ONE HERE IS THE KEY IT WOULD BE POSITION 2 WITH THE WAY IM DOING THINGS RN
//		this should be done but test is required to check

//		HANDLE ALL API CODES
//			CODE 0 SUCCESS (LEAVE ALONE ALL G)
//			CODE 1 NOT ENOUGH QUESTIONS FOR QUERY
//			CODE 2 INVALID PARAMETER
//			CODE 3 TOKEN NOT FOUND
//			CODE 4 TOKEN EMPTY
//			CODE 5 RATE LIMIT
*/

import { MessageFlags } from 'discord.js';
import { currentGameChats } from '../util/reusableVars.js';
import { commandDefinition } from './helpers/commandHandling.js';
import { Game } from './helpers/gameClass.js';
import { runGame } from './helpers/runGame.js';


export const data = commandDefinition;

export { autocomplete } from './helpers/commandHandling.js';

export async function execute(interaction) {
	if (currentGameChats.find(id => id === interaction.channel.id)) {
		interaction.reply({
			content: 'Sorry there is a game currently going on in this chat! Please head over to another text chat or thread to start a game.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	await interaction.deferReply();
	const game = new Game(interaction);
	Promise.race([
		runGame(game),
		new Promise(res => {
			game.emitter.once('endQuiz', () => {
				game.interaction.channel.send('This quiz has been prematurely ended! <:sab:1401562453992538172>');
				res();
			});
		}),
	]);

}