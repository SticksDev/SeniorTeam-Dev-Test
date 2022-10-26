const {
    ModalBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
} = require('discord.js');

/**
 * This function creates the modal for the suggestion submit and shows it to the user
 * @param {import('discord.js').CommandInteraction} interaction - The interaction of the command
 */
async function showSuggstionModal(interaction) {
    const modal = new ModalBuilder()
        .setTitle('Submit a suggestion')
        .setCustomId('suggestionModal');

    const suggestionInput = new TextInputBuilder()
        .setCustomId('suggestionInput')
        .setLabel('What is your suggestion?')
        .setPlaceholder('Enter your suggestion here')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(10)
        .setMaxLength(1000);

    const mainActionRow = new ActionRowBuilder().addComponents(suggestionInput);
    modal.addComponents(mainActionRow);

    await interaction.showModal(modal);
}

/**
 * This function handles the interaction of the suggestion modal submiting
 * @param {import('discord.js').ModalSubmitInteraction} interaction - The interaction of the modal submit
 * @param {import('discord.js').Client} client - The client
 */
async function handleSubmit(interaction, client) {
    // First defer the interaction
    await interaction.deferReply({ ephemeral: true });

    // Get the suggestion input
    const suggestionInput = interaction.fields.getTextInputValue('suggestionInput');

    // Create a record in the database with the suggestion to get the suggestion ID
    const data = await client.database.execute('INSERT INTO suggestions (userId, suggestionContent) VALUES (?, ?)', [interaction.user.id, suggestionInput]);

    // Create the embed for the suggestion
    const suggestionEmbed = new EmbedBuilder()
        .setTitle('New suggestion')
        .setDescription(`<@${interaction.user.id}> submitted a new suggestion\n\n\`\`\`${suggestionInput}\`\`\``)
        .setFooter({
            text: `Suggestion ID: ${data[0].insertId}`,
        })
        .setTimestamp()
        .setColor('Blue');
    
    // Send the embed to the suggestions channel
    const suggestionsChannel = await client.channels.fetch(process.env.SUGGESTIONS_CHANNEL_ID);
    const msgid = await suggestionsChannel.send({ embeds: [suggestionEmbed] });

    // Update the suggestion record with the message ID
    await client.database.execute('UPDATE suggestions SET messageId = ? WHERE suggestionId = ?', [msgid.id, data[0].insertId]);

    // Send a message to the user
    await interaction.editReply({ content: `:white_check_mark: Your suggestion has been submitted with the id \`${data[0].insertId}\`.`});
}

module.exports = {
    showSuggstionModal,
    handleSubmit,
};
