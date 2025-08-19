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

import { MessageFlags } from 'discord.js';
import { currentGameChats } from '../util/reusableVars.js';
import { commandDefinition } from './helpers/handleCommand.js';
import { Game } from './helpers/gameClass.js';
import { runGame } from './helpers/runGame.js';
// import { once } from 'events';


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
	Promise.race([
		runGame(game),
		new Promise(res => {
			game.emitter.once('endQuiz', () => {
				game.interaction.channel.send('This quiz has been prematurely ended! <:sab:1401562453992538172>');
				res();
			});
		}),
	]);

	if (game.quizEnd) {
		return;
	}


}