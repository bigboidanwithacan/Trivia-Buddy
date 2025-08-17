export async function APICall(interaction, query) {
	const apiUrl = `https://opentdb.com/api.php?${query}`;
	const response = await fetch(apiUrl).catch(error => {
		console.error(error);
		interaction.reply('Sorry there was a problem fetching the questions! Please try again at a later date or try some of our other quiz options!');
		return null;
	});
	const json = await response.json();

	const { results } = json;

	return results;
}