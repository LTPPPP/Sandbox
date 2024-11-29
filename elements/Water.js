'use strict'

import {State} from '../global.js'
import Particle from './Particle.js'

export default class Water extends Particle {
    constructor() {
        super(
            State.Liquid,
            { r: 90, g: 170, b: 250},
            false,
            100,
            0,
            0,
            100,
        )
    }
}