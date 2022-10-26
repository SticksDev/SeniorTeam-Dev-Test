const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const suggestionHandler = require('../handlers/suggestionHandler');

// Create the basic command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Suggestion management related commands.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('accept')
                .setDescription('Accepts a suggestion.')
                .addIntegerOption((option) =>
                    option
                        .setName('suggestionid')
                        .setDescription('The ID of the suggestion to accept.')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('deny')
                .setDescription('Denies a suggestion.')
                .addIntegerOption((option) =>
                    option
                        .setName('suggestionid')
                        .setDescription('The ID of the suggestion to deny.')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('implement')
                .setDescription('Marks a suggestion as implemented.')
                .addIntegerOption((option) =>
                    option
                        .setName('suggestionid')
                        .setDescription(
                            'The ID of the suggestion to mark as implemented.',
                        )
                        .setRequired(true),
                ),
        ),
    async execute(interaction, client) {
        // Get the subcommand
        const subcommand = interaction.options.getSubcommand();
        const suggestionId = interaction.options.getInteger('suggestionid');

        async function getSuggestion(id) {
            const [rows] = await client.database.execute(
                'SELECT * FROM suggestions WHERE suggestionId = ?',
                [id],
            );

            if (rows.length === 0) return null;
            return rows[0];
        }

        switch (subcommand) {
            case 'accept': {
                // Get the suggestion
                const suggestion = await getSuggestion(suggestionId);

                if (!suggestion) {
                    await interaction.reply({
                        content: ':x: That suggestion does not exist.',
                        ephemeral: true,
                    });
                    return;
                }

                // Ask for confirmation
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmAction')
                        .setLabel('Confirm')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancelAction')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger),
                );

                const msg = await interaction.reply({
                    content: 'Are you sure you want to accept this suggestion?',
                    components: [row],
                });

                // Wait for a response
                const filter = (i) => i.user.id === interaction.user.id;
                const collector =
                    msg.createMessageComponentCollector({
                        filter,
                        time: 15000,
                    });

                collector.on('collect', async (i) => {
                    if (i.customId === 'confirmAction') {
                        // Update the suggestion
                        await client.database.execute(
                            'UPDATE suggestions SET suggestionStatus = ? WHERE suggestionId = ?',
                            [2, suggestionId],
                        );

                        // Edit the suggestion embed in the channel
                        const channel = await client.channels.fetch(process.env.SUGGESTIONS_CHANNEL_ID)
                        const message = await channel.messages.fetch(suggestion.messageId)
                        const embed = message.embeds[0];

                        const updatedEmbed = new EmbedBuilder(embed)
                            .setTitle(embed.title)
                            .setDescription(embed.description)
                            .setColor('Green')
                            .setFooter(
                                {
                                    text: `Suggestion ID: ${suggestionId} | Accepted by ${interaction.user.tag}`,
                                }
                            )
                            .setTimestamp();
                        
                        await message.edit({ embeds: [updatedEmbed] });

                        // Edit the message
                        await i.update({
                            content: ':white_check_mark: Successfully accepted the suggestion.',
                            components: [],
                        });

                        collector.stop();
                    } else if (i.customId === 'cancelAction') {
                        await i.update({
                            content: 'Cancelled the action.',
                            components: [],
                        });

                        collector.stop();
                    }
                });

                break
            }

            case 'deny': {
                // Get the suggestion
                const suggestion = await getSuggestion(suggestionId);

                if (!suggestion) {
                    await interaction.reply({
                        content: ':x: That suggestion does not exist.',
                        ephemeral: true,
                    });
                    return;
                }

                // Ask for confirmation
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmAction')
                        .setLabel('Confirm')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancelAction')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger),
                );

                const msg = await interaction.reply({
                    content: 'Are you sure you want to deny this suggestion?',
                    components: [row],
                });

                // Wait for a response
                const filter = (i) => i.user.id === interaction.user.id;
                const collector =
                    msg.createMessageComponentCollector({
                        filter,
                        time: 15000,
                    });

                collector.on('collect', async (i) => {
                    if (i.customId === 'confirmAction') {
                        // Update the suggestion
                        await client.database.execute(
                            'UPDATE suggestions SET suggestionStatus = ? WHERE suggestionId = ?',
                            [3, suggestionId],
                        );

                        // Edit the suggestion embed in the channel
                        const channel = await client.channels.fetch(process.env.SUGGESTIONS_CHANNEL_ID)
                        const message = await channel.messages.fetch(suggestion.messageId)
                        const embed = message.embeds[0];

                        const updatedEmbed = new EmbedBuilder(embed)
                            .setTitle(embed.title)
                            .setDescription(embed.description)
                            .setColor('Red')
                            .setFooter(
                                {
                                    text: `Suggestion ID: ${suggestionId} | Deined by ${interaction.user.tag}`,
                                }
                            )
                            .setTimestamp();
                        
                        await message.edit({ embeds: [updatedEmbed] });

                        // Edit the message
                        await i.update({
                            content: ':white_check_mark: Successfully denied the suggestion.',
                            components: [],
                        });

                        collector.stop();
                    } else if (i.customId === 'cancelAction') {
                        await i.update({
                            content: 'Cancelled the action.',
                            components: [],
                        });

                        collector.stop();
                    }
                });

                break;
            }
            case 'implement': {
                // Get the suggestion
                const suggestion = await getSuggestion(suggestionId);

                if (!suggestion) {
                    await interaction.reply({
                        content: ':x: That suggestion does not exist.',
                        ephemeral: true,
                    });
                    return;
                }

                // In this case, we need to check if the suggestion is accepted and not already implemented
                if (suggestion.suggestionStatus !== 2) {
                    await interaction.reply({
                        content: ':x: That suggestion is not accepted.',
                        ephemeral: true,
                    });
                    return;
                }

                if (suggestion.suggestionStatus == 4) {
                    await interaction.reply({
                        content: ':x: That suggestion is already implemented.',
                        ephemeral: true,
                    });
                    return;
                }

                // We don't need to ask for confirmation here, so we can just update the suggestion
                // Mark the suggestion as implemented
                await client.database.execute(
                    'UPDATE suggestions SET suggestionStatus = ? WHERE suggestionId = ?',
                    [4, suggestionId],
                );

                // Edit the suggestion embed in the channel
                const channel = await client.channels.fetch(process.env.SUGGESTIONS_CHANNEL_ID)
                const message = await channel.messages.fetch(suggestion.messageId)
                const embed = message.embeds[0];

                const updatedEmbed = new EmbedBuilder(embed)
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .setColor('Yellow')
                    .setFooter(
                        {
                            text: `Suggestion ID: ${suggestionId} | Implmented by ${interaction.user.tag}`,
                        }
                    )
                    .setTimestamp();
                
                await message.edit({ embeds: [updatedEmbed] });

                await interaction.reply({
                    content: ':white_check_mark: Successfully marked the suggestion as implemented.'
                });

                break;
            }
        }
    },
};
