import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadConfig() {
	const configPath = process.env.CONFIG_PATH || path.join(__dirname, '..', 'config.js');

	if (!fs.existsSync(configPath)){
		throw new Error(`Config file not found at path: ${configPath}`);
	}

	// Dynamic ESM import
	const configModule = await import(pathToFileURL(configPath).href);
	return configModule.default;
}