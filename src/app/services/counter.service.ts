import { Injectable } from '@angular/core';

import { Counter } from '../interfaces/counter.interface';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private readonly birthDay = new Date(2025, 3, 7, 0, 0).getTime();
  private readonly MS_IN_SECOND = 1000;
  private readonly MS_IN_MINUTE = this.MS_IN_SECOND * 60;
  private readonly MS_IN_HOUR = this.MS_IN_MINUTE * 60;
  private readonly MS_IN_DAY = this.MS_IN_HOUR * 24;

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

  countdown() {
    // get today's date
    const now = new Date().getTime();
    const diff = this.birthDay - now;

    this.cnt.days = Math.floor(diff / this.MS_IN_DAY);
    this.cnt.hours = Math.floor((diff % this.MS_IN_DAY) / this.MS_IN_HOUR);
    this.cnt.minutes = Math.floor((diff % this.MS_IN_HOUR) / this.MS_IN_MINUTE);
    this.cnt.seconds = Math.floor((diff % this.MS_IN_MINUTE) / this.MS_IN_SECOND);

    if (diff >= 0) {
      this.cnt.status = 0;
    }
  }
}
