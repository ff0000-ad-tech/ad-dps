import * as urls from './lib/urls.js'
import * as io from './lib/io.js'

export const load = async (config) => {
	// if data has been hard-coded
	if (config.data) {
		return parse(config.data)
	}
	// otherwise make request for data
	const url = urls.getFeedUrl(config)
	const data = await io.request(url)
	return parse(data)
}

export const parse = (data) => {
	return typeof data === 'string' ? JSON.parse(data) : data
}
