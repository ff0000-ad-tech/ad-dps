import * as c from './consts.js'

const LOCAL = 'http://localhost:10200'
// TODO!
// Staging and Prod origins should be Google CDN
const STAGING = 'https://staging.velvet-dps.tech'
const PROD = 'https://velvet-dps.tech'

export const getOrigin = dpsEnv => {
	switch (dpsEnv) {
		case c.ENV_LOCAL:
			return LOCAL
		case c.ENV_STAGING:
			return STAGING
		case c.ENV_PROD:
			return PROD
	}
}
