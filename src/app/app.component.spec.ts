import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AnimationComponent } from './pages/animation/animation.component';
import { CountdownComponent } from './pages/countdown/countdown.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, AnimationComponent, CountdownComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
