export const DifficultyMultiplier = Object.freeze({
	easy: 	1,
	medium: 2,
	hard: 	3,
});

export const joinedMessages = Object.freeze([
	'You\'re all set! 🎉 No need to click \'Join\' again — you\'re already in the game and ready to roll!',
	'You\'re in! 🕹️ No need to hit \'Join\' again — just sit tight, the game\'s about to begin!',
	'Already joined — we\'re just as excited as you are! 😄',
	'Hold tight! You\'ve already joined the game. One click is all it takes! 🚀',
	'Easy does it! You\'re already part of the game. Let the fun begin! 🎮',
	'Double join? You\'re eager — we love that! But one join is all you need. 😄',
]);

export const START_WAIT = 30_000;
export const ROUND_WAIT = 20_000;
export const ROUND_BUFFER = 15_000;
export const MAX_PLAYERS = 8;

export const categoryNames = Object.freeze([
	'General Knowledge',
	'Entertainment: Books',
	'Entertainment: Film',
	'Entertainment: Music',
	'Entertainment: Musicals & Theatres',
	'Entertainment: Television',
	'Entertainment: Video Games',
	'Entertainment: Board Games',
	'Science & Nature',
	'Science: Computers',
	'Science: Mathematics',
	'Mythology',
	'Sports',
	'Geography',
	'History',
	'Politics',
	'Art',
	'Celebrities',
	'Animals',
	'Vehicles',
	'Entertainment: Comics',
	'Science: Gadgets',
	'Entertainment: Japanese Anime & Manga',
	'Entertainment: Cartoon & Animations',
]);

export const categoryToId = deepFreeze([
	{ id: 9, category: 'General Knowledge' },
	{ id: 10, category: 'Entertainment: Books' },
	{ id: 11, category: 'Entertainment: Film' },
	{ id: 12, category: 'Entertainment: Music' },
	{ id: 13, category: 'Entertainment: Musicals & Theatres' },
	{ id: 14, category: 'Entertainment: Television' },
	{ id: 15, category: 'Entertainment: Video Games' },
	{ id: 16, category: 'Entertainment: Board Games' },
	{ id: 17, category: 'Science & Nature' },
	{ id: 18, category: 'Science: Computers' },
	{ id: 19, category: 'Science: Mathematics' },
	{ id: 20, category: 'Mythology' },
	{ id: 21, category: 'Sports' },
	{ id: 22, category: 'Geography' },
	{ id: 23, category: 'History' },
	{ id: 24, category: 'Politics' },
	{ id: 25, category: 'Art' },
	{ id: 26, category: 'Celebrities' },
	{ id: 27, category: 'Animals' },
	{ id: 28, category: 'Vehicles' },
	{ id: 29, category: 'Entertainment: Comics' },
	{ id: 30, category: 'Science: Gadgets' },
	{ id: 31, category: 'Entertainment: Japanese Anime & Manga' },
	{ id: 32, category: 'Entertainment: Cartoon & Animations' },
]);

// will make sure no obj and its members are immutable recursively
async function deepFreeze(obj) {
	Object.freeze(obj);

	Object.getOwnPropertyNames(obj).forEach((property) => {
		const value = obj[property];
		if (value && (typeof value === 'object' || typeof value === 'function') && !Object.isFrozen(value)) {
			deepFreeze(value);
		}
	});

	return obj;
}