const sizeTable = {
	34: { footLenCm: 21.5, footCircCm: 20.5 },
	35: { footLenCm: 22.1, footCircCm: 21.0 },
	36: { footLenCm: 22.8, footCircCm: 21.5 },
	37: { footLenCm: 23.5, footCircCm: 22.0 },
	38: { footLenCm: 24.1, footCircCm: 22.5 },
	39: { footLenCm: 24.8, footCircCm: 23.0 },
	40: { footLenCm: 25.4, footCircCm: 23.5 },
	41: { footLenCm: 26.1, footCircCm: 24.0 },
	42: { footLenCm: 26.8, footCircCm: 24.5 },
	43: { footLenCm: 27.4, footCircCm: 25.0 },
	44: { footLenCm: 28.1, footCircCm: 25.5 },
	45: { footLenCm: 28.8, footCircCm: 26.0 },
	46: { footLenCm: 29.4, footCircCm: 26.5 },
};

const DEFAULTS = {
	negativeEase: 0.1,
	stitchMultiple: 4,
	legLengthCm: 15,
	cuffLengthCm: 5,
};

window.SockData = { sizeTable, DEFAULTS };
