# Trivia-Buddy 
Discord Bot made to host trivia questions right in your server! Questions are provided by the [Open Trivia Database](https://opentdb.com/).


## Features 
- `/standard` slash command with two subcommands:
  - **default**: Runs until all questions are answered
  - **win_by_points**: Ends when someone reaches the target score or all questions are answered
- Displays an up-to-date leaderboard on demand (via button) and at the end of each game
- Supports multiple-choice and true/false questions
- In-game commands:
  - `pause` / `unpause`
  - `end`
  - `start` (skip pre-game countdown)
- Customizable number of questions, categories, difficulty, and question types


## Installation 
1. Clone this repository
```bash
git clone https://github.com/bigboidanwithacan/Trivia-Buddy.git
cd trivia-bot
```

2. Install dependencies:
```bash
pnpm install
```

3. Create an application in [Discord Developer Portal](https://discord.com/developers/docs/intro)

4.  Create config.js by copying config.example.js and fill in your secrets

5. Start the bot up!
```bash
node .
```


## Roadmap 
- Team-based trivia games
- Storing point totals with a global leaderboard long-term
- Leaderboard Image Generation with Canva/CanvaCord
- Anime Quiz using Jikan API


## Requirements
- Node v18+ recommended
- Latest pnpm version recommended (change pnpm version in package.json if out of date or you have a different pnpm version)
- Discord permissions
  - View Channels
  - Send Messages
  - Send Messages in Threads
  - Embed Links
  - Read Message History
  - Use Application Commands
