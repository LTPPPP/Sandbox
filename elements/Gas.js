'use strict';

import { State } from '../global.js';
import Particle from './Particle.js';

export default class Gas extends Particle {
    constructor() {
        super(
            State.Gas,  // state
            { r: 150, g: 153, b: 160 },  // color
            false,  // not fixed
            0,      // minimal mass
            10,     // low flammability
            200,    // high combustibility
        );
    }
}
