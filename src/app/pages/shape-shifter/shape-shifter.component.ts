import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../services/config.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shape-shifter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shape-shifter.component.html',
  styleUrls: ['./shape-shifter.component.scss']
})
/**
 * Component responsible for the "Shape Shifter" animation effect.
 * It manages a canvas where particles (dots) form text and shapes.
 */
export class ShapeShifterComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  activeTab = 0;
  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private renderFn: (() => void) | null = null;
  private requestFrameId: number = 0;

  private dots: Dot[] = [];
  private width = 0;
  private height = 0;
  private cx = 0;
  private cy = 0;

  // UI vars
  private interval: any;
  private currentAction: number = 0;
  private time: string | null = null;
  private maxShapeSize = 30;
  private sequence: string[] = [];
  private cmd = '#';
  private cakeImage = new Image();
  private cakeLoaded = false;

  // ShapeBuilder vars
  private shapeCanvas = document.createElement('canvas');
  private shapeContext = this.shapeCanvas.getContext('2d')!;
  private gap = 13;
  private fontSize = 500;
  private fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

  constructor(private ngZone: NgZone, private configService: ConfigService) { }

  /**
   * Initializes the component, setting up drawing, shape builder, and UI.
   * Starts the animation loop.
   */
  ngOnInit(): void {
    this.initDrawing();
    this.initShapeBuilder();
    this.preloadCake();
    this.initUI();

    this.loop(() => {
      this.renderShape();
    });
  }

  /**
   * Preloads the cake image to be used in the animation.
   */
  private preloadCake() {
    this.cakeImage.src = 'assets/cake.jpg';
    this.cakeImage.onload = () => {
      this.cakeLoaded = true;
    };
  }

  ngOnDestroy(): void {
    if (this.requestFrameId) {
      cancelAnimationFrame(this.requestFrameId);
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    window.removeEventListener('resize', this.adjustCanvas.bind(this));
  }

  activateTab(index: number) {
    this.activeTab = index;
  }

  // --- Drawing Logic ---

  /**
   * Initializes the main canvas and context.
   */
  private initDrawing() {
    this.canvas = this.canvasRef.nativeElement;
    this.context = this.canvas.getContext('2d')!;
    this.adjustCanvas();
    window.addEventListener('resize', this.adjustCanvas.bind(this));
  }

  /**
   * Adjusts the canvas size to match the window size.
   */
  private adjustCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = 0; // Force re-calculation in compensate
    this.height = 0;
  }

  /**
   * Clears the entire canvas frame.
   */
  private clearFrame() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getArea() {
    return { w: this.canvas.width, h: this.canvas.height };
  }

  /**
   * Draws a single circle (dot) on the canvas.
   * @param p The point (coordinates) of the dot.
   * @param c The color of the dot.
   */
  private drawCircle(p: Point, c: Color) {
    this.context.fillStyle = c.render();
    this.context.beginPath();
    this.context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
    this.context.closePath();
    this.context.fill();
  }

  /**
   * The main animation loop.
   * Uses requestAnimationFrame to continuously render the scene.
   * Runs outside Angular zone for performance.
   * @param fn The render function to call in each frame.
   */
  private loop(fn: () => void) {
    this.renderFn = !this.renderFn ? fn : this.renderFn;
    this.clearFrame();
    this.renderFn();
    this.ngZone.runOutsideAngular(() => {
      this.requestFrameId = requestAnimationFrame(this.loop.bind(this, this.renderFn!));
    });
  }

  // --- UI Logic ---

  /**
   * Initializes the UI and starts the default animation sequence.
   */
  private initUI() {
    document.body.classList.add('body--ready');
    // Default action from config or fallback
    const config = this.configService.getConfig();
    const sequence = config ? config.sequence : '|#countdown 3|*|Feliz|Cumple|a ti|❤|#customShape|';
    this.simulate(sequence);
  }

  /**
   * Simulates an action by calling performAction.
   * @param action The action string to simulate.
   */
  private simulate(action: string) {
    this.performAction(action);
  }

  /**
   * Parses and executes a sequence of actions.
   * Handles commands like #countdown, #rectangle, #circle, #time, #cake, and text.
   * @param value The action string or array of strings.
   */
  private performAction(value: string | string[]) {
    let action, current: string;
    this.sequence = typeof (value) === 'object' ? value : this.sequence.concat(value.split('|'));

    this.timedAction((index) => {
      current = this.sequence.shift()!;
      if (!current) return;
      action = this.getAction(current);
      let val = this.getValue(current);

      switch (action) {
        case 'countdown':
          let v = parseInt(val) || 10;
          v = v > 0 ? v : 10;

          this.timedAction((index) => {
            if (index === 0) {
              if (this.sequence.length === 0) {
                this.switchShape(this.letter(''));
              } else {
                this.performAction(this.sequence);
              }
            } else {
              this.switchShape(this.letter(index.toString()), true);
            }
          }, 1000, v, true);
          break;

        case 'customShape':
          this.switchShape(this.renderCustomShape());
          break;

        case 'rectangle':
          let vals = val && val.split('x');
          vals = (vals && vals.length === 2) ? vals : [this.maxShapeSize.toString(), (this.maxShapeSize / 2).toString()];
          this.switchShape(this.rectangle(Math.min(this.maxShapeSize, parseInt(vals[0])), Math.min(this.maxShapeSize, parseInt(vals[1]))));
          break;

        case 'circle':
          let vc = parseInt(val) || this.maxShapeSize;
          vc = Math.min(vc, this.maxShapeSize);
          this.switchShape(this.circle(vc));
          break;

        case 'time':
          let t = this.formatTime(new Date());
          if (this.sequence.length > 0) {
            this.switchShape(this.letter(t));
          } else {
            this.timedAction(() => {
              t = this.formatTime(new Date());
              if (t !== this.time) {
                this.time = t;
                this.switchShape(this.letter(this.time));
              }
            }, 1000);
          }
          break;

        default:
          this.switchShape(this.letter(current[0] === this.cmd ? 'What?' : current));
      }
    }, 2000, this.sequence.length);
  }

  /**
   * Executes a function repeatedly with a delay, useful for countdowns or sequences.
   * @param fn The function to execute.
   * @param delay The delay between executions in milliseconds.
   * @param max The maximum number of executions.
   * @param reverse Whether to count down (true) or up (false).
   */
  private timedAction(fn: (index: number) => void, delay: number, max?: number, reverse?: boolean) {
    clearInterval(this.interval);
    this.currentAction = reverse ? max! : 1;
    fn(this.currentAction);

    if (!max || (!reverse && this.currentAction < max) || (reverse && this.currentAction > 0)) {
      this.interval = setInterval(() => {
        this.currentAction = reverse ? this.currentAction - 1 : this.currentAction + 1;
        fn(this.currentAction);

        if ((!reverse && max && this.currentAction === max) || (reverse && this.currentAction === 0)) {
          clearInterval(this.interval);
        }
      }, delay);
    }
  }

  /**
   * Extracts the command action from a string (e.g., "countdown" from "#countdown 3").
   * @param value The string to parse.
   */
  private getAction(value: string) {
    value = value && value.split(' ')[0];
    return value && value[0] === this.cmd && value.substring(1);
  }

  /**
   * Extracts the value associated with a command (e.g., "3" from "#countdown 3").
   * @param value The string to parse.
   */
  private getValue(value: string) {
    return value && value.split(' ')[1];
  }

  private formatTime(date: Date) {
    const h = date.getHours();
    let m: any = date.getMinutes();
    m = m < 10 ? '0' + m : m;
    return h + ':' + m;
  }

  private initShapeBuilder() {
    this.fit();
    window.addEventListener('resize', this.fit.bind(this));
  }

  private fit() {
    this.shapeCanvas.width = Math.floor(window.innerWidth / this.gap) * this.gap;
    this.shapeCanvas.height = Math.floor(window.innerHeight / this.gap) * this.gap;
    this.shapeContext.fillStyle = 'red';
    this.shapeContext.textBaseline = 'middle';
    this.shapeContext.textAlign = 'center';
  }

  private setFontSize(s: number) {
    this.shapeContext.font = 'bold ' + s + 'px ' + this.fontFamily;
  }

  private isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  private processCanvas() {
    const pixels = this.shapeContext.getImageData(0, 0, this.shapeCanvas.width, this.shapeCanvas.height).data;
    const dots = [];
    let x = 0;
    let y = 0;
    let fx = this.shapeCanvas.width;
    let fy = this.shapeCanvas.height;
    let w = 0;
    let h = 0;

    for (let p = 0; p < pixels.length; p += (4 * this.gap)) {
      if (pixels[p + 3] > 0) {
        dots.push(new Point({
          x: x,
          y: y,
          r: pixels[p],
          g: pixels[p + 1],
          b: pixels[p + 2]
        }));
        w = x > w ? x : w;
        h = y > h ? y : h;
        fx = x < fx ? x : fx;
        fy = y < fy ? y : fy;
      }
      x += this.gap;
      if (x >= this.shapeCanvas.width) {
        x = 0;
        y += this.gap;
        p += this.gap * 4 * this.shapeCanvas.width;
      }
    }
    return { dots: dots, w: w + fx, h: h + fy };
  }

  private letter(l: string) {
    let s = 0;
    this.setFontSize(this.fontSize);
    s = Math.min(this.fontSize,
      (this.shapeCanvas.width / this.shapeContext.measureText(l).width) * 0.8 * this.fontSize,
      (this.shapeCanvas.height / this.fontSize) * (this.isNumber(l) ? 1 : 0.45) * this.fontSize);
    this.setFontSize(s);
    this.shapeContext.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
    this.shapeContext.fillText(l, this.shapeCanvas.width / 2, this.shapeCanvas.height / 2);
    return this.processCanvas();
  }

  private rectangle(w: number, h: number) {
    const dots = [];
    const width = this.gap * w;
    const height = this.gap * h;

    for (let y = 0; y < height; y += this.gap) {
      for (let x = 0; x < width; x += this.gap) {
        dots.push(new Point({ x: x, y: y }));
      }
    }

    return { dots: dots, w: width, h: height };
  }

  private circle(d: number) {
    const r = Math.max(0, d) / 2;
    this.shapeContext.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
    this.shapeContext.beginPath();
    this.shapeContext.arc(r * this.gap, r * this.gap, r * this.gap, 0, 2 * Math.PI, false);
    this.shapeContext.fill();
    this.shapeContext.closePath();
    return this.processCanvas();
  }

  private renderCustomShape() {
    this.shapeContext.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);

    const config = this.configService.getConfig();
    const grid = config && config.customShape ? config.customShape.grid : [];

    if (!grid || grid.length === 0) {
      return this.processCanvas();
    }

    const colors: { [key: number]: string } = {
      1: '#EF74AC', // Pink
      2: '#F9BC95', // Light Brown
      3: '#FAB001', // Orange
      4: '#000000', // Black
      5: '#02A6E5', // Blue
      6: '#673C90', // Violet
      7: '#87BC36'  // Green
    };

    const cellSize = this.gap;
    const startX = (this.shapeCanvas.width - grid[0].length * cellSize) / 2;
    const startY = (this.shapeCanvas.height - grid.length * cellSize) / 2;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const colorCode = grid[r][c];
        if (colorCode !== 0) {
          this.shapeContext.fillStyle = colors[colorCode];
          this.shapeContext.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
        }
      }
    }

    return this.processCanvas();
  }

  private compensate() {
    const a = this.getArea();
    this.cx = a.w / 2 - this.width / 2;
    this.cy = a.h / 2 - this.height / 2;
  }

  /**
   * Transitions from the current shape to a new one.
   * Manages the movement of dots to form the new shape.
   * @param n The new shape data (dots and dimensions).
   * @param fast Whether to transition quickly.
   */
  private switchShape(n: { dots: Point[], w: number, h: number }, fast?: boolean) {
    const a = this.getArea();
    this.width = n.w;
    this.height = n.h;
    this.compensate();

    if (n.dots.length > this.dots.length) {
      const size = n.dots.length - this.dots.length;
      for (let d = 1; d <= size; d++) {
        this.dots.push(new Dot(a.w / 2, a.h / 2));
      }
    }

    let d = 0;
    let i = 0;

    while (n.dots.length > 0) {
      i = Math.floor(Math.random() * n.dots.length);
      this.dots[d].e = fast ? 0.25 : (this.dots[d].s ? 0.14 : 0.11);

      if (this.dots[d].s) {
        this.dots[d].move(new Point({
          z: Math.random() * 20 + 10,
          a: Math.random(),
          h: 18
        }));
      } else {
        this.dots[d].move(new Point({
          z: Math.random() * 5 + 5,
          h: fast ? 18 : 30
        }));
      }

      this.dots[d].s = true;
      this.dots[d].move(new Point({
        x: n.dots[i].x + this.cx,
        y: n.dots[i].y + this.cy,
        a: 1,
        z: 5,
        h: 0
      }));

      this.dots[d].c.r = n.dots[i].r;
      this.dots[d].c.g = n.dots[i].g;
      this.dots[d].c.b = n.dots[i].b;

      n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
      d++;
    }

    for (let i = d; i < this.dots.length; i++) {
      if (this.dots[i].s) {
        this.dots[i].move(new Point({
          z: Math.random() * 20 + 10,
          a: Math.random(),
          h: 20
        }));

        this.dots[i].s = false;
        this.dots[i].e = 0.04;
        this.dots[i].move(new Point({
          x: Math.random() * a.w,
          y: Math.random() * a.h,
          a: 0.3,
          z: Math.random() * 4,
          h: 0
        }));
      }
    }
  }

  /**
   * Renders the current state of all dots to the canvas.
   */
  private renderShape() {
    for (let d = 0; d < this.dots.length; d++) {
      // Inlined Dot.render logic to access drawCircle
      this.dots[d].update();
      this.dots[d].c.a = this.dots[d].p.a;
      this.drawCircle(this.dots[d].p, this.dots[d].c);
    }
  }

}


// --- Helper Classes ---

/**
 * Represents a point in 3D space with color and animation properties.
 */
class Point {
  x: number;
  y: number;
  z: number;
  a: number;
  h: number;
  r: number;
  g: number;
  b: number;

  constructor(args: any) {
    this.x = args.x || 0;
    this.y = args.y || 0;
    this.z = args.z || 0;
    this.a = args.a || 0;
    this.h = args.h || 0;
    this.r = args.r || 255;
    this.g = args.g || 255;
    this.b = args.b || 255;
  }
}

/**
 * Represents an RGBA color.
 */
class Color {
  constructor(public r: number, public g: number, public b: number, public a: number) { }

  render() {
    return 'rgba(' + this.r + ',' + + this.g + ',' + this.b + ',' + this.a + ')';
  }
}

/**
 * Represents a dot (particle) in the animation.
 * Handles its own movement and rendering state.
 */
class Dot {
  p: Point;
  e: number;
  s: boolean;
  c: Color;
  t: Point;
  q: Point[];

  constructor(x: number, y: number) {
    this.p = new Point({
      x: x,
      y: y,
      z: 5,
      a: 1,
      h: 0
    });
    this.e = 0.07;
    this.s = true;
    this.c = new Color(255, 255, 255, this.p.a);
    this.t = this.clone();
    this.q = [];
  }

  clone() {
    return new Point({
      x: this.p.x,
      y: this.p.y,
      z: this.p.z,
      a: this.p.a,
      h: this.p.h
    });
  }

  move(p: Point, avoidStatic?: boolean) {
    if (!avoidStatic || (avoidStatic && (this.distanceTo(p) as number) > 1)) {
      this.q.push(p);
    }
  }

  update() {
    if (this.moveTowards(this.t)) {
      const p = this.q.shift();

      if (p) {
        this.t.x = p.x || this.p.x;
        this.t.y = p.y || this.p.y;
        this.t.z = p.z || this.p.z;
        this.t.a = p.a || this.p.a;
        this.p.h = p.h || 0;
      } else {
        if (this.s) {
          this.p.x -= Math.sin(Math.random() * 3.142);
          this.p.y -= Math.sin(Math.random() * 3.142);
        } else {
          this.move(new Point({
            x: this.p.x + (Math.random() * 50) - 25,
            y: this.p.y + (Math.random() * 50) - 25,
          }));
        }
      }
    }

    let d = this.p.a - this.t.a;
    this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
    d = this.p.z - this.t.z;
    this.p.z = Math.max(1, this.p.z - (d * 0.05));
  }

  moveTowards(n: Point) {
    const details = this.distanceTo(n, true) as number[];
    const dx = details[0];
    const dy = details[1];
    const d = details[2];
    const e = this.e * d;

    if (this.p.h === -1) {
      this.p.x = n.x;
      this.p.y = n.y;
      return true;
    }

    if (d > 1) {
      this.p.x -= ((dx / d) * e);
      this.p.y -= ((dy / d) * e);
    } else {
      if (this.p.h > 0) {
        this.p.h--;
      } else {
        return true;
      }
    }

    return false;
  }

  distanceTo(n: Point, details?: boolean) {
    const dx = this.p.x - n.x;
    const dy = this.p.y - n.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    return details ? [dx, dy, d] : d;
  }
}
