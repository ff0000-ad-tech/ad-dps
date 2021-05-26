import * as urls from './lib/urls.js'
import * as io from './lib/io.js'

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
