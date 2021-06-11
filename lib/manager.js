import * as feeds from './feeds.js'

/**
 * Singleton container for loaded DPS DATA
 *
 */
let DPS_FEEDS

/**
 * Get all loaded feeds.
 *
 * Useful for custom applications.
 */
export const getFeeds = () => {
	return DPS_FEEDS
}

/**
 * Get an entire feed.
 *
 * Useful for custom applications.
 *
 * @param {string} feedLabel  Matches window.adParams.dpsConfig(label)
 */
export const getFeed = (feedLabel) => {
	return DPS_FEEDS.find((feed) => feed.label === feedLabel)
}

/**
 * Get specific feed-data.
 *
 * @param {string} feedLabel Returns feed-data whose window.adParams.dpsConfig(label) matches `feedLabel`.
 * @param {string} columnPath Returns a cell value whose column matches `columnPath`.
 * @param {string} cellValue Returns a row whose column `columnPath` matches `cellValue`
 */
export const getData = (feedLabel, columnPath = null, cellValue = null) => {
	// find feed
	const feed = getFeed(feedLabel)
	if (!feed) {
		throw new Error(`Could not find dps-feed labeled '${feedLabel}'.`)
	}
	// if no column-name, return entire feed-data
	if (!columnPath) {
		return feed.data
	}
	// if column-name & cell-value are provided,
	// return whole row-data with matching columnPath:cellValue
	let res
	if (cellValue) {
		res = Object.values(feed.data).find((value) => {
			return feeds.reduceColumnPath(columnPath, value) === cellValue
		})
	}
	// otherwise, return requested columnPath value
	else {
		res = feeds.reduceColumnPath(columnPath, feed.data)
	}
	if (!res) {
		throw new Error(`Column '${columnPath}' not found in DPS-Feed '${feedLabel}'.`)
	}
	return res
}

/**
 * Load DPS Feed Data, 
 * and prunes result to index 
 * requested ssid/sid/rid 
 * 
	dpsConfig 		<object>		defined in Index.adParams
		{
			env: 			<string> 		origin from which to load DPS data
									'prod'			velvet-dps.tech
									'staging'		staging.velvet-dps.tech
									'local'			localhost:10200
			feeds:		<array>			list of feed objects:
				label:		<string>		identifier for this data obj
				ssid: 		<string> 		matching a Google Spreadsheet ID
				sid: 			<string> 		matching a Google Sheet Tab ID, expected to exist in specified ssid
				rid: 			<string> 		matching a DPS Row ID, expected to exist in specified ssid/sid
				data: 		<string> 		valid JSON-string, representing hard-coded data for this ad to render
		}
 */
export const loadFeeds = async (dpsConfig) => {
	console.log(`DpsManager.loadFeeds()`)
	DPS_FEEDS = await Promise.all(
		dpsConfig.feeds.map(async (feed) => {
			const data = await feeds.load(dpsConfig, feed)
			return { ...feed, data }
		})
	)
	console.log({ DPS_FEEDS })
}

/**
 * Extract an http request for a DPS asset,
 * given an object of dps-data and a column-name.
 *
 *	@param dpsSource {object} Required, DPS-Sources object like { image: url }
 *	@param imageId {string} Required, the name by which this image can be retrieved with ImageManager.
 *
 *	@param forCanvas {boolean} Optional, adds cross-origin trust in order to read image byte-array
 *
 */
export const getImageRequest = (dpsSource, imageId, { forCanvas } = {}) => {
	console.log(`DpsManager.getImageRequest()`)
	console.log({ dpsSource })

	// image requests will always be objects like, { filename: url }
	if (typeof dpsSource !== 'object') {
		throw new Error(`'dpsSource' does not appear to be a DPS-Sources object, like { image: url }.`)
	}

	// assume only one asset per row, despite ability to upload multiple sources
	const sources = Object.entries(dpsSource)

	// also images may have been baked into the fba-payload, if so return nothing
	if (sources.length && sources[0][1] !== 'fba-bundled') {
		if (typeof sources[0][1] !== 'string' || !sources[0][1].match(/^http/)) {
			throw new Error(`Requested dpsSource does not appear to be a DPS-Sources object.`)
		}
		console.log(`  '${sources[0][0]}' available at ImageManager.get('${imageId}')`)
		return { src: sources[0][1], imageId, forCanvas }
	}
}

/**
 * Find a key
 */
