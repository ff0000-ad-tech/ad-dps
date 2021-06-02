import * as origins from './origins.js'

export const getFeedUrl = (config) => {
	if (!config.ssid) {
		throw new Error(`adParams.dps.ssid is required to load DPS data`)
	}
	const env = config.env || 'prod'
	const url = origins[env]
	const route = '/dps/data'
	const qs = env === 'local' ? `?proxy=${url}` : ''
	if (config.sid && config.rid) {
		return `${url}${route}/${config.ssid}/${config.sid}/${config.rid}${qs}`
	} else if (config.sid) {
		return `${url}${route}/${config.ssid}/${config.sid}/*${qs}`
	} else {
		return `${url}${route}/${config.ssid}/*${qs}`
	}
}
