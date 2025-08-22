// TESTING OUT CANVACORD DUE TO REQUEST TO MAKE A BETTER LEADERBOARD
// THIS IS NOT AN MVP DESIGN, BUT RATHER A FEATURE REQUEST
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { Font, LeaderboardBuilder } from 'canvacord';

Font.loadDefault();

export const data = new SlashCommandBuilder()
	.setName('test')
	.setDescription('Command used to test the leaderboard feature');

export async function execute(interaction) {
	await interaction.deferReply();

	const players = [
		{ avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/330px-PNG_transparency_demonstration_1.png', username: 'PlayerOne', displayName: 'Player One', level: 10, xp: 1500, rank: 1 },
		{ avatar: 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvam9iNjgwLTE2Ni1wLWwxZGJ1cTN2LnBuZw.png', username: 'PlayerTwo', displayName: 'Player Two', level: 9, xp: 1200, rank: 2 },
		{ avatar: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlMl9kaWdpdGFsX3BhaW50X21pbmltYWxfaWxsdXN0cmF0aW9uX29mX2NsZWFuX2p1bl8wNzUzYTY0ZC03ZDYxLTRjZjItYmI4YS0wNGMzMjFhYjViYzBfMS5wbmc.png', username: 'PlayerThree', displayName: 'Player Three', level: 8, xp: 1000, rank: 3 },
	];

	const lb = new LeaderboardBuilder()
		.setHeader({
			title: 'Server Leaderboard',
			image: 'https://cdn.pixabay.com/photo/2017/05/31/16/39/windows-2360920_1280.png',
			subtitle: 'Top Players',
		})
		.setPlayers(players)
		.setVariant('default');


	const imageBuffer = await lb.build({ format: 'png' });
	const attachment = new AttachmentBuilder(imageBuffer, {
		name: 'leaderboard.png',
	});

	await interaction.editReply({
		content: '**Leaderboard:**',
		files: [attachment],
	});
}

