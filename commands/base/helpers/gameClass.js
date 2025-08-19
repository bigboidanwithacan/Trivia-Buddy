import { EventEmitter } from 'events';
import util from 'util';
import { sessionTokens, wait } from '../../util/reusableVars.js';
import { MAX_TIME, PAUSE_TIME, SIX_HOURS, SMALL_DELAY } from '../../util/constants.js';
import { logger } from '../../../utility/logger.js';

// or i can have this class extended EventEmitter
export class Game {
	constructor(interaction) {
		// chatInputCommandInteraction that started this whole game off
		this.interaction = interaction;
		this.emitter = new EventEmitter();
		this.players = new Map();
		this.commandMessageCollection();
		this.quizStart = false;
		this.quizEnd = false;
	}

	setCurrentInteraction(interaction) {
		this.currentInteraction = interaction;
	}

	// setting and getting multiple things as well
	// look in notion for extra detail and don't forget to check the guide on classes

	cleanEmitter() {
		if (this.quizEnd) {
			this.emitter.removeAllListeners();
			return;
		}
		if (this.quizStart) {
			this.emitter.removeAllListeners('startQuiz');
		}
		this.emitter.removeAllListeners('correctAnswer');
		this.emitter.removeAllListeners('allAnswered');
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
		console.log(util.inspect(this, { showHidden: false, depth: null, colors: true }));
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

	// waits for a command from the initiator of the game
	// viable command include
	// 		pause game -> pause
	// 		end game early -> end
	// 		start early -> start
	commandMessageCollection() {
		const messageFilter = (message) => message.author.id === this.interaction.user.id;
		this.commandCollector = this.interaction.channel.createMessageCollector({
			filter: messageFilter,
			time: MAX_TIME,
		});

		this.commandCollector.on('collect', async (msg) => {
			console.log(msg.content);
			console.log('quiz start', this.quizStart);
			console.log('quiz end: ', this.quizEnd);
			if (msg.content === 'start' && !this.quizStart) {
				this.emitter.emit('startQuiz');
			}
			else if (msg.content === 'pause') {
				// fix
				await Promise.race([
					new Promise(res => this.timer = setTimeout(async () => {
						await msg.channel.send('# Game is starting!');
						await wait(SMALL_DELAY);
						res();
					}, PAUSE_TIME)),
				]);
			}
			else if (msg.content === 'unpause') {
				// fix
				clearTimeout(this.timer);
			}
			else if (msg.content === 'end') {
				// fix
				this.emitter.emit('endQuiz');
				this.quizEnd = true;
			}
		});
	}
};
