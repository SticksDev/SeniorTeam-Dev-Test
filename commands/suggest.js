const { SlashCommandBuilder } = require('discord.js');
const suggestionHandler = require('../handlers/suggestionHandler');

// Create the basic command
module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggests something for the server.'),
	async execute(interaction, client) {		
        // Pass the interaction to the suggestion handler to handle the rest
        suggestionHandler.showSuggstionModal(interaction);
	},
};