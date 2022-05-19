exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`)
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "server" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'server',
	category: "System",
	description: 'Display info about this server.',
	usage: " PostInfo ",
}
