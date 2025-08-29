# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/bigboidanwithacan/Trivia-Buddy/compare/v1.0.1...v1.1.0) (2025-08-29)

### Features

* **teams**: Add team-based trivia gameplay option ([#roadmap](https://github.com/bigboidanwithacan/Trivia-Buddy#roadmap))
  * Support for 2-4 predetermined teams with configurable team count
  * Interactive team selection and joining system via Discord buttons
  * Team-based point calculation and scoring with difficulty multipliers
  * Team leaderboard display showing team rankings and member lists
  * Winning team determination at game conclusion
* **commands**: Add `teams` boolean option to both `/standard` subcommands
  * Available in both `default` and `win_by_points` game modes
  * Required parameter to choose between solo and team gameplay
