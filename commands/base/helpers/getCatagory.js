async function extractCategory() {
	const url = 'https://opentdb.com/api_category.php';
	const response = await fetch(url).catch(error => {
		console.error('I think the site down', error);
		return;
	});
	const json = await response.json();
	const { trivia_categories } = json;
	for (const category of trivia_categories) {
		console.log	(`{ id: ${category.id}, category: '${category.name}' },`);
	}
}

extractCategory();