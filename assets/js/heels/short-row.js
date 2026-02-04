const shortRowHeel = {
	id: "shortRow",
	title: "Short-row heel",
	buildDetails(sockSts) {
		const unworked = Math.round(sockSts / 3);
		return {
			items: [
				`Heel stitches: ${sockSts}`,
				`Unworked stitches at deepest turn: ~${unworked}`,
			],
			note: "Short rows across full sock width.",
			instructions: [
				"Work short rows across all stitches.",
				"Stop turning when about one third remains unworked.",
				"Mirror the short rows to return to full width.",
			],
		};
	},
};

window.SockHeels = window.SockHeels || {};
window.SockHeels[shortRowHeel.id] = shortRowHeel;
