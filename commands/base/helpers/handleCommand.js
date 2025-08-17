import { SlashCommandBuilder } from 'discord.js';

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
	console.log(focusedOption);
}

export async function extractOptions(interaction) {
	console.log(interaction.options);
}