import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CounterService } from './services/counter.service';
import { AnimationComponent } from './pages/animation/animation.component';
import { CountdownComponent } from './pages/countdown/countdown.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AnimationComponent, CountdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public _counter: CounterService) {
    this._counter.countdown();
  }
}
