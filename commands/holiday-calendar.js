/*
const got = require('got')
const ical = require('ical.js')
const { sortArrayByObjectKey } = require('@isoftdata/utility-array')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')
const getYear = require('date-fns/getYear')
const icalHolidayCalendarUrl = 'https://calendar.google.com/calendar/ical/isoftdata.com_jcne020sfrmpcourbfueh6sk6c%40group.calendar.google.com/private-ca99d240f8b23d2c9279d02e346dbec8/basic.ics'
async function getCalendarEmbed(icalUrl, specificYear) {
	const icalResponse = await got(icalUrl)
	const comp = new ical.Component(ICAL.parse(icalResponse.body))
	const events = comp.jCal[2]
	const today = new Date()
	let holidays = events.map(event => {
		return event[1].reduce((acc, details) => {
			return {
				...acc,
				[details[0]]: {
					type: details[2],
					value: details[3],
				},
			}
		}, {})
	}).map(holiday => {
		return {
			name: holiday.summary.value,
			value: parseISO(holiday.dtstart.value),
		}
	}).filter(holiday => {
		if (specificYear) {
			if (!parseInt(specificYear, 10) || specificYear.length !== 4) {
				throw new Error('Invalid year given')
			}
			return getYear(holiday.value) == specificYear
		}
		return holiday.value > today
	})
	holidays = sortArrayByObjectKey({ array: holidays, key: 'value' })
	return {
		title: "ISoft Paid Holidays",
		fields: holidays.map(holiday => {
			return {
				name: `**${holiday.name}**`,
				value: format(holiday.value, `EEEE, MMMM do`),
			}
		}),
	}
}
*/

module.exports = {
	name: "holiday",
	aliases: [ 'holidays', 'holidaylist' ],
	description: "List of ISoft paid holidays",
	execute(message, args) {
		/*
		getCalendarEmbed(icalHolidayCalendarUrl, args[0]).then(embed => {
			message.channel.send({ embed })
		}).catch(err => {
			console.log(err)
			message.channel.send('Error getting holiday list')
		})
		*/
		message.channel.send('https://app.gusto.com/time_off/show_holidays')
	},
}