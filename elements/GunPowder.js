"use strict";

import { State } from "../global.js";
import Particle from "./Particle.js";

export default class GunPowder extends Particle {
  constructor() {
    super(
      State.Solid,
      { r: 128, g: 128, b: 128 },
      false, // Fixed
      100, // Mass
      100, // Flammability
      0, // Combustibility
      0 // Durability
    );
  }
}
