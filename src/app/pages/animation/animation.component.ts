import { Component, ViewChild } from '@angular/core';
import type {
  FireworksDirective,
  FireworksOptions,
} from '@fireworks-js/angular';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
})
export class AnimationComponent {
  enabled = true;
  candles = Array(30).fill(0);
  options: FireworksOptions = {
    opacity: 0.5, // fillStyle
    acceleration: 1.02,
    friction: 0.97,
    gravity: 1.5,
    particles: 60,
    traceLength: 3,
    traceSpeed: 10,
    explosion: 5,
    intensity: 30,
    flickering: 50,
    lineStyle: 'round',
    lineWidth: {
      explosion: {
        min: 1,
        max: 4,
      },
      trace: {
        min: 0.1,
        max: 1,
      },
    },
    brightness: {
      min: 50,
      max: 80,
    },
    decay: {
      min: 0.015,
      max: 0.03,
    },
  };

  @ViewChild('fireworks') fireworks?: FireworksDirective;
}
