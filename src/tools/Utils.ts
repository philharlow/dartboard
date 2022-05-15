
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPrettyPlace = (place: number) => {
	const lastDigit = place % 10;
	if (lastDigit === 1) return place + "st";
	if (lastDigit === 2) return place + "nd";
	if (lastDigit === 3) return place + "rd";
	return place + "th";
}

export const getRandom = (vals: any[]) => {
	return vals[Math.floor(Math.random() * vals.length)];
}
