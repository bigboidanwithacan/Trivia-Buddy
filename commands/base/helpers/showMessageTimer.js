export async function showMessageTimer(interaction, timeUntilCompletion, messageString) {
	const now = Date.now();
	const end = Math.floor((now + timeUntilCompletion) / 1_000);
	const message = await interaction.channel.send(`${messageString}: <t:${end}:R>`);
	setTimeout(async () => {
		await message.delete();
	}, timeUntilCompletion);

}