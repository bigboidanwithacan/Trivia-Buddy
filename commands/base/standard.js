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