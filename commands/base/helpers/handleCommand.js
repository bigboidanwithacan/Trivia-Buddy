import { SlashCommandBuilder } from 'discord.js';
import { categoryNames, categoryToId } from '../../util/constants.js';

export const commandDefinition = new SlashCommandBuilder()
	.setName('standard')
	.setDescription('The standard trivia game. Can choose your own options.')
	.addIntegerOption(option =>
		option.setName('amount')
			.setDescription('Amount of question to include in quiz')
			.setMaxValue(50)
			.setMinValue(1),
	)
	.addStringOption(option =>
		option.setName('category')
			.setDescription('The category you want the quiz to be')
			.setAutocomplete(true),
	)
	.addStringOption(option =>
		option.setName('difficulty')
			.setDescription('The difficulty of the questions')
			.setChoices(
				{ name: 'Easy', value: 'easy' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'Hard', value: 'hard' },
				{ name: 'Any', value: ' ' },
			),
	)
	.addStringOption(option =>
		option.setName('type')
			.setDescription('The type of questions in the quiz (t/f or multiple choice)')
			.setChoices(
				{ name: 'T/F', value: 'boolean' },
				{ name: 'Multiple', value: 'multiple' },
				{ name: 'Any', value: ' ' },
			),
	)
	.addBooleanOption(option =>
		option.setName('end_on_points')
			.setDescription('Option to end game when someone reaches a certain amount of points'),
	);

export async function autocomplete(interaction) {
	const focusedOption = interaction.options.getFocused(true);
	const filteredCategory = categoryNames.filter(category => category.toLowerCase().startsWith(focusedOption.value.toLowerCase()));

	await interaction.respond(
		filteredCategory.map(choice => ({ name: choice, value: choice })),
	);
}

export async function extractOptions(interaction) {
	let query = '';

	const amount = interaction.options.getInteger('amount');
	if (amount !== null) query = `amount=${amount}`;
	else query = 'amount=5';
	// https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple
	const category = interaction.options.getString('category');
	if (category !== null) {
		console.log(Array.isArray(categoryToId), categoryToId);
		// resolves the promise since categoryToId is technically a promise.
		const categories = await categoryToId;
		const match = categories.find(c => c.category === category);
		if (match) query += `&category=${match.id}`;
	}

	const difficulty = interaction.options.getString('difficulty');
	if (difficulty !== null) query += `&difficulty=${difficulty}`;

	const type = interaction.options.getString('type');
	if (type !== null) query += `&type=${type}`;

	const endGameOnPoints = interaction.options.getBoolean('end_on_points');

	console.log(query);

	return { query, endGameOnPoints };
}