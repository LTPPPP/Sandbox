import Mutator from "./Mutator.js";
import * as Elements from "./global.js";

export default class Game {
  // Setup
  canvas;
  context;
  width;
  height;
  particles = [];
  particle_size;
  playing = false;
  iteration = 0;
  iteration_last = 0;
  cursor_size = 10;
  particles_moving = 0;
  particles_total = 0;

  // Mouse
  selection = "Sand";
  clicked = false;
  mouse_x = 1;
  mouse_y = 1;

  // Gravity
  gravityDirection = 1;

  constructor(canvas, width, height) {
    // Set up the canvas
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d", { alpha: false });
    this.width = width;
    this.height = height;
    this.particle_size = this.particle_size = canvas.width / this.width;

    // Initialise particles
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.particles[x * this.height + y] = new Elements.Air();
      }
    }
  }

  Gravity() {
    // Toggle gravity direction
    this.gravityDirection *= -1;

    // Optional: Update UI to show current gravity direction
    const gravityButton = document.querySelector("button.select:nth-child(1)");
    if (gravityButton) {
      gravityButton.innerHTML =
        this.gravityDirection === 1
          ? `<span><i class="fas fa-arrow-down"></i><br>Gravity ↓</span>`
          : `<span><i class="fas fa-arrow-up"></i><br>Gravity ↑</span>`;
    }
  }

  play() {
    this.playing = true;
    this.step();
  }

  pause() {
    this.playing = false;
  }

  clear() {
    // Initialise particles
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.particles[x * this.height + y] = new Elements.Air();
      }
    }
  }

  eraser() {
    this.selection = "Air";
  }

  paint(x, y) {
    let nx = Math.round(x / this.particle_size);
    let ny = Math.round(y / this.particle_size);

    for (let i = -this.cursor_size; i < this.cursor_size / 2; i++) {
      for (let j = -this.cursor_size; j < this.cursor_size / 2; j++) {
        let distance = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));

        // If within cursor circle, replace with Air (erase)
        if (distance <= this.cursor_size / 4) {
          this.setParticle(nx, ny, i, j, new Elements.Air());
        }
      }
    }
  }

  updateMousePosition(event) {
    let bounding = this.canvas.getBoundingClientRect();

    this.mouse_x = event.clientX - bounding.left;
    this.mouse_y = event.clientY - bounding.top;
  }

  updateSelection(selection) {
    this.selection = selection;
  }

  updateCursor() {
    let cursors = [
      this.width / 40,
      this.width / 20,
      this.width / 10,
      this.width / 5,
    ];

    if (cursors.indexOf(this.cursor_size) === cursors.length - 1) {
      this.cursor_size = cursors[0];
    } else {
      this.cursor_size = cursors[cursors.indexOf(this.cursor_size) + 1];
    }

    this.updateCursorIcon();
  }

  updateCursorIcon() {
    const cursorSizeMap = {
      [this.width / 40]: {
        icon: "fas fa-circle",
        text: "Small",
      },
      [this.width / 20]: {
        icon: "fas fa-dot-circle",
        text: "Medium",
      },
      [this.width / 10]: {
        icon: "fas fa-circle-notch",
        text: "Large",
      },
      [this.width / 5]: {
        icon: "fas fa-bullseye",
        text: "Huge",
      },
    };

    const sizeButton = document.querySelector("button.select:nth-child(2)");
    if (sizeButton) {
      const currentSizeConfig = cursorSizeMap[this.cursor_size];
      sizeButton.innerHTML = `<span><i class="fas ${currentSizeConfig.icon}"></i><br>${currentSizeConfig.text}</span>`;
    }
  }

  paint(x, y) {
    let nx = Math.round(x / this.particle_size);
    let ny = Math.round(y / this.particle_size);
    for (let i = -this.cursor_size; i < this.cursor_size / 2; i++) {
      for (let j = -this.cursor_size; j < this.cursor_size / 2; j++) {
        let distance = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));

        if (distance > this.cursor_size / 4) {
          continue;
        }

        if (this.selection === "Air") {
          this.setParticle(nx, ny, i, j, new Elements[this.selection]());
        } else {
          if (
            this.getParticle(nx, ny, i, j) &&
            this.getParticle(nx, ny, i, j).element === "Air"
          ) {
            this.setParticle(nx, ny, i, j, new Elements[this.selection]());
          }
        }
      }
    }
  }

  calculateStats() {
    // FPS
    let fps = this.iteration - this.iteration_last;
    this.iteration_last = this.iteration;

    return {
      state: this.playing ? "Playing" : "Paused",
      fps,
      selection: this.selection,
      particles_moving: this.particles_moving,
      particles_total: this.particles_total,
      gravityDirection: this.gravityDirection === 1 ? "Down⬇️" : "Up⬆️",
      cursor_size: (() => {
        switch (this.cursor_size) {
          case this.width / 40:
            return "Small";
          case this.width / 20:
            return "Medium";
          case this.width / 10:
            return "Large";
          case this.width / 5:
            return "Huge";
          default:
            return "Medium";
        }
      })(),
    };
  }

  step() {
    if (!this.playing) return;

    // If mouse down
    if (this.clicked) {
      this.paint(this.mouse_x, this.mouse_y);
    }

    this.old_particles = this.particles;

    // Increment the iterator
    this.iteration++;

    // Step particles
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.particles[x * this.width + y].iterated(this.iteration)) {
          continue;
        }

        let mutator = new Mutator(
          this.particles,
          this.width,
          x,
          y,
          this.iteration
        );

        // Gravity
        if (
          mutator.isNotFixed("self") &&
          mutator.isNotFixed(this.gravityDirection === 1 ? "below" : "above") &&
          mutator.heavierThan(this.gravityDirection === 1 ? "below" : "above")
        ) {
          mutator.swap("self", this.gravityDirection === 1 ? "below" : "above");
        } else if (
          mutator.isNotFixed("self") &&
          mutator.isLiquid("self") &&
          mutator.is(mutator.randomDirection(), "Gas")
        ) {
          mutator.swap("self", mutator.randomDirection());
        } else if (
          mutator.isNotFixed("self") &&
          mutator.isSolid("self") &&
          mutator.is(
            this.gravityDirection === 1
              ? mutator.randomBelowDirection()
              : mutator.randomAboveDirection(),
            "Gas"
          )
        ) {
          mutator.swap(
            "self",
            this.gravityDirection === 1
              ? mutator.randomBelowDirection()
              : mutator.randomAboveDirection()
          );
        }

        // Liquid
        if (
          mutator.isLiquid("self") &&
          mutator.heavierThan(mutator.randomBelowDirection())
        ) {
          mutator.swap("self", mutator.randomBelowDirection());
        }

        // Gas
        if (
          mutator.isGas("self") &&
          mutator.isNot("self", "Air") &&
          mutator.chance(2 / 100)
        ) {
          let direction = Math.floor(Math.random() * 3 - 1);
          if (
            direction === -1 &&
            mutator.is(mutator.randomAboveDirection(), "Air")
          ) {
            mutator.swap("self", mutator.randomAboveDirection());
          } else if (
            direction === 0 &&
            mutator.is(mutator.randomDirection(), "Air")
          ) {
            mutator.swap("self", mutator.randomDirection());
          } else if (
            direction === 1 &&
            mutator.is(mutator.randomBelowDirection(), "Air")
          ) {
            mutator.swap("self", mutator.randomBelowDirection());
          }
        }

        // Burning
        if (mutator.isBurning()) {
          // Decrease durability
          if (mutator.self().durability !== 100) {
            mutator.self().durability--;
          }

          // Die if out of durability
          if (mutator.self().durability < 0) {
            if (mutator.is("self", "Fire")) {
              mutator.die();
            } else {
              mutator.self(new Elements.Fire());
            }

            this.particles = mutator.particles;
            continue;

            // Give off fire
          } else if (
            mutator.isNot("self", "Fire") &&
            mutator.isNot("self", "Lava") &&
            mutator.is("above", "Air")
          ) {
            mutator.above(new Elements.Fire());
          }
        }

        // If not Air, step
        // If not Air, step
        if (!mutator.is("self", "Air")) {
          const stepResult = this.particles[x * this.width + y].step(
            mutator,
            this.iteration
          );
          if (stepResult && stepResult.particles) {
            this.particles = stepResult.particles;
          }
        }
      }
    }

    this.draw();

    window.setTimeout(() => {
      this.step();
    });
  }

  draw() {
    let particles_total = 0;
    let particles_moving = 0;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.particles[x * this.width + y].element !== "Air") {
          particles_total++;
        }

        if (this.particles[x * this.width + y].redraw) {
          this.context.fillStyle =
            this.particles[x * this.width + y].getColour();
          this.context.fillRect(
            x * this.particle_size,
            y * this.particle_size,
            this.particle_size,
            this.particle_size
          );

          this.particles[x * this.width + y].redraw = false;

          particles_moving++;
        }
      }
    }

    this.particles_moving = particles_moving;
    this.particles_total = particles_total;
  }

  setParticle(x, y, ox, oy, particle) {
    let nx = x + ox;
    let ny = y + oy;

    // Set bounds of top and bottom
    if (
      y < 0 - oy || // Top
      y > this.height - 1 - oy // Bottom
    ) {
      return;
    }

    this.particles[nx * this.width + ny] = particle;
  }

  getParticle(x, y, ox, oy) {
    let nx = x + ox;
    let ny = y + oy;

    return this.particles[nx * this.width + ny];
  }
}
