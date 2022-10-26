// Node Dependencies
require('dotenv').config()
const fs = require('fs');

// Discord Dependencies
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

// Create a new logger instance
const logger = require("@jakeyprime/logger");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.DirectMessages] });

// Add variables to the client
const commands = [];
client.commands = new Collection();
client.logger = logger;

// Initialize the database
const mysql = require('mysql2/promise');
let connection;

// Add the database to the client, type it as a mysql2/promise connection
client.database = connection;


// Read all commands from the commands folder and load them into the client.commands collection
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());

    logger.info(`Loaded command ${command.data.name}.`);
}

// Read all events from the events folder and load them into the client
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    
    logger.info(`Loaded event ${event.name}.`);
}

// Create a new REST instance and push the commands to the dev server
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async() => {
    try {
        logger.info('Started refreshing application (/) on dev server.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.BOT_DEV_GUILD_ID), { body: commands },
        );

        logger.info('Successfully reloaded application (/) commands on dev server.');
    } catch (error) {
        logger.error(`An error occurred while refreshing application (/) commands on dev server: ${error}`);
    }
})();


// Login to the bot
client.login(process.env.BOT_TOKEN);