import { SlashCommandBuilder, ContainerBuilder, UserSelectMenuBuilder, ButtonStyle, MessageFlags, ComponentType } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('test')
	.setDescription('Command used to test whatever stuff');

export async function execute(interaction) {
	// await interaction.reply('test!');
	const exampleContainer = new ContainerBuilder()
		.setAccentColor(0x0099FF)
		.addTextDisplayComponents(
			textDisplay => textDisplay
				.setContent('This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.'),
		)
		.addActionRowComponents(
			actionRow => actionRow
				.setComponents(
					new UserSelectMenuBuilder()
						.setCustomId('exampleSelect')
						.setPlaceholder('Select users'),
				),
		)
		.addSeparatorComponents(
			separator => separator,
		)
		.addSectionComponents(
			section => section
				.addTextDisplayComponents(
					textDisplay => textDisplay
						.setContent('This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.'),
					textDisplay => textDisplay
						.setContent('And you can place one button or one thumbnail component next to it!'),
				)
				.setButtonAccessory(
					button => button
						.setCustomId('exampleButton')
						.setLabel('Button inside a Section')
						.setStyle(ButtonStyle.Primary),
				),
		);
	const response = await interaction.reply({
		components: [exampleContainer],
		flags: MessageFlags.IsComponentsV2,
		withResponse: true,
	});
	const message = response.resource.message;

	const menuCollector = message.createMessageComponentCollector({
		componentType: ComponentType.UserSelect,
		time: 10_000,
	});

	const buttonCollector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 15_000,
	});

	menuCollector.on('collect', async i => {
		// console.log(i.values);
		i.reply(`Hey <@${i.values[0]}>\n ${i.user} wanted to @ you for some reason`);
	});

	buttonCollector.on('collect', async i => {
		i.reply(`Congrats ${i.user} knows how to click a button :middle_finger:`);
	});

}
