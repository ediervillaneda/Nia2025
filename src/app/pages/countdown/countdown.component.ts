import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID, isDevMode } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CounterService } from '../../services/counter.service';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  host: { 'class': 'countdown' },
})
export class CountdownComponent implements OnInit, OnDestroy {
  id: ReturnType<typeof setTimeout> | undefined;
  isDev = isDevMode();

  constructor(
    public _counter: CounterService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._counter.countdown();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.id = setInterval(() => this._counter.countdown(), 1000);
    }
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  toggleTest() {
    this._counter.toggleTestFinish();
  }
}
