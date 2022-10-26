# SeinorTeam Devloper Test
This bot was made for the SeinorTeam Devloper Test. It's objective is to handle suggestions for the server. It's made with discord.js and uses a MySQL database.

## Setup
1. Clone the repository
2. Run `npm i`
3. Rename the `.env.example` file to `.env` and fill in the values - most are self explanatory.
4. Run `node index.js` to start the bot.

## Commands
- `suggest <suggestion>` - Suggest something for the server.
- `suggest approve <suggestionID>` - Approve a suggestion.
- `suggest deny <suggestionID>` - Deny a suggestion.
- `suggest implement <suggestionID>` - Mark a suggestion as implemented.

All commands are slash commands.

## License
This project is licensed under the MIT License.