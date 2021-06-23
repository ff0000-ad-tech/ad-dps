import { ImageManager } from '@ff0000-ad-tech/ad-assets'

import * as feeds from './feeds.js'
import * as events from './events.js'
import * as env from './env.js'
import * as c from './consts.js'

/**
 * Singleton container for loaded DPS DATA
 *
 */
let DPS_FEEDS
let dpsEnv

/**
 * Init DpsManager with environment
 *
 */
export const init = adParams => {
	console.log(`DpsManager.init()`)
	dpsEnv = env.determine(adParams.environmentId)
}

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
export const getFeed = feedLabel => {
	try {
		return DPS_FEEDS.find(feed => feed.label === feedLabel)
	} catch (err) {
		return
	}
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
		res = Object.values(feed.data).find(value => {
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
 * Set DPS Feed Data
 *
 * Ads compiled by Creative Server may have their data
 * inlined into the dps-assets import.
 *
 * This method gives that class a means of threading
 * the data back into to this manager.
 *
 * See `loadFeeds()` for more info.
 *
 */
export const setInlineFeeds = feeds => {
	console.log(`DpsManager.setInlineFeeds()`)
	DPS_FEEDS = feeds
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
export const loadFeeds = async dpsConfig => {
	console.log(`DpsManager.loadFeeds()`)
	DPS_FEEDS = await Promise.all(
		dpsConfig.feeds.map(async feed => {
			// feed may have been added via Creative Server compile
			if (dpsEnv === c.ENV_INLINED) {
				console.warn(` - using inlined DPS Feed!`)
				return getFeed(feed.label)
			}
			// otherwise load the feed from dps
			const data = await feeds.load(dpsEnv, feed)
			const dpsFeed = { ...feed, data }
			// dispatch feeds data to container
			events.dpsFeedLoaded(dpsFeed)
			return dpsFeed
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
export const addImageRequest = (dpsSource, imageId, { forCanvas } = {}) => {
	console.log(`DpsManager.addImageRequest()`)
	// image requests will always be objects like, { filename: url }
	if (typeof dpsSource !== 'object') {
		throw new Error(`'dpsSource' does not appear to be a DPS-Sources object, like { image: url }.`)
	}
	// assume only one asset per row, despite ability to upload multiple sources
	const sources = Object.entries(dpsSource)
	if (sources.length) {
		const srcPath = sources[0][0]
		const src = sources[0][1]
		// images may have been baked into the fba-payload
		if (dpsEnv === c.ENV_INLINED) {
			console.warn(` - using inlined DPS Asset!`)
		} else {
			// source may be malformed
			if (typeof src !== 'string' || !src.match(/^http/)) {
				throw new Error(`Requested dpsSource does not appear to be a DPS-Sources object.`)
			} // return image-request, see @ff0000-ad-tech/ad-assets:ImageManager
			const imageRequest = { src, imageId, forCanvas }
			// dispatch image request to container for bundling purposes
			events.dpsImageRequested(imageRequest)
			// add image request to ImageManager
			ImageManager.addImageRequest(imageRequest)
		}
		// info to console
		console.log(`  '${srcPath}' available with ImageManager.get('${imageId}')`)
	}
}

/**
 * Preflight complete
 *
 * Let's Creative-Server know that all dynamic assets have been queued.
 */
export const preflightComplete = () => {
	events.dpsPreflightComplete()
}
