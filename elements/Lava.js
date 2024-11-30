'use strict'

import {State} from '../global.js'
import Particle from './Particle.js'
import Fire from './Fire.js'
import Block from './Block.js'

export default class Lava extends Particle {
    constructor() {
        super(
            State.Liquid,
            { r: 180, g: 5, b: 5},
            false,
            100,
            0,
            0,
            100,
        )

        this.burning = true
    }

    step(mutator) {
        // Check if there is water around the lava
        if (mutator.is('above', 'Water') || mutator.is('below', 'Water') ||
            mutator.is('left', 'Water') || mutator.is('right', 'Water')) {
            // Replace lava with block
            mutator.self(new Block())
            return mutator
        }

        if (mutator.is('above', 'Air')) {
            mutator.above(new Fire(2))
        }

        if (mutator.isFlammable('above')) {
            mutator.above().burning = true
        }

        return mutator
    }
}
