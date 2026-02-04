import { DEFAULTS, sizeTable } from "./data.js";
import { heelById } from "./heels/index.js";

const calculatorForm = document.getElementById("calculator");
const resultsContainer = document.getElementById("results");
const resetButton = document.getElementById("resetButton");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundToMultiple = (value, multiple) =>
  Math.round(value / multiple) * multiple;
const round = (value) => Math.round(value);

const formatNumber = (value, decimals = 1) =>
  Number.isFinite(value) ? value.toFixed(decimals) : "—";

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
  const size = sizeTable[euSize];
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

const buildHeelDetails = (heelType, sockSts) => {
  const heelModule = heelById[heelType];
  if (!heelModule) {
    return null;
  }
  return {
    title: heelModule.title,
    ...heelModule.buildDetails(sockSts),
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
  const inputs = getFormValues();
  const error = validateInputs(inputs);
  if (error) {
    showError(error);
    return;
  }

  const core = calculateCore(inputs);
  const heelDetails = buildHeelDetails(inputs.heelType, core.sockSts);
  renderResults(inputs, core, heelDetails);
};

const handleReset = () => {
  calculatorForm.reset();
  showError("Fill in the form to see results.");
};

calculatorForm.addEventListener("submit", handleCalculate);
resetButton.addEventListener("click", handleReset);

showError("Fill in the form to see results.");
