import { Injectable, isDevMode } from '@angular/core';

import { Counter } from '../interfaces/counter.interface';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private readonly birthDay = new Date(2025, 11, 12, 0, 0).getTime();
  private readonly MS_IN_SECOND = 1000;
  private readonly MS_IN_MINUTE = this.MS_IN_SECOND * 60;
  private readonly MS_IN_HOUR = this.MS_IN_MINUTE * 60;
  private readonly MS_IN_DAY = this.MS_IN_HOUR * 24;

  private testFinished = false;

  cnt: Counter = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 3,
  };

  constructor() {
    this.countdown();
  }

  toggleTestFinish() {
    if (isDevMode()) {
      this.testFinished = !this.testFinished;
      this.countdown();
    }
  }

  countdown() {
    // get today's date
    let now = new Date().getTime();

    if (isDevMode() && this.testFinished) {
      now = this.birthDay + 1000;
    }

    const diff = this.birthDay - now;

    this.cnt.days = Math.floor(diff / this.MS_IN_DAY);
    this.cnt.hours = Math.floor((diff % this.MS_IN_DAY) / this.MS_IN_HOUR);
    this.cnt.minutes = Math.floor((diff % this.MS_IN_HOUR) / this.MS_IN_MINUTE);
    this.cnt.seconds = Math.floor((diff % this.MS_IN_MINUTE) / this.MS_IN_SECOND);

    if (diff >= 0) {
      this.cnt.status = 0;
    } else {
      // Optional: Handle expired state if not already handled
      // For now, we just let the negative values show or let the user handle it
      // But usually we want to stop at 0
      this.cnt.days = 0;
      this.cnt.hours = 0;
      this.cnt.minutes = 0;
      this.cnt.seconds = 0;
      this.cnt.status = 1; // Assuming 1 is finished/celebration
    }
  }
}
