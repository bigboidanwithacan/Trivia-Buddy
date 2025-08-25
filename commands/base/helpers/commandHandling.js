import { SlashCommandBuilder } from 'discord.js';
import { categoryNames, categoryToId } from '../../util/constants.js';

export const commandDefinition = new SlashCommandBuilder()
	.setName('standard')
	.setDescription('The standard trivia game (customizable). Maximum of 8 players at once.')
	.addSubcommand(subCommand =>
		subCommand.setName('default')
			.setDescription('The default game mode where the game lasts until the last question no matter the point total')
			.addBooleanOption(option =>
				option.setName('teams')
					.setDescription('True to play in teams, and false for solo game mode.')
					.setRequired(true),
			)
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
						{ name: 'Any', value: 'any' },
					),
			)
			.addStringOption(option =>
				option.setName('type')
					.setDescription('The type of questions in the quiz (t/f and/or multiple choice)')
					.setChoices(
						{ name: 'T/F', value: 'boolean' },
						{ name: 'Multiple', value: 'multiple' },
						{ name: 'Any', value: 'any' },
					),
			),
	)
	.addSubcommand(subCommand =>
		subCommand.setName('win_by_points')
			.setDescription('Option to end game early when certain point amount is reached. Max 8 players.')
			.addBooleanOption(option =>
				option.setName('teams')
					.setDescription('True to play in teams, and false for solo game mode.')
					.setRequired(true),
			)
			.addIntegerOption(option => option.setName('max')
				.setDescription('The point total to win the game!')
				.setRequired(true)
				.setMinValue(1),
			)
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
						{ name: 'Any', value: 'any' },
					),
			)
			.addStringOption(option =>
				option.setName('type')
					.setDescription('The type of questions in the quiz (t/f and/or multiple choice)')
					.setChoices(
						{ name: 'T/F', value: 'boolean' },
						{ name: 'Multiple', value: 'multiple' },
						{ name: 'Any', value: 'any' },
					),
			),
	);

export async function autocomplete(interaction) {
	const focusedOption = interaction.options.getFocused(true);
	const filteredCategory = categoryNames.filter(category => category.toLowerCase().includes(focusedOption.value.toLowerCase()));

	await interaction.respond(
		filteredCategory.map(choice => ({ name: choice, value: choice })),
	);
}

export async function extractOptions(interaction, game) {
	let query = '';

	const amount = interaction.options.getInteger('amount');
	if (amount !== null) query = `amount=${amount}`;
	else query = 'amount=5';
	const definedAmount = amount ?? 5;
	const category = interaction.options.getString('category');
	if (category !== null) {
		// resolves the promise since categoryToId is technically a promise.
		const categories = await categoryToId;
		const match = categories.find(c => c.category === category);
		if (match) query += `&category=${match.id}`;
	}

	const difficulty = interaction.options.getString('difficulty');
	if (difficulty !== null && difficulty !== 'any') query += `&difficulty=${difficulty}`;

	const type = interaction.options.getString('type');
	if (type !== null && type !== 'any') query += `&type=${type}`;

	let endGameOnPoints = null;
	if (interaction.options.getSubcommand() === 'win_by_points') {
		endGameOnPoints = interaction.options.getInteger('max');
	}

	const teams = interaction.options.getBoolean('teams');

	await game.getSessionToken(interaction.channel.id);
	query += `&token=${game.sessionToken}`;
	game.setCurrentGameOptions(definedAmount, category, difficulty, type, endGameOnPoints, teams);

	return { query };
}