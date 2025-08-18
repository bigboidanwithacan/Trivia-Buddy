import { EventEmitter } from 'events';
import util from 'util';

// or i can have this class extended EventEmitter
export class Game {
	constructor(interaction) {
		// chatInputCommandInteraction that started this whole game off
		this.interaction = interaction;
		// just incase its undefined idk
		this.baseInteraction = interaction ?? null;
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

	outputAllMembers() {
		console.log(console.log(util.inspect(this, { showHidden: false, depth: null, colors: true })));
	}

};