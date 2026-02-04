import { squareHeel } from "./square.js";
import { strongHeel } from "./strong.js";
import { roundHeel } from "./round.js";
import { shortRowHeel } from "./short-row.js";

const heelModules = [squareHeel, roundHeel, shortRowHeel, strongHeel];

export const heelById = heelModules.reduce((map, heel) => {
  map[heel.id] = heel;
  return map;
}, {});
