const logger = require('@jakeyprime/logger');
const suggestionHandler = require('../handlers/suggestionHandler');
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isModalSubmit()) {
            // Check if the customId is the same as the one we set in the modal
            if (interaction.customId === 'suggestionModal') {
                // If so, run the suggestionHandler
                suggestionHandler
                    .handleSubmit(interaction, client)
                    .catch((err) => {
                        logger.error(
                            `An error occurred while handling a suggestion submission: ${err}`,
                        );
                        interaction.reply({
                            content:
                                ':x: An error occurred while handling your suggestion submission. Please try again later.',
                            ephemeral: true,
                        }).catch((err) => { // Fallback if the interaction fails to reply or has been deferred
                            interaction.editReply(':x: An error occurred while handling your suggestion submission. Please try again later.').catch((err) => {
                                logger.warning(`All methods of replying to the interaction failed: ${err}`);
                            })
                        }); 
                    });
            } else return;
        }

        // Basic validation
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        // Run the command
        await command.execute(interaction, client).catch((error) => {
            logger.error(
                `An error occurred while executing the command ${interaction.commandName}: ${error}`,
            );
            interaction.reply({
                content: ':x: There was an error while executing this command.',
                ephemeral: true,
            });
        });
    },
};
