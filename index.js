const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = 8080
const jsonParser = bodyParser.json()
const {  messageSend } = require("./WebhookHandler")
const { registerMeetingRoomRenamer } = require('./meeting-room-renamer')
const { prefix, channelIds } = require('./config.json')

// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 16) {
	throw new Error("Node 16.x or higher is required. Update Node on your system.")
}
require("dotenv").config()

// Load up the discord.js library
const { Client, Collection } = require("discord.js")
// We also load the rest of the things we need in this file:
const { readdirSync } = require("fs")
const { intents, partials, permLevels } = require("./config.js")
const logger = require("./modules/logger.js")
// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're referring to. Your client.
const client = new Client({ intents, partials })

// Aliases, commands and slash commands are put in collections where they can be
// read from, catalogued, listed, etc.
const commands = new Collection()
const aliases = new Collection()
const slashcmds = new Collection()

// Generate a cache of client permissions for pretty perm names in commands.
const levelCache = {}
for (let i = 0; i < permLevels.length; i++) {
	const thisLevel = permLevels[i]
	levelCache[thisLevel.name] = thisLevel.level
}

// To reduce client pollution we'll create a single container property
// that we can attach everything we need to.
client.container = {
	commands,
	aliases,
	slashcmds,
	levelCache,
}
client.once('ready', () => {
  registerMeetingRoomRenamer(client, channelIds)
  console.log('ready!')
})

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.
//eslint-disable-next-line
const init = async() => {
	// Here we load **commands** into memory, as a collection, so they're accessible
	// here and everywhere else.
	const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"))
	for (const file of commands) {
		const props = require(`./commands/${file}`)
		logger.log(`Loading Command: ${props.help.name}. 👌`, "log")
		client.container.commands.set(props.help.name, props)
		props.conf.aliases.forEach(alias => {
			client.container.aliases.set(alias, props.help.name)
		})
	}

	// Now we load any **slash** commands you may have in the ./slash directory.
	const slashFiles = readdirSync("./slash").filter(file => file.endsWith(".js"))
	for (const file of slashFiles) {
		const command = require(`./slash/${file}`)
		const commandName = file.split(".")[0]
		logger.log(`Loading Slash command: ${commandName}. 👌`, "log")

		// Now set the name of the command with it's properties.
		client.container.slashcmds.set(command.commandData.name, command)
	}

	// Then we load events, which will include our message and ready event.
	const eventFiles = readdirSync("./events/").filter(file => file.endsWith(".js"))
	for (const file of eventFiles) {
		const eventName = file.split(".")[0]
		logger.log(`Loading Event: ${eventName}. 👌`, "log")
		const event = require(`./events/${file}`)
		// Bind the client to any event, before the existing arguments
		// provided by the discord.js event.
		// This line is awesome by the way. Just sayin'.
		client.on(eventName, event.bind(null, client))
	}

	// Threads are currently in BETA.
	// This event will fire when a thread is created, if you want to expand
	// the logic, throw this in it's own event file like the rest.
	client.on("threadCreate", thread => thread.join())

  client.on('message', message => {
    let args, commandName
    //const caseregex = /case ?(\d+)/i
    const caseregex = /cases?.?(\d+)/i
    //const militaryTimeRegex = /\b([0-2]\d)([0-5]\d)\b/
  
    if (caseregex.test(message.content) && !message.author.bot) {
      const found = message.content.match(caseregex)
      commandName = "case"
      args = [ found[1] ]
    /*}
      else if (militaryTimeRegex.test(message.content) && !message.author.bot) {
      const found = message.content.match(militaryTimeRegex)
      commandName = "military-time"
      args = [ found[1], found[2] ]  */
    } else if (!message.content.startsWith(prefix) || message.author.bot) {
      return
    } else {
      args = message.content.slice(prefix.length).split(/ +/)
      commandName = args.shift().toLowerCase()
    }
  
    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
  
    if (!command) {
      return
    }
  
    if (command.guildOnly && message.channel.type !== 'text') {
      return message.reply('I can\'t execute that command inside DMs!')
    }
  
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`
  
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
      }
  
      return message.channel.send(reply)
    }
  
    /* 	if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection())
    }
    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
      }
    }
    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount) */
  
    try {
      command.execute(message, args)
    } catch (error) {
      console.error(error)
      message.reply('there was an error trying to execute that command!')
    }
  })

	app.post("/", jsonParser, async function(req, res) {
		try {
			const { body } = req
			await messageSend(body, client)
			res.status(200).send("Webhook Recieved")
		} catch (err) {
			console.log("It broke somewhere")
			res.status(500).send(err)
		}
	})

	// Here we login the client.
	client.login()

// End top-level async/await function.
}

init()

app.listen(PORT, function() {
	console.log('Express server listening on port ', PORT)
})
