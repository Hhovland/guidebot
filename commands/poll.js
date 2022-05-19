const { poll } = require('discord.js-poll')

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	poll(message, args, '+', '#00D1CD')
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "poll" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'poll',
	category: "System",
	description: 'Create a poll',
	usage: " 'Title + Option 1 + Option 2 + Option 3 + etc' ",
}
