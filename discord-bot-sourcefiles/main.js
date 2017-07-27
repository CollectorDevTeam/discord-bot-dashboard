var exports = module.exports = {};

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("../config.json");
const botDataJson = require("./../botData.json");
const botcommands = require("./bot-commands.json");
// Delete this line when you´re using this project for public usages.
const prv_config = require("../private_config.json");


const chalk = require('chalk');

const app = require("./../api/app");

const commandPrefix = config.prefix;

// Executed when the bot is ready!
client.on('ready', () => {
    // Console output for showing that the bot is running.
    console.log(chalk.greenBright('\n>> Bot is ready!'));
    console.log('>> Logged in as ' + client.user.username);
    console.log('>> Running on version ' + botDataJson.bot_version);
    console.log('>> Current game: ' + botDataJson.bot_game);
    console.log('>> Current status: ' + botDataJson.bot_status);

    // Optional start options when you´re starting the bot.
    client.user.setGame(botDataJson.bot_game);

    client.user.setStatus(botDataJson.bot_status);

    // This is starting the app.
    app.startApp(client);
});

// If your code editor says that () => is an error, change it to function()
// Executed when message event
client.on('message', (message) => {
    let commands = botcommands;
    if(message.author.bot) return;

    let sender = message.author;
    let senderUsername = sender.username;
    let senderID = sender.id;
    let content = message.content;

    if(message.channel.type === "dm"){
        let time = Date.now();
        app.dmNotification(senderUsername, content, time);
    }
});

// Change it to config.token when you want to use this project for public usages.
//
// prv_config is only for personal usage or when youre forking this project,
// testing some functions with the and make a pull request to the repo.
// Warning: When you´re making a pull request, check that you didn´t wrote your token inside the config.json.
//
// To use prv_config, create a file called "private_config.json" inside the main directory.
// .gitignore will ignore this file when you want to commit and push.
// So nobody can get your bot token.
client.login(prv_config.token);

/**
 * Set a game status for the bot.
 *
 * @param game - Game to be set for the bot.
 * @param maintenanceChange - Default: false. Set it to true when this function here is used for maintenance function
 * @since 0.0.1
 *
 * @public
 */
exports.setGameStatus = function (/**String*/ game,/**boolean*/maintenanceChange) {

    // Short explanation why I´m using this boolean maintenanceChange
    // Currently we´re saving all data from the bot into the file botData.json
    // When I´m saving the new values which are sent by the maintenance function like the new game status
    // it will, without the boolean maintenanceChange, execute the fs.readFile function which produce
    // issues in the botData.json like some typos and other mistakes.
    // So this is the reason why I use this boolean.

    // When you want to publish your bot for real usage, you can use this file or creating a database
    // which you must implement here.

    // You have another idea how to store this values? Then make a Pull Request in GitHub! :)

    let gameBeforeChanging = client.user.localPresence.game.name;
    client.user.setGame(game);

    console.log("\n>> Bot Change > Game status set to: " + game);

    if(maintenanceChange === false) {

        fs.readFile("./botData.json", "utf-8", function (err, data) {
            if (err) throw err;
            let botData = JSON.parse(data);

            botData.bot_game = game;

            fs.writeFile('./botData.json', JSON.stringify(botData), 'utf-8', function (err) {
                if (err) throw err;
                console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                console.log(chalk.yellowBright(">> game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold(game));
            })
        });

    }
};

/**
 * Set a status for the bot (online | idle | dnd | invisible)
 *
 * @param status - Status of the bot.
 * @param maintenanceChange - Default: false. Set it to true when this function here is used for maintenance function
 * @see {@link https://discord.js.org/#/docs/main/stable/typedef/PresenceStatus|Discord.js Docs -> PresenceStatus}
 * @since 0.0.1
 *
 * @public
 */
exports.setBotStatus = function (/**String*/ status,/**boolean*/maintenanceChange) {

    // Store status in a let before the change
    let statusBeforeChanging = client.user.localPresence.status;

    if(status != "online" && status != "idle" && status != "invisible" && status != "dnd" ){
        console.error("\n>> Bot Error: Invalid status to set! Use only the 4 vaild ones!" +
            "\n>> PresenceStatus: https://discord.js.org/#/docs/main/stable/typedef/PresenceStatus" +
            "\n>> Sent value: " + status);
    }else{
        // Setting the new value
        client.user.setStatus(status);
        // Output successful notification
        console.log(">> Bot Change > Status set to: " + status);

        if(maintenanceChange === false) {

            // Change value in botData.json
            fs.readFile("./botData.json", "utf-8", function (err, data) {
                if (err) throw err;
                let botData = JSON.parse(data);

                // Setting new status value
                botData.bot_status = status;

                // Writing new value into the json file
                fs.writeFile('./botData.json', JSON.stringify(botData), 'utf-8', function (err) {
                    if (err) throw err;
                    console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                    console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold(status));
                })
            });

        }

    }
};

/**
 * Writing a message to the administrators of a server. (testing)
 *
 * @param message - Message string which will be sent to the administrator.
 * @since 0.0.2-beta
 *
 * @public
 */
exports.sendAdminMessage = function (/**String*/ message) {
    let guilds = client.guilds;

    guilds.map(function (a) {
        a.owner.send(message);
        console.log(">> Bot Action > Server Admin DM sent to: " + a.owner.user.username + " - Server Admin of the server: " + a.name);
        console.log("> Direct invite link to server: currently not available. on development.")
    });
};


/**
 * Returns the client object. Mainly for development.
 *
 * @since 0.0.1
 * @return {Object} The Client object.
 *
 * @public
 */
exports.sendClientObject = function (t0) {
    let t1 = Performance.now();
    app.addLog({
        "log_type" : "info",
        "log_message" : "Output the Client object",
        "log_date" : Date.now(),
        "log_action" : "executed by function bot.sendClientObject, function call took " + t1 - t0 + "ms"
    });
    return client;
};

/**
 * Outputs the client.guilds object. Mainly for development.
 *
 * @since 0.0.3
 *
 * @public
 */
exports.sendGuildsObject = function () {
    let guilds = client.guilds;
    // guilds.map(function (a) {
    //     console.log(a.name);
    // })
    console.log(guilds);
};
/**
 * Outputs the invites of servers where the bot is connected. For production and development.
 *
 * @since 0.0.3
 *
 * @public
 */
exports.sendInvitesOfServers = function () {
    let guilds = client.guilds;

    guilds.map(function (a) {
        a.fetchInvites().then((invites) => {
            invites.map(function (b) {
                console.log(b.guild.name + " / " + b.url);
            });
        });
    })
};

/**
 * Change status from bot to 'dnd' and writes a message to the discord server admins who are using this bot to
 * get informed about the maintenance (maintenance like for testing new functions etc.) [This function is in a Early status!]
 *
 * @param maintenanceBool - Maintenance status of the bot and the app.
 * @since 0.0.4
 *
 * @public
 */
exports.maintenance = function (/**boolean*/ maintenanceBool) {
    if(maintenanceBool === true){
        // localPresence values before the maintenance starts
        let statusBeforeChanging  = client.user.localPresence.status;
        let gameBeforeChanging    = client.user.localPresence.game.name;

        // Set new values to the bot user
        this.setBotStatus("dnd", true);
        this.setGameStatus("Monkeys are working!", true);
        this.sendAdminMessage("Hello dear server admin, currently I´m currently in maintenance so don´t wonder why you may not can access all functions. We will inform you when we finished our maintenance!");

        // Reading the file and replace property values to new ones

        fs.readFile("./botData.json", "utf-8", function (err, data) {
            if (err) throw err;
            let botData = JSON.parse(data);

            // Setting new values for properties.

            botData.maintenance = true;
            botData.bot_game = "Monkeys are working!";
            botData.bot_status = "dnd";

            // Writing new property values into botData.json

            fs.writeFile('./botData.json', JSON.stringify(botData), 'utf-8', function(err) {
                if (err) throw err;

                // Output the changes

                console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                console.log(chalk.yellowBright(">> maintenance: ") + chalk.redBright("false") + " -> " + chalk.greenBright.bold("true"));
                console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold("dnd"));
                console.log(chalk.yellowBright(">> bot_game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold("Monkeys are working!"));
            })
        });

        // Output the notification

        console.log("\n>> Bot > Maintenance are now " + chalk.redBright.bold("enabled!"));
        console.log(">> Bot > Notification Message was sent to server admins.");


    }else{
        // localPresence values before the maintenance ends
        let statusBeforeChanging  = client.user.localPresence.status;
        let gameBeforeChanging    = client.user.localPresence.game.name;

        // Set new values to the bot user
        this.setBotStatus("online", true);
        this.setGameStatus("Monkeys are finished!", true);

        // Reading the file and replace property values to new ones
        fs.readFile("./botData.json", "utf-8", function (err, data) {
            if (err) throw err;
            let botData = JSON.parse(data);

            // Setting new values for properties.

            botData.maintenance = false;
            botData.bot_game = "Monkeys are finished!";
            botData.bot_status = "online";

            // Writing new property values into botData.json

            fs.writeFile('./botData.json', JSON.stringify(botData), 'utf-8', function(err) {
                if (err) throw err;

                // Output the changes in the files

                console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                console.log(chalk.yellowBright(">> maintenance: ") + chalk.redBright("true") + " -> " + chalk.greenBright.bold("false"));
                console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold("online"));
                console.log(chalk.yellowBright(">> bot_game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold("Monkeys are finished!"));
            })
        });

        // Output the notification

        console.log("\n>> Bot > Maintenance are now " + chalk.greenBright.bold("disabled!"));
    }
};

