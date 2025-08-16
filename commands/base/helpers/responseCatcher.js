import { MessageFlags, ComponentType, ButtonStyle } from 'discord.js';
import { DifficultyMultiplier, roundWait } from '../../util/constants.js';
import { emitter } from '../../util/reusableVars.js';
import { disableButton } from './disableButton.js';

export async function responseHandler(interaction, players, message) {
	const responseFilter = async (buttonInteraction) => {
		if (!players.has(buttonInteraction.user.id)) {
			await buttonInteraction.reply({
				content: 'You can\'t answer since you are not in the game!',
				flags: MessageFlags.Ephemeral,
			});
			return false;
		}
		if (players.get(buttonInteraction.user.id).answer) {
			await buttonInteraction.reply({
				content: 'You have already chosen an answer this round!',
				flags: MessageFlags.Ephemeral,
			});
			return false;
		}
		return true;
	};
	// used to find the real answer
	const answerCollector = message.createMessageComponentCollector({
		filter: responseFilter,
		componentType: ComponentType.Button,
		time: roundWait,
	});

	answerCollector.on('collect', async (buttonInteraction) => {
		// get the button the user chose and set the button object as their answer for record keeping
		const chosenButton = await buttonInteraction.message.components[0].components.find(btn => btn.data.custom_id === buttonInteraction.customId);
		players.get(buttonInteraction.user.id).answer = chosenButton;
		if (buttonInteraction.customId === 'correct') {
			disableButton(message, ButtonStyle.Success);
			await buttonInteraction.reply(`### ${buttonInteraction.user} got the correct answer!`);
			players.get(buttonInteraction.user.id).points += 1 * DifficultyMultiplier[message.embeds[0].fields.find(field => field.name === 'Difficulty').value];
			await emitter.emit('correctAnswer');
		}
		else {
			await buttonInteraction.reply({
				content: 'You have chosen the wrong answer <:sab:1401562453992538172>',
				flags: MessageFlags.Ephemeral,
			});
			// check if everyone has already answered if so move on from this round
			if (Array.from(players.values()).every(player => player.answer !== null && player.answer !== undefined)) {
				disableButton(message, ButtonStyle.Danger);
				await interaction.channel.send('### Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
				await emitter.emit('allAnswered');
			}
		}
	});
}