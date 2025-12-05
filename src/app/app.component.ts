import { Component } from '@angular/core';
import { CounterService } from './services/counter.service';
import { AnimationComponent } from './pages/animation/animation.component';
import { CountdownComponent } from './pages/countdown/countdown.component';
import { ShapeShifterComponent } from './pages/shape-shifter/shape-shifter.component';
import { BackgroundEffectComponent } from './pages/background-effect/background-effect.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AnimationComponent, CountdownComponent, ShapeShifterComponent, BackgroundEffectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public _counter: CounterService) {
    this._counter.countdown();
  }
}
