(() => {
	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
	const roundToMultiple = (value, multiple) =>
		Math.round(value / multiple) * multiple;
	const round = (value) => Math.round(value);

	const calculateCore = ({
		size,
		gaugeSts,
		gaugeRows,
		negativeEase,
		ankleCirc,
		legLength,
		defaults,
	}) => {
		const footLenCm = size.footLenCm;
		const footCircCm = size.footCircCm;

		const targetCircCm = footCircCm * (1 - negativeEase);
		const rawSts = targetCircCm * gaugeSts;
		const sockSts = roundToMultiple(rawSts, defaults.stitchMultiple);

		const toeLengthCm = clamp(0.15 * footLenCm, 4, 6);
		const rowsForToe = round(toeLengthCm * gaugeRows);
		const rowsForFoot = round(footLenCm * gaugeRows);
		const rowsBeforeToe = Math.max(rowsForFoot - rowsForToe, 0);

		const finalLegLengthCm = legLength ?? defaults.legLengthCm;
		const rowsForLeg = round(finalLegLengthCm * gaugeRows);
		const rowsForCuff = round(defaults.cuffLengthCm * gaugeRows);

		let ankleSts = null;
		if (ankleCirc && ankleCirc < footCircCm) {
			const ankleTargetCm = ankleCirc * (1 - negativeEase);
			ankleSts = roundToMultiple(ankleTargetCm * gaugeSts, defaults.stitchMultiple);
		}

		return {
			footLenCm,
			footCircCm,
			targetCircCm,
			sockSts,
			toeLengthCm,
			rowsForToe,
			rowsForFoot,
			rowsBeforeToe,
			rowsForLeg,
			rowsForCuff,
			ankleSts,
		};
	};

	window.SockCalculations = { calculateCore };
})();
