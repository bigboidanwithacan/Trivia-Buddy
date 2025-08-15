/*
// MADE GOOD PROGRESS SO FAR
// 	TO-DO
// 		ADD OPTIONS TO QUIZZES
//		MAKE CODE MORE MODULAR AND NOT JUST A BIG SPAGHETTI MESS
// 		PAUSE GAME
//			IN CONJUNCTION WITH EXIT GAME DUE TO USE OF SPECIAL CHARACTER COMMAND(i.e !pause, !exit)

//		END GAME PREMATURELY
//			IN CONJUNCTION WITH PAUSE GAME DUE TO USE OF SPECIAL CHARACTER COMMAND(i.e !pause, !exit)

//		USE SESSION TOKENS TO NOT REUSE QUESTION ON ACCIDENT
//			SHOULD BE DELETED OR RESET AFTER 6 HOURS
//			FILE USED TO STORE IT SHOULD BE DELETED AT THE END OF THE PROCESS (SIGINT, EXIT, SIGTERM)

//		MAKE SOME OF THE MESSAGES DISPLAY COMPONENTS OR EMBEDS (optional)
//			FOR EXAMPLE THE WINNER TEXT CAN BE A DISPLAY COMPONENT THAT HAS MARKDOWN TO MAKE IT LARGE OR SOMETHING LIKE THAT
*/

import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';
import { wait, capitalizeFirstLetter } from '../util/reusable.js';
import { decode } from 'html-entities';
import { once, EventEmitter } from 'events';
import { DifficultyMultiplier } from './../util/constants.js';


export const data = new SlashCommandBuilder()
	.setName('standard')
	.setDescription('The standard trivia game. Can choose your own options.');

export async function execute(interaction) {
	await interaction.deferReply();
	const apiUrl = 'https://opentdb.com/api.php?amount=2';
	const response = await fetch(apiUrl).catch(error => {
		console.error(error);
		interaction.reply('Sorry there was a problem fetching the questions! Please try again at a later date or try some of our other quiz options!');
		return;
	});
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
	let now = Date.now();
	const start = Math.floor((now + 30_000) / 1_000);
	await interaction.editReply(`${interaction.user} has just initiated a trivia game! Follow the step below to join. Countdown till the trivia game starts <t:${start}:R>`);
	setTimeout(async () => await interaction.deleteReply(), 30_000);

	const joinMessage = await interaction.channel.send({
		content: 'Click the button below to join the game if you are not the current host!',
		components: [joinRow],
	});

	// this will be used to keep track of everything that a player needs to have
	const players = new Map();
	players.set(interaction.user.id, { points: 0, answer: null });

	const joinedMessages = [
		'You\'re all set! 🎉 No need to click \'Join\' again — you\'re already in the game and ready to roll!',
		'You\'re in! 🕹️ No need to hit \'Join\' again — just sit tight, the game\'s about to begin!',
		'Already joined — we\'re just as excited as you are! 😄',
		'Hold tight! You\'ve already joined the game. One click is all it takes! 🚀',
		'Easy does it! You\'re already part of the game. Let the fun begin! 🎮',
		'Double join? You\'re eager — we love that! But one join is all you need. 😄',
	];
	const joinFilter = async (buttonInteraction) => {
		if (!(players.has(buttonInteraction.user.id))) {
			return true;
		}
		await buttonInteraction.reply({
			content: joinedMessages[Math.floor(Math.random() * joinedMessages.length)],
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
		players.set(buttonInteraction.user.id, { points: 0, answer: null });
		await buttonInteraction.reply({
			content: 'You have joined the game!',
			flags: MessageFlags.Ephemeral,
		});
	});

	joinButtonCollector.on('end', async () => { // uncomment
		// const message = await interaction.channel.send('Game is starting!');
		// setTimeout(() => message.delete(), 5_000);
	});

	await wait(1000); // 30_500
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
					answerArray.push(`${choice}. ${decode(correct_answer)}`);
				}
				continue;
			}
			const wrongButton = new ButtonBuilder()
				.setCustomId(`wrong${indexCounter}`)
				.setLabel(choice)
				.setStyle(ButtonStyle.Primary);

			buttonArray.push(wrongButton);
			if (type === 'multiple') {
				answerArray.push(`${choice}. ${decode(incorrect_answers[indexCounter])}`);
			}
			indexCounter++;
		}
		indexCounter = 0;
		const row = new ActionRowBuilder();
		for (const answer of buttonArray) {
			row.addComponents(answer);
			if (type === 'multiple') {
				embed.addFields({ name: ansButtonLabelArray[indexCounter], value: `## ${answerArray[indexCounter]}` });
				indexCounter++;
			}
		}

		console.log('Incorrect answers: ', incorrect_answers);
		// add buttons for answers and link it to this message
		now = Date.now();
		const endRound = Math.round((now + 20_000) / 1_000);
		const message = await interaction.channel.send({ content: `<t:${endRound}:R> seconds the round is over`, embeds: [embed], components: [row] });

		// used later to wait for completion of rounds
		const emitter = new EventEmitter();

		const rightAnswerFilter = async (buttonInteraction) => {
			if (!players.has(buttonInteraction.user.id)) {
				await buttonInteraction.reply({
					content: 'You can\'t answer since you are not in the game!',
					flags: MessageFlags.Ephemeral,
				});
				return false;
			}
			if (players.get(buttonInteraction.user.id).answer) {
				await buttonInteraction.reply({
					content: 'You have already chosen an answer!',
					flags: MessageFlags.Ephemeral,
				});
				return false;
			}
			return true;
		};

		// used to find the real answer
		const answerCollector = message.createMessageComponentCollector({
			filter: rightAnswerFilter,
			componentType: ComponentType.Button,
			time: 20_000,
		});

		answerCollector.on('collect', async (buttonInteraction) => {
			const chosenButton = buttonInteraction.message.components[0].components.find(btn => btn.data.custom_id === buttonInteraction.customId);
			players.get(buttonInteraction.user.id).answer = chosenButton;
			if (buttonInteraction.customId === 'correct') {
				disableButton(message, ButtonStyle.Success, embed);
				await buttonInteraction.reply(`### ${buttonInteraction.user} got the correct answer!`);
				players.get(buttonInteraction.user.id).points += 1 * DifficultyMultiplier[difficulty];
				await emitter.emit('correctAnswer');
			}
			else {
				buttonInteraction.reply({
					content: 'You have chosen the wrong answer <:sab:1401562453992538172>',
					flags: MessageFlags.Ephemeral,
				});
				// check if everyone has already answered if so move on from this game
				if (Array.from(players.values()).every(player => player.answer !== null && player.answer !== undefined)) {
					disableButton(message, ButtonStyle.Danger, embed);
					await interaction.channel.send('Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
					emitter.emit('allAnswered');
				}
			}
		});
		// wait here until either a user answers something right or until the timer runs out
		let timer = null;
		await Promise.race([
			once(emitter, 'correctAnswer'),
			new Promise(res => timer = setTimeout(async () => {
				// announce no one got the question right, and then make correct answer button red
				disableButton(message, ButtonStyle.Danger, embed);
				await interaction.channel.send('Unfortunately no one correctly answered the question! <:despair:1405388111114014720>');
				res();
			}, 20_000)),
			once(emitter, 'allAnswered'),
		]);
		clearTimeout(timer);

		if (results.length === questionCounter) {

			await interaction.channel.send('# Game over!');
			const winnerMessage = await interaction.channel.send('And the winner is...');
			await wait(3_000);
			await winnerMessage.delete();
			break;
		}
		questionCounter++;
		for (const player of players.values()) {
			player.answer = null;
		}
		showMessageTimer(interaction, 13_000, `Time until round ${questionCounter} starts`);
		const leaderboardButton = new ButtonBuilder()
			.setCustomId('roundLeaderButton')
			.setLabel('Leaderboard')
			.setStyle(ButtonStyle.Secondary);

		const leaderRow = new ActionRowBuilder()
			.setComponents([leaderboardButton]);

		const leaderboardMessage = await interaction.channel.send({
			content: 'Click the button below to see the leaderboard and your place!',
			components: [leaderRow],
		});

		const leaderboardCollector = leaderboardMessage.createMessageComponentCollector({ time: 15_000, componentType: ComponentType.Button });

		leaderboardCollector.on('collect', async (buttonInteraction) => {
			// respond to this and make an ephemeral message with an embed that shows leaderboard
			await showLeaderboard(players, 3, buttonInteraction, true);
		});

		// if this time gets changed back to 10 seconds make sure to change the collector's and showMessageTimer() call as well (line 223 as of now) time as well
		await wait(1_000); // 15_000
		leaderboardMessage.delete();
	}

	// can be multiple winners as long as they all have the same amount of points
	const winnerPoints = Math.max(...Array.from(players.values(), player => player.points));

	if (winnerPoints === 0) {
		await interaction.channel.send('## No one won <:sab:1401562453992538172>. Nobody scored any points so there are no winners for this game :(');
		await showLeaderboard(players, 25, interaction, false);
		return;
	}

	const winners = [];
	for (const [id, playerData] of players.entries()) {
		if (playerData.points === winnerPoints) {
			winners.push(id);
		}
	}
	await interaction.channel.send(`## <@${winners.join('>, <@')}> won the game! <a:yahoo:1405055893061632122>`);
	await showLeaderboard(players, 25, interaction, false);
}

// make file for this later
function disableButton(message, buttonStyleCorrect, embed) {
	const newRow = new ActionRowBuilder();
	for (const button of message.components[0].components) {
		if (button.data.custom_id === 'correct') {
			const tempButton = new ButtonBuilder(button.toJSON())
				.setStyle(buttonStyleCorrect)
				.setDisabled(true);
			newRow.addComponents(tempButton);
			continue;
		}
		const tempButton = new ButtonBuilder(button.toJSON())
			.setDisabled(true);
		newRow.addComponents(tempButton);
	}
	message.edit({ content: ' ', embeds: [embed], components: [newRow] });
}

async function showMessageTimer(interaction, timeUntilCompletion, messageString) {
	const now = Date.now();
	const end = Math.floor((now + timeUntilCompletion) / 1_000);
	const message = await interaction.channel.send(`${messageString}: <t:${end}:R>`);
	setTimeout(async () => {
		await message.delete();
	}, timeUntilCompletion);

}

async function showLeaderboard(playersMap, maxPosition, interaction, ephemeralBoolean) {
	const maxPlayers = (maxPosition > playersMap.size) ? playersMap.size : maxPosition;
	const embed = new EmbedBuilder()
		.setTitle(`Top ${maxPlayers} leaderboard`);

	let playerCount = 0;
	const positions = [];
	for (const player of playersMap.keys()) {
		positions.push({ id: player, points: playersMap.get(player).points });
	}

	let foundMyself = false;
	positions.sort((a, b) => b.points - a.points);
	for (const player of positions) {
		if (playerCount === maxPosition) break;
		embed.addFields({ name: `#${playerCount + 1}`, value: `<@${player.id}> with ${player.points} points` });
		if (player.id === interaction.user.id) {
			foundMyself = true;
		}
		playerCount++;
	}

	// Ephemeral messages only allowed in replies and follow ups i believe
	// also ephemeral leaderboards are only whens someone clicks a button so it will output their position if they are in the game but not in the top how every many positions the leaderboard shows
	if (ephemeralBoolean) {
		if (!foundMyself && playersMap.has(interaction.user.id)) {
			embed.addFields({ name: `#${positions.indexOf({ id: interaction.user.id })}`, value: `<@${interaction.user.id}> with ${playersMap.get(interaction.user.id).points}` });
		}
		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	// Assume that the interaction has already been replied to here so safe to just send to channel
	await interaction.channel.send({
		embeds: [embed],
	});
}