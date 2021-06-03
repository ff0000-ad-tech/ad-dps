import * as urls from './urls.js'
import * as io from './io.js'

/**
 * Load DPS Data, 
 * and prunes result to index 
 * requested ssid/sid/rid 
 * 
	dpsConfig 		<object>		defined in Index.adParams
		{
			data: 		<string> 		valid JSON-string, representing hard-coded data for this ad to render
			env: 			<string> 		origin from which to load DPS data
									'prod'			velvet-dps.tech
									'staging'		staging.velvet-dps.tech
									'local'			localhost:10200
			ssid: 		<string> 		matching a Google Spreadsheet ID
			sid: 			<string> 		matching a Google Sheet Tab ID, expected to exist in specified ssid
			rid: 			<string> 		matching a DPS Row ID, expected to exist in specified ssid/sid
		}
 */
export const load = async (dpsConfig) => {
	console.log(`DpsManager.load()`)
	// if data has been hard-coded
	if (dpsConfig.data) {
		return pruneToRow(parse(dpsConfig.data), dpsConfig.rid)
	}
	// otherwise make request for data
	const url = urls.getFeedUrl(dpsConfig)
	const data = await io.request(url)
	return pruneToRow(parse(data), dpsConfig.rid)
}

const parse = (data) => {
	return typeof data === 'string' ? JSON.parse(data) : data
}
const pruneToRow = (data, rid) => {
	if (rid in data) {
		return data[rid]
	}
	return data
}

/**
 * Extract an http request for a DPS asset,
 * given an object of dps-data and a column-name.
 *
 */
export const getImageRequest = (data, column, { forCanvas } = {}) => {
	console.log(`DpsManager.getImageRequest() for column ${column}`)
	if (!data[column]) {
		throw new Error(`Cannot find column ${column} in ${data}`)
	}
	if (typeof data[column] !== 'object') {
		throw new Error(`The value of column ${column} in ${data} must be an object`)
	}
	// assume only one asset per row, despite ability to upload multiple sources
	const paths = Object.values(data[column])
	// also images may have been baked into the fba-payload, if so return nothing
	if (paths.length && paths[0] !== 'fba-bundled') {
		return { src: paths[0], imageId: column, forCanvas }
	}
}
