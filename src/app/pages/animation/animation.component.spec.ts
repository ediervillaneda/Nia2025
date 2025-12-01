import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationComponent } from './animation.component';
import { NgFireworksModule } from '@fireworks-js/angular';

describe('AnimationComponent', () => {
  let component: AnimationComponent;
  let fixture: ComponentFixture<AnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnimationComponent, NgFireworksModule]
    });
    fixture = TestBed.createComponent(AnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
