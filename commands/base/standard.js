import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';
// import { Chalk } from './../../utility/logger.js';
// const logChalk = new Chalk();
import timers from 'node:timers/promises';
const wait = timers.setTimeout;
import { decode } from 'html-entities';

export const data = new SlashCommandBuilder()
	.setName('standard')
	.setDescription('The standard trivia game. Can choose your own options.');

export async function execute(interaction) {
	await interaction.deferReply();
	const apiUrl = 'https://opentdb.com/api.php?amount=2';
	const response = await fetch(apiUrl);
	const json = await response.json();

	const { results } = json;

	// TO-DO add a join game button that lets any user in the server aside from the trivia initiator to join the quiz
	await interaction.editReply({ content: 'Click the button below to join the game if you are not the current host!' });

	const joinButton = new ButtonBuilder()
		.setCustomId('join')
		.setLabel('Join The Game!')
		.setEmoji('👉')
		.setStyle(ButtonStyle.Success);

	const joinRow = new ActionRowBuilder()
		.addComponents(joinButton);

	// TO-DO add a join game button that lets any user in the server aside from the trivia initiator to join the quiz
	// add a collector to validate results
	const now = Date.now();
	const start = Math.round((now + 30_000) / 1_000);

	await interaction.editReply(`${interaction.user} has just initiated a trivia game! Follow the step below to join. Countdown till the trivia game starts <t:${start}:R>`);
	setTimeout(async () => await interaction.deleteReply(), 30_000);

	const joinMessage = await interaction.channel.send({
		content: 'Click the button below to join the game if you are not the current host!',
		components: [joinRow],
	});

	const players = [interaction.user.id];
	const joinedMessages = [
		'You\'re all set! 🎉 No need to click \'Join\' again — you\'re already in the game and ready to roll!',
		'You\'re in! 🕹️ No need to hit \'Join\' again — just sit tight, the game\'s about to begin!',
		'Already joined — we\'re just as excited as you are! 😄',
		'Hold tight! You\'ve already joined the game. One click is all it takes! 🚀',
		'Easy does it! You\'re already part of the game. Let the fun begin! 🎮',
		'Double join? You\'re eager — we love that! But one join is all you need. 😄',
	];
	const joinFilter = async (buttonInteraction) => {
		if (!(players.includes(buttonInteraction.user.id))) {
			return true;
		}
		await buttonInteraction.reply({
			content: joinedMessages[Math.round(Math.random() * joinedMessages.length)],
			flags: MessageFlags.Ephemeral,
		});
		return false;
	};

	const joinButtonCollector = joinMessage.createMessageComponentCollector({
		filter: joinFilter,
		componentType: ComponentType.Button,
		time: 30_000,
	});

	joinButtonCollector.on('collect', async (buttonInteraction) => {
		players.push(buttonInteraction.user.id);
		await buttonInteraction.reply({
			content: 'You have joined the game!',
			flags: MessageFlags.Ephemeral,
		});
	});

	joinButtonCollector.on('end', async () => {
		const message = await interaction.channel.send('Game is starting!');
		setTimeout(() => message.delete(), 5_000);
	});

	await wait(30_500);
	let questionCounter = 1;

	// for loop below will be the whole of the quiz, each loop will be a question
	for (const singleQuestion of results) {
		const { type, difficulty, category, question, correct_answer, incorrect_answers } = singleQuestion;
		const embed = new EmbedBuilder()
			.setTitle(`Question ${questionCounter}`)
			.setFooter({ text: 'Questions from the open trivia database', iconURL: 'https://opentdb.com/images/logo.png' })
			.setImage('https://opentdb.com/images/logo.png')
			.setColor(0xa6aeb8)
			.addFields(
				{ name:'Type', value: type, inline: true },
				{ name: 'Difficulty', value: difficulty, inline: true },
				{ name: 'Category', value: category, inline: true },
				{ name: 'Question', value: decode(question) },
			);

		const correctButton = new ButtonBuilder()
			.setCustomId('correct')
			.setLabel(correct_answer)
			.setStyle(ButtonStyle.Primary);

		const buttonArray = [];
		const corAnsIndex = Math.floor(Math.random() * incorrect_answers.length) + 1;
		let indexCounter = 1;
		for (const answer of incorrect_answers) {
			if (indexCounter === corAnsIndex) {
				buttonArray.push(correctButton);
			}
			const wrongButton = new ButtonBuilder()
				.setCustomId(`wrong${indexCounter}`)
				.setLabel(answer)
				.setStyle(ButtonStyle.Primary);

			buttonArray.push(wrongButton);
			indexCounter++;
		}

		const row = new ActionRowBuilder();
		for (const answer of buttonArray) {
			row.addComponents(answer);
		}

		// add buttons for answers and link it to this message
		const message = await interaction.channel.send({ embeds: [embed], components: [row] });
		questionCounter++;
		// let answerFound = false;
		const rightAnswerFilter = async (buttonInteraction) => {

			const gaveAnswerBefore = (id) => id === buttonInteraction.user.id;

			if (players.some(gaveAnswerBefore)) {
				await interaction.channel.send({
					content: 'You have already chosen an answer!',
					flags: MessageFlags.Ephemeral,
				});
			}
			// something to collect the right answer

		};
		// used to find the real answer
		const answerCollector = message.createMessageComponentCollector({
			filter: rightAnswerFilter,
			componentType: ComponentType.Button,
			time: 20_000,
		});

		answerCollector.on('collect', buttonInteraction => {
			// do something on right answer being chosen, code below just for eslint
			buttonInteraction.user.id;
		});
	}


}