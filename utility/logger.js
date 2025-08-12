// basic logging accomplished just make sure to import this everywhere lol
import pino from 'pino';
import chalk from 'chalk';

const transport = pino.transport({
	target: 'pino/file',
	options: { destination: './log.json' },
});

export const logger = pino(transport);

function timestamp() {
	return new Date().toUTCString();
}

export class Chalk {

	info(msg) {
		console.log(chalk.blue(`[INFO] [${timestamp()}]`), msg);
	}

	warn(msg) {
		console.warn(chalk.yellow(`[WARN] [${timestamp()}]`), msg);
	}

	error(msg) {
		console.error(chalk.red(`[ERROR] [${timestamp()}]`), msg);
	}

	debug(msg) {
		console.debug(chalk.gray(`[DEBUG] [${timestamp()}]`), msg);
	}
}

