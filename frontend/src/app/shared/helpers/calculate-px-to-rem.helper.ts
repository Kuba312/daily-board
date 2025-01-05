export function calculatePxToRem(px: number): number {
	const fontSize = parseFloat(
		getComputedStyle(document.documentElement).fontSize,
	);

	return px / fontSize;
}
