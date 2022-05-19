var sophieSays =

[{
	color: 0x00ff00,
	title: 'YES!',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/yes.jpg',
	},
},
{
	color: 0xff0000,
	title: 'NO!',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/no.jpg',
	},
},
{
	color: 0xffff00,
	title: 'Maybe?',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/maybe.jpg',
	},
},
{
	color: 0xffff00,
	title: 'Ask again later.',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/askagain.jpg',
	},
},{
	color: 0xff0000,
	title: 'Abolutely Not!',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/absolutelynot.jpg',
	},
},
{
	color: 0xffff00,
	title: 'If you don\'t know by know... I\'m not goign to tell you!',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/dontknowbynow.jpg',
	},
},
{
	color: 0xffff00,
	title: 'Are you really going to ask a 9 year old?',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/reallyaska9yearold.jpg',
	},
},
{
	color: 0xffff00,
	title: 'I would tell you, but then I would have to kill you.',
	author: {
		name: 'Sophie Says',
	},
	image: {
		url: 'https://ithinkwise.com/sophiesays/tellbuthavetokill.jpg',
	},
},
]

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	message.channel.send({ embed: sophieSays[Math.floor(Math.random() * (sophieSays.length))] })
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "eightball" ],
	permLevel: "User",
}

exports.help = {
	name: "asksophie",
	category: "System",
	description: "Sophie knows everything",
	usage: " Magic 8 ball ",
}
