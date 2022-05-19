module.exports = function(fractionalHours) {
	const roundedHours = 0.25 * Math.round(fractionalHours / 0.25)
	const hours = Math.floor(roundedHours)
	const minutes = ((roundedHours - hours) * 60) || '00'

	return `${hours}:${minutes}`
}