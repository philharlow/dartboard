export const serverPort = 4000;
export const serverUrl = document.location.protocol + '//' + document.location.hostname + ":" + serverPort + "/";

export const serverFetch = async (path: string) => {
	const url = serverUrl + path;
	
	const resp = await fetch(url);
	const respJson = await resp.json();
	return respJson;
}