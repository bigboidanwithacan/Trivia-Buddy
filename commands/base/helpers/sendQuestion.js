import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { capitalizeFirstLetter } from '../../util/capitalize.js';
import { decode } from 'html-entities';
import { roundWait } from '../../util/constants.js';

export async function sendQuestion(interaction, singleQuestion, questionCounter) {
	const { type, difficulty, category, question, correct_answer, incorrect_answers } = singleQuestion;
	const embed = new EmbedBuilder()
		.setTitle(`Question ${questionCounter}`)
		.setFooter({ text: 'Questions from the open trivia database', iconURL: 'https://opentdb.com/images/logo.png' })
		.setImage('https://opentdb.com/images/logo.png')
		.setColor(0xa6aeb8)
		.addFields(
			{ name:'Type', 			value: decode(type), 		inline: true },
			{ name:'Difficulty', 	value: decode(difficulty), 	inline: true },
			{ name:'Category', 	value: decode(category), 	inline: true },
			{ name:'Question', 	value: decode(question) },
		);

	const buttonArray = [];
	const ansButtonLabelArray = [];
	const answerArray = [];
	const corAnsIndex = Math.floor(Math.random() * (incorrect_answers.length + 1));
	if (type === 'multiple') {
		ansButtonLabelArray.push('A');
		ansButtonLabelArray.push('B');
		ansButtonLabelArray.push('C');
		ansButtonLabelArray.push('D');
	}
	else {
		ansButtonLabelArray.push('True');
		ansButtonLabelArray.push('False');
	}

	const correctButton = new ButtonBuilder()
		.setCustomId('correct')
		.setLabel((type === 'multiple') ? ansButtonLabelArray[corAnsIndex] : capitalizeFirstLetter(correct_answer))
		.setStyle(ButtonStyle.Primary);

	let indexCounter = 0;
	for (const choice of ansButtonLabelArray) {
		if (choice === correctButton.data.label) {
			buttonArray.push(correctButton);
			if (type === 'multiple') {
				answerArray.push(`${decode(correct_answer)}`);
			}
			continue;
		}
		const wrongButton = new ButtonBuilder()
			.setCustomId(`wrong${indexCounter}`)
			.setLabel(choice)
			.setStyle(ButtonStyle.Primary);

		buttonArray.push(wrongButton);
		if (type === 'multiple') {
			answerArray.push(`${decode(incorrect_answers[indexCounter])}`);
		}
		indexCounter++;
	}
	indexCounter = 0;
	const row = new ActionRowBuilder();
	for (const answer of buttonArray) {
		row.addComponents(answer);
		if (type === 'multiple') {
			embed.addFields({ name: ansButtonLabelArray[indexCounter], value: `${answerArray[indexCounter]}` });
			indexCounter++;
		}
	}

	// add buttons for answers and link it to this message
	const now = Date.now();
	const endRound = Math.round((now + roundWait) / 1_000);
	const message = await interaction.channel.send({ content: `<t:${endRound}:R> seconds the round is over`, embeds: [embed], components: [row] });

	return message;
}