const logger = require("../modules/logger.js")
//eslint-disable-next-line
module.exports = async(client, error) => {
	logger.log(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, "error")
}
