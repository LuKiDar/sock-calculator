const roundHeel = {
	id: "round",
	title: "Round heel-turn",
	buildDetails(sockSts, direction) {
		const heelFlapSts = sockSts / 2;
		const heelFlapRows = heelFlapSts;
		const heelMiddleSt = heelFlapSts / 2;
		const row1KnitTo = heelMiddleSt - 1;
		const isToeUp = direction === "toeUp";
		const instructions = [
			"Work heel flap back and forth for the listed rows.",
			`Row 1 (RS): sl 1, k ${row1KnitTo} (to the middle of the flap), k 2 past middle, ssk, k 1, turn the work.`,
			`Row 2 (WS): sl 1, p 3 before middle, p 2 past middle, p2tog, p 1, turn the work.`,
			"Row 3 (RS): sl 1, knit to the last turn stitch, k2tog (turn st + next), k 1, turn the work.",
			"Row 4 (WS): sl 1, purl to the last turn stitch, p2tog (turn st + next), p 1, turn the work.",
			"Repeat Rows 3–4 until all heel flap stitches are worked.",
			isToeUp
				? "Resume knitting in the round for leg and cuff."
				: "Resume knitting in the round for the foot to the toe.",
		];
		return {
			items: [
				`Heel flap stitches: ${heelFlapSts}`,
				`Heel flap rows: ${heelFlapRows}`,
				`Heel turn midpoint: ${heelMiddleSt} sts`,
			],
			note: "Rounded turn without a pronounced gusset.",
			instructions,
		};
	},
};

window.SockHeels = window.SockHeels || {};
window.SockHeels[roundHeel.id] = roundHeel;
