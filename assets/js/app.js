const heelById = window.SockHeels || {};

const calculatorForm = document.getElementById("calculator");
const resultsContainer = document.getElementById("results");
const resetButton = document.getElementById("resetButton");
const euSizeSelect = document.getElementById("euSize");
const heelTypeSelect = document.getElementById("heelType");
const directionSelect = document.getElementById("direction");

let DEFAULTS = null;
let selectDefaults = null;
let sizeTableById = {};
let sizeTableList = [];
let heelTypeList = [];
let directionList = [];
let syncCustomSelects = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundToMultiple = (value, multiple) =>
	Math.round(value / multiple) * multiple;
const round = (value) => Math.round(value);

const formatNumber = (value, decimals = 1) =>
	Number.isFinite(value) ? value.toFixed(decimals) : "—";

const getOptionId = (option) => option.id ?? option.value;

const buildLabelMap = (options = []) =>
	options.reduce((labels, option) => {
		labels[getOptionId(option)] = option.label;
		return labels;
	}, {});

const populateSelectOptions = (select, options = []) => {
	if (!select) {
		return;
	}
	select.innerHTML = "";
	options.forEach((option) => {
		const optionEl = document.createElement("option");
		optionEl.value = getOptionId(option);
		optionEl.textContent = option.label;
		select.appendChild(optionEl);
	});
};

const applySelectDefaults = () => {
	if (!selectDefaults) {
		return;
	}
	if (euSizeSelect && selectDefaults.euSize) {
		euSizeSelect.value = selectDefaults.euSize;
	}
	if (heelTypeSelect && selectDefaults.heelType) {
		heelTypeSelect.value = selectDefaults.heelType;
	}
	if (directionSelect && selectDefaults.direction) {
		directionSelect.value = selectDefaults.direction;
	}
};

const directionLabels = () => buildLabelMap(directionList);
const allDirectionValues = () => directionList.map((option) => option.id);

const getAllowedDirections = (heelType) => {
	const heelEntry = heelTypeList.find((option) => option.id === heelType);
	if (heelEntry && Array.isArray(heelEntry.direction)) {
		return heelEntry.direction;
	}
	return allDirectionValues();
};

const rebuildDirectionOptions = (heelType) => {
	if (!directionSelect) {
		return;
	}
	const allowedDirections = getAllowedDirections(heelType);
	const currentValue = directionSelect.value;

	const labels = directionLabels();
	Array.from(directionSelect.options).forEach((option) => {
		const isAllowed = allowedDirections.includes(option.value);
		option.disabled = !isAllowed;
		if (!option.textContent) {
			option.textContent = labels[option.value] || option.value;
		}
	});

	const nextValue = allowedDirections.includes(currentValue)
		? currentValue
		: allowedDirections[0] || "";
	if (nextValue) {
		directionSelect.value = nextValue;
	}
};

const initializeSelectOptions = () => {
	populateSelectOptions(euSizeSelect, sizeTableList);
	populateSelectOptions(heelTypeSelect, heelTypeList);
	populateSelectOptions(directionSelect, directionList);
	applySelectDefaults();
	rebuildDirectionOptions(heelTypeSelect ? heelTypeSelect.value : "");
};

const getFormValues = () => {
	const formData = new FormData(calculatorForm);
	const euSize = Number(formData.get("euSize"));
	const gaugeSts = Number(formData.get("gaugeSts"));
	const gaugeRows = Number(formData.get("gaugeRows"));
	const negativeEasePercent = Number(formData.get("negativeEase"));
	const ankleCirc = Number(formData.get("ankleCirc"));
	const legLength = Number(formData.get("legLength"));

	return {
		euSize,
		heelType: formData.get("heelType"),
		direction: formData.get("direction"),
		gaugeSts,
		gaugeRows,
		negativeEase: negativeEasePercent / 100,
		ankleCirc: Number.isFinite(ankleCirc) && ankleCirc > 0 ? ankleCirc : null,
		legLength: Number.isFinite(legLength) && legLength > 0 ? legLength : null,
	};
};

const calculateCore = ({
	euSize,
	gaugeSts,
	gaugeRows,
	negativeEase,
	ankleCirc,
	legLength,
}) => {
	const size = sizeTableById[euSize];
	const footLenCm = size.footLenCm;
	const footCircCm = size.footCircCm;

	const targetCircCm = footCircCm * (1 - negativeEase);
	const rawSts = targetCircCm * gaugeSts;
	const sockSts = roundToMultiple(rawSts, DEFAULTS.stitchMultiple);

	const toeLengthCm = clamp(0.15 * footLenCm, 4, 6);
	const rowsForToe = round(toeLengthCm * gaugeRows);
	const rowsForFoot = round(footLenCm * gaugeRows);
	const rowsBeforeToe = Math.max(rowsForFoot - rowsForToe, 0);

	const finalLegLengthCm = legLength ?? DEFAULTS.legLengthCm;
	const rowsForLeg = round(finalLegLengthCm * gaugeRows);
	const rowsForCuff = round(DEFAULTS.cuffLengthCm * gaugeRows);

	let ankleSts = null;
	if (ankleCirc && ankleCirc < footCircCm) {
		const ankleTargetCm = ankleCirc * (1 - negativeEase);
		ankleSts = roundToMultiple(ankleTargetCm * gaugeSts, DEFAULTS.stitchMultiple);
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

const buildHeelDetails = (heelType, sockSts, direction) => {
	const heelModule = heelById[heelType];
	if (!heelModule) {
		return null;
	}
	return {
		title: heelModule.title,
		...heelModule.buildDetails(sockSts, direction),
	};
};

const buildDirectionSteps = (direction) => {
	if (direction === "toeUp") {
		return [
			"Toe increases until full sock stitches",
			"Work foot to pre-toe length",
			"Work selected heel module",
			"Work leg length (optional taper to ankle stitches)",
			"Work cuff length and bind off",
		];
	}

	return [
		"Cast on full sock stitches",
		"Work cuff length",
		"Work leg length (optional taper to ankle stitches)",
		"Work selected heel module",
		"Work foot to pre-toe length",
		"Work toe decreases to finish",
	];
};

const renderResults = (inputs, core, heelDetails) => {
	const summaryItems = [
		`Foot length: ${formatNumber(core.footLenCm)} cm`,
		`Foot circumference: ${formatNumber(core.footCircCm)} cm`,
		`Target sock circumference: ${formatNumber(core.targetCircCm)} cm`,
		`Sock stitches: ${core.sockSts}`,
	];

	const lengthItems = [
		`Toe length: ${formatNumber(core.toeLengthCm)} cm (${core.rowsForToe} rows)`,
		`Pre-toe foot rows: ${core.rowsBeforeToe}`,
		`Leg rows: ${core.rowsForLeg}`,
		`Cuff rows: ${core.rowsForCuff}`,
	];

	if (core.ankleSts) {
		lengthItems.push(`Optional ankle stitch target: ${core.ankleSts}`);
	}

	const directionSteps = buildDirectionSteps(inputs.direction);

	const heelHtml = heelDetails
		? `
			<div class="results__section">
				<h3 class="results__section-title">${heelDetails.title}</h3>
				<ul class="results__list">
					${heelDetails.items.map((item) => `<li>${item}</li>`).join("")}
				</ul>
				<p class="results__note">${heelDetails.note}</p>
				<ul class="results__list">
					${heelDetails.instructions.map((item) => `<li>${item}</li>`).join("")}
				</ul>
			</div>
		`
		: "";

	resultsContainer.innerHTML = `
		<div class="results__summary">
			<strong>Summary</strong>
			<ul class="results__list">
				${summaryItems.map((item) => `<li>${item}</li>`).join("")}
			</ul>
		</div>

		<div class="results__section">
			<h3 class="results__section-title">Lengths & rows</h3>
			<ul class="results__list">
				${lengthItems.map((item) => `<li>${item}</li>`).join("")}
			</ul>
		</div>

		${heelHtml}

		<div class="results__section">
			<h3 class="results__section-title">Order of sections</h3>
			<ol class="results__list">
				${directionSteps.map((step) => `<li>${step}</li>`).join("")}
			</ol>
		</div>
	`;
};

const validateInputs = ({ gaugeSts, gaugeRows, negativeEase }) => {
	if (!Number.isFinite(gaugeSts) || gaugeSts <= 0) {
		return "Gauge stitches per cm must be greater than 0.";
	}
	if (!Number.isFinite(gaugeRows) || gaugeRows <= 0) {
		return "Gauge rows per cm must be greater than 0.";
	}
	if (!Number.isFinite(negativeEase) || negativeEase < 0 || negativeEase > 0.25) {
		return "Negative ease should be between 0% and 25%.";
	}
	return null;
};

const showError = (message) => {
	resultsContainer.innerHTML = `<p class="results__empty">${message}</p>`;
};

const handleCalculate = (event) => {
	event.preventDefault();
	if (!hasBootData()) {
		showError("Scripts did not load. Please refresh the page.");
		return;
	}
	const inputs = getFormValues();
	const error = validateInputs(inputs);
	if (error) {
		showError(error);
		return;
	}

	const core = calculateCore(inputs);
	const heelDetails = buildHeelDetails(
		inputs.heelType,
		core.sockSts,
		inputs.direction
	);
	renderResults(inputs, core, heelDetails);
};

const handleReset = () => {
	calculatorForm.reset();
	applySelectDefaults();
	rebuildDirectionOptions(heelTypeSelect ? heelTypeSelect.value : "");
	if (syncCustomSelects) {
		syncCustomSelects();
	}
	showError("Fill in the form to see results.");
};

const hasBootData = () =>
	Boolean(DEFAULTS) &&
	sizeTableList.length > 0 &&
	Object.keys(heelById).length > 0;

const initApp = (sockData) => {
	if (!sockData) {
		showError("Data did not load. Please refresh the page.");
		return;
	}

	DEFAULTS = sockData.DEFAULTS || null;
	selectDefaults = sockData.selectDefaults || null;
	sizeTableById = (sockData.sizeTable || []).reduce((map, entry) => {
		map[entry.id] = entry;
		return map;
	}, {});
	sizeTableList = (sockData.sizeTable || []).map((entry) => ({
		id: entry.id,
		label: entry.label,
	}));
	heelTypeList = (sockData.heelType || []).map((entry) => ({
		id: entry.id,
		label: entry.label,
		direction: entry.direction,
	}));
	directionList = (sockData.direction || []).map((entry) => ({
		id: entry.id,
		label: entry.label,
	}));

	initializeSelectOptions();

	syncCustomSelects =
		window.SockSelects && window.SockSelects.initCustomSelects
			? window.SockSelects.initCustomSelects()
			: null;

	calculatorForm.addEventListener("submit", handleCalculate);
	resetButton.addEventListener("click", handleReset);
	if (heelTypeSelect) {
		heelTypeSelect.addEventListener("change", () => {
			rebuildDirectionOptions(heelTypeSelect.value);
			if (syncCustomSelects) {
				syncCustomSelects();
			}
		});
		if (syncCustomSelects) {
			syncCustomSelects();
		}
	}

	showError(
		hasBootData()
			? "Fill in the form to see results."
			: "Scripts did not load. Please refresh the page."
	);
};

const readEmbeddedSockData = () => {
	const dataEl = document.getElementById("sock-data");
	if (!dataEl) {
		return null;
	}
	try {
		return JSON.parse(dataEl.textContent);
	} catch (error) {
		return null;
	}
};

const loadSockData = () => {
	const embedded = readEmbeddedSockData();
	if (embedded) {
		return Promise.resolve(embedded);
	}
	return fetch("assets/data/sock-data.json")
		.then((response) => (response.ok ? response.json() : null))
		.catch(() => null);
};

loadSockData().then((data) => {
	initApp(data);
});
