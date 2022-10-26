const logger = require("@jakeyprime/logger");
const mysql = require("mysql2/promise");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await client.user.setActivity(`you submit suggestions`, { type: "WATCHING" });
        logger.info(`Logged in as ${client.user.tag}.`);
        logger.info(`Ready to serve ${client.guilds.cache.size} servers and ${client.users.cache.size} users.`);
        logger.info(`Loading database...`);

        // Connect to the database
        client.database = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }).catch(err => {
            logger.error(`A fatal error occurred while connecting to the database: ${err}`);
            process.exit(1);
        })

        logger.info(`Successfully connected to the database.`);
    }
}