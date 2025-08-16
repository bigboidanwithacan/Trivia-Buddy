export function capitalizeFirstLetter(word) {
	if (typeof word !== 'string' || word.length === 0) {
		return word;
	}
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}