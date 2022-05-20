const mysql = require('mysql')
const { database: dbConfig } = require('command-line-config').load('./config.json')

function getArcadeHighScores(cb) {
	console.log('loading arcade high scores')

	const mysqlConnection = mysql.createConnection({
		...dbConfig.dev,
		database: 'arcade',
	})

	mysqlConnection.connect(err => {
		if (err) {
			console.error(`error connecting: ${ err.stack}`)
			return
		}

		mysqlConnection.query('SELECT `name`, `total_points` FROM `v_leaderboard`', (error, highScores) => {
			if (error) {
				throw error
			}

			highScores = highScores.map(row => {
				return `${row.name }: ${ row.total_points}`
			}).join('\n')

			cb(error, highScores)

			mysqlConnection.end(err => {
				if (err) {
					console.error(err)
				}
			})
		})
	})
}

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	getArcadeHighScores((err, scores) => {
		if (err) {
			message.author.send(`Error getting arcade high scores!`)
		}

		!args.length ? message.author.send(scores, { split: true }) : message.channel.send(scores, { split: true })
	})
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "arcade", "scores" ],
	permLevel: "User",
}

exports.help = {
	name: "arcade-high-scores",
	category: "Testing",
	description: "Show the arcade high scores",
	usage: " [tellTheChannel] ",
}
