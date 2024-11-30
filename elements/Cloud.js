'use strict';

import { State } from '../global.js';
import Particle from './Particle.js';

export default class Cloud extends Particle {
    constructor() {
        super(
            State.Gas,  // state
            { r: 150, g: 153, b: 160 },  // color
            false,  // not fixed
            0,      // minimal mass
            10,    // high flammability
            100,    // high combustibility
            0       // low durability
        )
    }

    step(mutator) {
        // Always try to move up
        if (mutator.isNotGas('above')) {
            // Move up if possible
            mutator.swap('self', 'above');
        } else {
            // Move directly up if possible
            mutator.swap('self', 'above');
        }

        // Burning checks
        if (mutator.isBurning('above') || 
            mutator.isBurning('below') || 
            mutator.isBurning('left') || 
            mutator.isBurning('right')) {
            mutator.burn('self');
        }
        
        return mutator;
    }
}