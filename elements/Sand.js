'use strict'

import {State} from '../global.js'
import Particle from './Particle.js'

export default class Sand extends Particle {
    constructor() {
        super(
            State.Solid,
            { r: 150, g: 150, b: 0 },
            false, // Fixed
            100, // Mass
            0, // Flammability
            0,  // Combustibility
            100, // Durability
        )
    }
}
