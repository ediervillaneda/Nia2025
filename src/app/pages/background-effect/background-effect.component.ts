import { Component, ElementRef, OnDestroy, OnInit, ViewChild, NgZone } from '@angular/core';

@Component({
  selector: 'app-background-effect',
  standalone: true,
  templateUrl: './background-effect.component.html',
  styleUrls: ['./background-effect.component.scss']
})
/**
 * Component responsible for the 3D starfield and fireworks background effect.
 * It uses a 2D canvas to simulate a 3D environment with particles.
 */
export class BackgroundEffectComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;
  private cx = 0;
  private cy = 0;
  private playerZ = -25;
  private playerX = 0;
  private playerY = 0;
  private playerVX = 0;
  private playerVY = 0;
  private playerVZ = 0;
  private pitch = 0;
  private yaw = 0;
  private pitchV = 0;
  private yawV = 0;
  private scale = 600;
  private seedTimer = 0;
  private seedInterval = 5;
  private seedLife = 100;
  private gravity = .02;
  private seeds: any[] = [];
  private sparkPics: HTMLImageElement[] = [];
  private sparks: any[] = [];
  private frames = 0;
  private animationId: number = 0;

  constructor(private ngZone: NgZone) { }

  /**
   * Initializes the component, setting up the canvas and starting the animation loop.
   */
  ngOnInit(): void {
    this.initVars();
    this.ngZone.runOutsideAngular(() => {
      this.frame();
    });
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Handles window resize events to adjust canvas dimensions.
   */
  private onResize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
  }

  /**
   * Initializes canvas context and loads spark images.
   */
  private initVars() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;

    for (let i = 0; i <= 12; ++i) {
      const sparkPic = new Image();
      sparkPic.onload = () => {
        // console.log(`Spark ${i} loaded`);
      };
      sparkPic.onerror = (e) => {
        console.error(`Failed to load spark ${i}`, e);
      };
      sparkPic.src = "assets/spark" + i + ".png";
      this.sparkPics.push(sparkPic);
    }
  }

  /**
   * Projects a 3D point (x, y, z) onto the 2D canvas.
   * Applies rotation (yaw, pitch) and perspective scaling.
   * @param x X coordinate in 3D space.
   * @param y Y coordinate in 3D space.
   * @param z Z coordinate in 3D space.
   * @returns The projected 2D point and its depth/distance.
   */
  private rasterizePoint(x: number, y: number, z: number) {
    let p, d;
    x -= this.playerX;
    y -= this.playerY;
    z -= this.playerZ;
    p = Math.atan2(x, z);
    d = Math.sqrt(x * x + z * z);
    x = Math.sin(p - this.yaw) * d;
    z = Math.cos(p - this.yaw) * d;
    p = Math.atan2(y, z);
    d = Math.sqrt(y * y + z * z);
    y = Math.sin(p - this.pitch) * d;
    z = Math.cos(p - this.pitch) * d;
    const rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z;
    const uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
    if (!uc) return { x: 0, y: 0, d: -1 };
    const ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
    const ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
    if (!z) z = .000000001;
    if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
      return {
        x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
        y: this.cy + y / z * this.scale,
        d: Math.sqrt(x * x + y * y + z * z)
      };
    } else {
      return {
        x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
        y: this.cy + y / z * this.scale,
        d: -1
      };
    }
  }

  /**
   * Spawns a new "seed" (firework launch) with random properties.
   */
  private spawnSeed() {
    const seed: any = {};
    seed.x = -50 + Math.random() * 100;
    seed.y = 25;
    seed.z = -50 + Math.random() * 100;
    seed.vx = .1 - Math.random() * .2;
    seed.vy = -1.5;
    seed.vz = .1 - Math.random() * .2;
    seed.born = this.frames;
    this.seeds.push(seed);
  }

  /**
   * Creates an explosion (sparks) at a specific location.
   * @param x X coordinate of the explosion.
   * @param y Y coordinate of the explosion.
   * @param z Z coordinate of the explosion.
   */
  private splode(x: number, y: number, z: number) {
    const t = 5 + parseInt((Math.random() * 150).toString());
    const sparkV = 1 + Math.random() * 2.5;
    const type = parseInt((Math.random() * 3).toString());
    let pic1: number = 0, pic2: number = 0, pic3: number = 0;
    switch (type) {
      case 0:
        pic1 = parseInt((Math.random() * 10).toString());
        break;
      case 1:
        pic1 = parseInt((Math.random() * 10).toString());
        do { pic2 = parseInt((Math.random() * 10).toString()); } while (pic2 == pic1);
        break;
      case 2:
        pic1 = parseInt((Math.random() * 10).toString());
        do { pic2 = parseInt((Math.random() * 10).toString()); } while (pic2 == pic1);
        do { pic3 = parseInt((Math.random() * 10).toString()); } while (pic3 == pic1 || pic3 == pic2);
        break;
    }
    for (let m = 1; m < t; ++m) {
      const spark: any = {};
      spark.x = x; spark.y = y; spark.z = z;
      const p1 = Math.PI * 2 * Math.random();
      const p2 = Math.PI * Math.random();
      const v = sparkV * (1 + Math.random() / 6);
      spark.vx = Math.sin(p1) * Math.sin(p2) * v;
      spark.vz = Math.cos(p1) * Math.sin(p2) * v;
      spark.vy = Math.cos(p2) * v;
      switch (type) {
        case 0: spark.img = this.sparkPics[pic1]; break;
        case 1:
          spark.img = this.sparkPics[parseInt((Math.random() * 2).toString()) ? pic1 : pic2];
          break;
        case 2:
          switch (parseInt((Math.random() * 3).toString())) {
            case 0: spark.img = this.sparkPics[pic1]; break;
            case 1: spark.img = this.sparkPics[pic2]; break;
            case 2: spark.img = this.sparkPics[pic3]; break;
          }
          break;
      }
      spark.radius = 25 + Math.random() * 50;
      spark.alpha = 1;
      spark.trail = [];
      this.sparks.push(spark);
    }
    // let pow;
    // switch (parseInt((Math.random() * 4).toString())) {
    //   case 0: pow = new Audio("assets/pow1.ogg"); break;
    //   case 1: pow = new Audio("assets/pow2.ogg"); break;
    //   case 2: pow = new Audio("assets/pow3.ogg"); break;
    //   case 3: pow = new Audio("assets/pow4.ogg"); break;
    // }
    // if (pow) {
    //   const d = Math.sqrt((x - this.playerX) * (x - this.playerX) + (y - this.playerY) * (y - this.playerY) + (z - this.playerZ) * (z - this.playerZ));
    //   pow.volume = 1.5 / (1 + d / 10);
    //   pow.play().catch(e => console.log('Audio play failed', e));
    // }
  }

  /**
   * Updates the physics and state of all particles (seeds and sparks).
   * Handles movement, gravity, and lifecycle management.
   */
  private doLogic() {
    if (this.seedTimer < this.frames) {
      this.seedTimer = this.frames + this.seedInterval * Math.random() * 10;
      this.spawnSeed();
    }
    for (let i = 0; i < this.seeds.length; ++i) {
      this.seeds[i].vy += this.gravity;
      this.seeds[i].x += this.seeds[i].vx;
      this.seeds[i].y += this.seeds[i].vy;
      this.seeds[i].z += this.seeds[i].vz;
      if (this.frames - this.seeds[i].born > this.seedLife) {
        this.splode(this.seeds[i].x, this.seeds[i].y, this.seeds[i].z);
        this.seeds.splice(i, 1);
      }
    }
    for (let i = 0; i < this.sparks.length; ++i) {
      if (this.sparks[i].alpha > 0 && this.sparks[i].radius > 5) {
        this.sparks[i].alpha -= .01;
        this.sparks[i].radius /= 1.02;
        this.sparks[i].vy += this.gravity;
        const point: any = {};
        point.x = this.sparks[i].x;
        point.y = this.sparks[i].y;
        point.z = this.sparks[i].z;
        if (this.sparks[i].trail.length) {
          const x = this.sparks[i].trail[this.sparks[i].trail.length - 1].x;
          const y = this.sparks[i].trail[this.sparks[i].trail.length - 1].y;
          const z = this.sparks[i].trail[this.sparks[i].trail.length - 1].z;
          const d = ((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) + (point.z - z) * (point.z - z));
          if (d > 9) {
            this.sparks[i].trail.push(point);
          }
        } else {
          this.sparks[i].trail.push(point);
        }
        if (this.sparks[i].trail.length > 5) this.sparks[i].trail.splice(0, 1);
        this.sparks[i].x += this.sparks[i].vx;
        this.sparks[i].y += this.sparks[i].vy;
        this.sparks[i].z += this.sparks[i].vz;
        this.sparks[i].vx /= 1.075;
        this.sparks[i].vy /= 1.075;
        this.sparks[i].vz /= 1.075;
      } else {
        this.sparks.splice(i, 1);
      }
    }
    const p = Math.atan2(this.playerX, this.playerZ);
    let d = Math.sqrt(this.playerX * this.playerX + this.playerZ * this.playerZ);
    d += Math.sin(this.frames / 80) / 1.25;
    const t = Math.sin(this.frames / 200) / 40;
    this.playerX = Math.sin(p + t) * d;
    this.playerZ = Math.cos(p + t) * d;
    this.yaw = Math.PI + p + t;
  }

  /**
   * Renders the 3D scene (starfield, seeds, sparks) to the canvas.
   */
  private draw() {
    this.ctx.clearRect(0, 0, this.cx * 2, this.cy * 2);

    this.ctx.fillStyle = "#ff8";
    for (let i = -100; i < 100; i += 3) {
      for (let j = -100; j < 100; j += 4) {
        const x = i; const z = j; const y = 25;
        const point = this.rasterizePoint(x, y, z);
        if (point.d != -1) {
          const size = 250 / (1 + point.d);
          const d = Math.sqrt(x * x + z * z);
          const a = 0.75 - Math.pow(d / 100, 6) * 0.75;
          if (a > 0) {
            this.ctx.globalAlpha = a;
            this.ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
          }
        }
      }
    }
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.seeds.length; ++i) {
      const point = this.rasterizePoint(this.seeds[i].x, this.seeds[i].y, this.seeds[i].z);
      if (point.d != -1) {
        const size = 200 / (1 + point.d);
        this.ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }
    }
    const point1: any = {};
    for (let i = 0; i < this.sparks.length; ++i) {
      const point = this.rasterizePoint(this.sparks[i].x, this.sparks[i].y, this.sparks[i].z);
      if (point.d != -1) {
        const size = this.sparks[i].radius * 200 / (1 + point.d);
        if (this.sparks[i].alpha < 0) this.sparks[i].alpha = 0;
        if (this.sparks[i].trail.length) {
          point1.x = point.x;
          point1.y = point.y;
          switch (this.sparks[i].img) {
            case this.sparkPics[0]: this.ctx.strokeStyle = "#f84"; break;
            case this.sparkPics[1]: this.ctx.strokeStyle = "#84f"; break;
            case this.sparkPics[2]: this.ctx.strokeStyle = "#8ff"; break;
            case this.sparkPics[3]: this.ctx.strokeStyle = "#fff"; break;
            case this.sparkPics[4]: this.ctx.strokeStyle = "#4f8"; break;
            case this.sparkPics[5]: this.ctx.strokeStyle = "#f44"; break;
            case this.sparkPics[6]: this.ctx.strokeStyle = "#f84"; break;
            case this.sparkPics[7]: this.ctx.strokeStyle = "#84f"; break;
            case this.sparkPics[8]: this.ctx.strokeStyle = "#fff"; break;
            case this.sparkPics[9]: this.ctx.strokeStyle = "#44f"; break;
          }
          for (let j = this.sparks[i].trail.length - 1; j >= 0; --j) {
            const point2 = this.rasterizePoint(this.sparks[i].trail[j].x, this.sparks[i].trail[j].y, this.sparks[i].trail[j].z);
            if (point2.d != -1) {
              this.ctx.globalAlpha = j / this.sparks[i].trail.length * this.sparks[i].alpha / 2;
              this.ctx.beginPath();
              this.ctx.moveTo(point1.x, point1.y);
              this.ctx.lineWidth = 1 + this.sparks[i].radius * 10 / (this.sparks[i].trail.length - j) / (1 + point2.d);
              this.ctx.lineTo(point2.x, point2.y);
              this.ctx.stroke();
              point1.x = point2.x;
              point1.y = point2.y;
            }
          }
        }
        this.ctx.globalAlpha = this.sparks[i].alpha;
        if (this.sparks[i].img.complete && this.sparks[i].img.naturalHeight !== 0) {
          this.ctx.drawImage(this.sparks[i].img, point.x - size / 2, point.y - size / 2, size, size);
        }
      }
    }
  }

  /**
   * The main animation frame loop.
   * Updates logic and redraws the scene.
   */
  private frame() {
    if (this.frames > 100000) {
      this.seedTimer = 0;
      this.frames = 0;
    }
    this.frames++;
    this.draw();
    this.doLogic();
    this.animationId = requestAnimationFrame(this.frame.bind(this));
  }
}
