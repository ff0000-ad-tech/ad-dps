import * as c from './consts.js'

const LOCAL = 'http://localhost:10200'
// TODO!
// Staging and Prod origins should be Google CDN
const STAGING = 'https://staging.velvet-dps.tech'
const PROD = 'https://velvet-dps.tech'

export const getOrigin = dpsEnv => {
	switch (dpsEnv) {
		case c.MODE_LOCAL:
			return LOCAL
		case c.MODE_STAGING:
			return STAGING
		case c.MODE_PROD:
			return PROD
	}
}
