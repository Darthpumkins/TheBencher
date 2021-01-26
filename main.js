const config = require("./config.json"),                          // My config file
    Eris = require("eris"),                                       // My discord js library
    runtime = require("./runtime/runtime.js") ,                   // The hashmap creator
    commands = runtime.commandsContainer.commands.Commands,       // All commands found through my runtime
    client = new Eris(config.token, {                             // my client constructor
        getAllUsers: true,
        seedVoiceConnections: true,
        opusOnly: true,
        maxResumeAttempts: 3,
        maxReconnectAttempts: 999,
        latencyThreshold: 1500,
        disableEvents: {
            "GUILD_BAN_ADD": true,
            "GUILD_BAN_REMOVE": true,
            "GUILD_MEMBER_REMOVE": true,
            "MESSAGE_DELETE": true,
            "MESSAGE_DELETE_BULK": true,
            "TYPING_START": true,
        }
    }),                                                           // Prefix for the bot to respond to (user mentions currently not working, I'm bad at programming.)
    chalk = require("chalk"),                                     // Console coloring
    error = `${chalk.redBright("[ERROR]")}${chalk.reset()}`,      // Error message coloring
    warning = `${chalk.yellowBright("[WARN]")}${chalk.reset()}`,  // Warning message coloring
    log = `${chalk.greenBright("[LOG]")}${chalk.reset()}`,        // Log message coloring
    Discord = require("discord.js"),                              // Please god forgive this sin of using two different libraries in the same bot
    bot = new Discord.Client(),                                   // This is like a slap to all bot devs everywhere I am so sorry please don't roast me
    ticTacToe = require("discord-tictactoe"),                     // This goofy ass tictactoe didn't state that it would ONLY work with discord.js and I want it okay
    ttt = new ticTacToe({                                         // roast them not me please
        command: "!ttt",
        language: "en"
    }, bot),
    util = require("util")                                        // Do not delete this variable even if unused, can debug with it
var readyCount = 0                                                // Track eris ready events for debug
let prefix = config.prefix

replaceLog()
replaceWarning()
replaceError()

bot.on("ready", () => {
    console.log(`Discord.js ready`)
})
client.on("ready", () => {
    // Ready event sent when Eris is ready
    readyCount++ 
    console.log(`Eris ready!`)
    console.log(`Current Prefix: ${prefix}`)
    console.warn(`${readyCount} ready events without restart.`)
    client.editStatus({name: "Type !help for a list of commands or !help commandname to get command info."})
})

client.on("messageCreate", message => {
    // Event sent when a message is sent on Discord
    let cmd,
        suffix,
        prefix = (message.content.indexOf("<@!801939642261307393> ") === 0) ? "<@!801939642261307393> " : config.prefix

    if(message.content.indexOf(prefix) === 0) {
        // If the message has the prefix as the first character
        cmd = message.content.substring(prefix.length).split(' ')[0].toLowerCase()
        // cmd is everything after the prefix but still attached to the prefix, the command name
        suffix = message.content.substr(prefix.length).split(' ')
        suffix = suffix.slice(1, suffix.length).join(' ')
        // Suffix is everything after the command name, this is for commands that can take user input (only eval as of writing this)
    }
    if(cmd) {
        // If a cmd is found attached to a prefix
        if(cmd == "help") {
            // okay this is gonna be really hacky but it's the only viable way to do the help command by iterating through the commands object
            let embed = {}
            let fields = []
            if (!suffix) {
                for(let command of Object.keys(commands)) {
                    fields.push({
                        name: `${command}`,
                        value: `${commands[command].help}`
                    })
                }
                embed = {
                    embed: {
                        footer: {
                            text: "Help Command | Parentheses signify required values, brackets signify optional values"
                        },
                        color: 45568,
                        fields: fields
                    }
                }
            } else {
                if (commands[suffix]) {
                    fields = [
                        {
                            name: `${suffix}`,
                            value: `${commands[suffix].help}`
                        },
                        {
                            name: `Usage`,
                            value: `${commands[suffix].usage}`
                        }
                    ]
                    embed = {
                        embed: {
                            footer: {
                                text: "Help Command | Parentheses signify required values, brackets signify optional values"
                            },
                            color: 45568,
                            fields: fields
                        }
                    }
                } else {
                    return message.channel.createMessage("There's no command with that name, dumbass. Try running `!help` by itself instead.")
                }
    
            }
            return message.channel.createMessage(embed).catch(err => {
                message.channel.createMessage("Help command errored.")
                console.error(`${err}`)
            })
        }
        if(commands[cmd]) {
            // If the command is an actual command
            if(typeof commands[cmd] !== "object") {
                // If the command isn't an object, the command is fundamentally broken and should not go any further
                return
            }
            if(commands[cmd].private && message.author.id !== config.owner) {
                // If the command's private value is set to true and the person executing the command is not the bot owner
                return client.createMessage(message.channel.id, "This is a Drew only command.")
            }
            try {
                // Tries to execute the command after all checks are passed
                commands[cmd].fn(message, client, suffix)
            } catch(e) {
                // If an error is caught when executing the command
                client.createMessage(message.channel.id, "Error when executing command. Details logged to console.")
                console.error(`${e}`)
            }
        }
    }
})

client.on("error", err => {
    console.error(`${err}`)
})

client.on("warn", err => {
    console.warn(`${err}`)
})

function replaceLog() {
    let oldInfo = console.log
    console.log = function() {
        Array.prototype.unshift.call(arguments, `${log}`)
        oldInfo.apply(this, arguments)
    }
}
function replaceWarning() {
    let oldInfo = console.warn
    console.warn = function() {
        Array.prototype.unshift.call(arguments, `${warning}`)
        oldInfo.apply(this, arguments)
    }
}
function replaceError() {
    let oldInfo = console.error
    console.error = function() {
        Array.prototype.unshift.call(arguments, `${error}`)
        oldInfo.apply(this, arguments)
    }
}

client.connect()
bot.login(config.token) // I repent 🙏