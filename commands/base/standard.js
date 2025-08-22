/*
// MADE GOOD PROGRESS SO FAR
// 	TO-DO
//		GO THROUGH ALL FILES AND SEE IF ANY CHANGES CAN BE MADE USING THE GAME CLASS INSTANCE I CALL IN THIS FILE
//			FOR EXAMPLE PASSING THE GAME INSTANCE TO A FUNCTION CALL TO MAKE SOMETHING EASIER

//		CHECK TO SEE IF MORE OR LESS DELAYS ARE NEEDED IN ALL PARTS OF THE GAME INDIVIDUALLY
*/

import { MessageFlags } from 'discord.js';
import { currentGameChats } from '../util/reusableVars.js';
import { commandDefinition } from './helpers/handleCommand.js';
import { Game } from './helpers/gameClass.js';
import { runGame } from './helpers/runGame.js';


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