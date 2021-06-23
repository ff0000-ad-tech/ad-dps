export const dpsFeedLoaded = dpsFeed => {
	const event = new CustomEvent('dps-feed-loaded', { detail: dpsFeed })
	document.dispatchEvent(event)
}

export const dpsImageRequested = imageRequest => {
	const event = new CustomEvent('dps-image-requested', { detail: imageRequest })
	document.dispatchEvent(event)
}

export const dpsPreflightComplete = () => {
	const event = new CustomEvent('dps-preflight-complete')
	document.dispatchEvent(event)
}
