const squareHeel = {
	id: "square",
	title: "Square heel",
	buildDetails(sockSts) {
		const heelFlapSts = sockSts / 2;
		const heelFlapRows = heelFlapSts;
		const gussetStsEachSide = heelFlapRows / 2;
		return {
			items: [
				`Heel flap stitches: ${heelFlapSts}`,
				`Heel flap rows: ${heelFlapRows}`,
				`Gusset pickup per side: ${gussetStsEachSide}`,
				`Total gusset addition: ${gussetStsEachSide * 2}`,
			],
			note: "Classic heel flap + turn + gusset.",
			instructions: [
				"Work heel flap for the listed rows.",
				"Turn the heel over the flap stitches.",
				"Pick up gusset stitches along flap edges.",
				"Decrease gusset back to sock stitch count.",
			],
		};
	},
};

window.SockHeels = window.SockHeels || {};
window.SockHeels[squareHeel.id] = squareHeel;
