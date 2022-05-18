const { database: dbConfig } = require('command-line-config').load('./config.json')
const mysql = require('mysql')

function mysqlConnectAndDisconnect(connectionOptions) {
	return new Promise(resolve => {
		const connection = mysql.createConnection({ ...connectionOptions, timeout: 5000 })

		connection.connect(err => {
			resolve(err)
			connection.end()
		})
	})
}

async function getDatabaseAvailability() {
	const connectionTests = Object.keys(dbConfig).map(connectionName => {
		return mysqlConnectAndDisconnect(dbConfig[connectionName])
	})

	let errors = await Promise.all(connectionTests)

	return Object.keys(dbConfig).map((connectionName, index) => {
		if (errors[index] === null) {
			return `Successfully connected to ${connectionName}`
		}

		return `Failed to connect to ${connectionName}(${dbConfig[connectionName].host}) with error: ${ errors[index].code }`
	}).join('\n')
}

module.exports = {
	name: 'db-connection-test',
	aliases: [ 'db', 'database', 'up', 'db-status', 'connection' ],
	description: 'Shows the status of ISoft database servers',
	execute(message) {
		getDatabaseAvailability()
			.then(statuses => {
				console.log(statuses)
				message.channel.send(statuses)
			})
			.catch(err => {
				console.log(err)
				message.channel.send(`Error!`)
			})
	},
}