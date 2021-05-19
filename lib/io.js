export const request = async url => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onload = (e) => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					try {
						resolve(JSON.parse(xhr.responseText))
					} catch (err) {
						resolve(xhr.responseText)
					}
				} else {
					reject(xhr.statusText);
				}
			}
		};
		xhr.onerror = (err) => {
			console.error(err)
			reject(xhr.statusText);
		};
		xhr.send(null);
	})
}