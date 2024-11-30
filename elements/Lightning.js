'use strict'

import {State} from '../global.js'
import Particle from './Particle.js'

export default class Lightning extends Particle {
    constructor() {
        super(
            State.Gas,
            { r: 255, g: 255, b: 0 }, // Bright yellow color for lightning
            false, // Not fixed
            0,     // Minimal mass
            100,   // High flammability
            0,     // Low combustibility
            1      // Set a low durability for lightning
        )
    }

    step(mutator) {
        // Create a lightning bolt shape from top to bottom
        for (let i = 0; i < 5; i++) { // Create a zigzag effect
            const xOffset = (i % 2 === 0) ? -1 : 1; // Alternate the x offset for zigzag
            const yOffset = i; // Move downwards

            // Check the position below the lightning bolt
            if (mutator.isNot('self', 'Air')) {
                let targetX = mutator.x + xOffset;
                let targetY = mutator.y + yOffset;

                // Check if the target position is within bounds
                if (targetX >= 0 && targetX < mutator.width && targetY >= 0 && targetY < mutator.height) {
                    // Check if the target is flammable
                    if (mutator.is(targetX, targetY, 'Flammable')) {
                        mutator.burn(targetX, targetY); // Ignite flammable materials
                    }

                    // Create a new lightning particle in the target position
                    mutator.set(targetX, targetY, new Lightning());
                }
            }
        }

        // After creating the lightning bolt, the lightning particle itself disappears
        mutator.die(); // Remove the lightning particle
        return mutator;
    }
}
