import { EventEmitter } from 'events';
import util from 'util';
import { sessionTokens } from '../../util/reusableVars.js';
import { SIX_HOURS } from '../../util/constants.js';
import { logger } from '../../../utility/logger.js';

// or i can have this class extended EventEmitter
export class Game {
	constructor(interaction) {
		// chatInputCommandInteraction that started this whole game off
		// just incase its undefined idk
		this.interaction = interaction ?? null;
		this.emitter = new EventEmitter();
		this.players = new Map();
	}

	setCurrentInteraction(interaction) {
		this.currentInteraction = interaction;
	}

	// setting and getting multiple things as well
	// look in notion for extra detail and don't forget to check the guide on classes

	cleanEmitter() {
		this.emitter.removeAllListeners();
	}

	setCurrentQuestion(question) {
		this.question = question;
	}

	setCurrentGameOptions(amount, category, difficulty, type, end_on_points) {
		this.options = {
			amount: amount,
			category: category,
			difficulty: difficulty,
			type: type,
			maxPointsEndGame: end_on_points,
		};
	}

	// for debugging
	outputAllMembers() {
		console.log(console.log(util.inspect(this, { showHidden: false, depth: null, colors: true })));
	}

	// the function i will use to get session tokens for games. these session tokens will only apply to a single channel
	async getSessionToken(channelId) {
		if (!sessionTokens.has(channelId)) {
			const url = 'https://opentdb.com/api_token.php?command=request';
			const response = await fetch(url).catch(error => {
				console.error(error);
			});
			const json = await response.json();
			sessionTokens.set(channelId, json.token);
			this.sessionToken = json.token;
			setTimeout(() => {
				this.removeSessionToken(channelId);
			}, SIX_HOURS);
			logger.info(`New session token created for ${channelId} channel: ${json.token}`);
			return;
		}
		this.sessionToken = sessionTokens.get(channelId);
	}

	removeSessionToken(channelId) {
		logger.info(`Deleting session token of channel ${channelId}`);
		sessionTokens.delete(channelId);
	}

};