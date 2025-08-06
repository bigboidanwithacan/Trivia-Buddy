import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";

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
	await interaction.editReply({ content: 'Click the button below to join the game if you are not the current host!', });
	
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
	const start = Math.round((now + 30_000)/1_000);

	await interaction.editReply(`${interaction.user} has just initiated a trivia game! Follow the step below to join. Countdown till the trivia game starts <t:${start}:R>`);
	setTimeout(async () => await interaction.deleteReply(), 30_000);
	await interaction.channel.send({ content: 'Click the button below to join the game if you are not the current host!', components: [joinRow]});

	let counter = 1;
	for (const fullQuestion of results ) {
		const { type, difficulty, category, question, correct_answer, incorrect_answers } = fullQuestion;
		const embed = new EmbedBuilder()
			.setTitle(`Question ${counter}`)
			.setImage('https://opentdb.com/images/logo.png');

		await interaction.channel.send({ embeds: [embed] });

		counter++;
	}


	
}