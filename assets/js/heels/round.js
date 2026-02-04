const roundHeel = {
	id: "round",
	title: "Round heel-turn",
	buildDetails(sockSts) {
		const heelFlapSts = sockSts / 2;
		const heelFlapRows = heelFlapSts;
		const third = Math.round(heelFlapSts / 3);
		return {
			items: [
				`Heel flap stitches: ${heelFlapSts}`,
				`Heel flap rows: ${heelFlapRows}`,
				`Turn structure: divide into thirds (~${third} sts each)`,
			],
			note: "Rounded turn without a pronounced gusset.",
			instructions: [
				"Work heel flap for the listed rows.",
				"Divide flap stitches into thirds.",
				"Short-row the heel until center third remains.",
				"Resume knitting in the round.",
			],
		};
	},
};

window.SockHeels = window.SockHeels || {};
window.SockHeels[roundHeel.id] = roundHeel;
