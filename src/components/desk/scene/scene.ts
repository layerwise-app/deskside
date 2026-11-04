import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildComputer, SCREEN } from './computer';
import { CrtScreen, type Channel } from './crt';
import { buildMug } from './mug';
import { rng } from './textures';

export type SceneColors = {
  paper: string;
  paperDeep: string;
  beige: string;
  glaze: string;
  desk: string;
};

export type ScreenRect = { x: number; y: number; width: number; height: number };

type Options = {
  channels: Channel[];
  index: number;
  colors: SceneColors;
  monoFont: string;
  reducedMotion: boolean;
  /** Start zoomed into the screen and pull back, after returning from a case study. */
  returning: boolean;
  onScreenRect: (rect: ScreenRect) => void;
  onFirstFrame: () => void;
};

const BASE_ASPECT = 1.6;
const BASE_FOV = 27;
const TARGET = new THREE.Vector3(0.35, 1.68, 0);
const DISTANCE = 15.2;
const BASE_YAW = 0.06;
const BASE_PITCH = 0.17;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The desk: renderer, camera rig, objects, and interaction. It renders only
 * when something moves and stops entirely when the page is hidden or the
 * canvas is off screen.
 */
export class DeskScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(BASE_FOV, BASE_ASPECT, 0.5, 120);
  private crt: CrtScreen;
  private glass: THREE.Mesh;
  private container: HTMLElement;
  private opts: Options;

  // Camera rig state.
  private drift = new THREE.Vector2();
  private driftTarget = new THREE.Vector2();
  private orbit = new THREE.Vector2();
  private orbitVel = new THREE.Vector2();
  private dragging = false;
  private dragStart = new THREE.Vector2();
  private dragOrbitStart = new THREE.Vector2();
  private zoom = 0;
  private zoomAnim: {
    from: number;
    to: number;
    start: number;
    duration: number;
    resolve: () => void;
    onProgress?: (t: number) => void;
  } | null = null;

  private raf = 0;
  private last = 0;
  private running = false;
  private visible = true;
  private pageVisible = true;
  private wakeTimer = 0;
  private firstFrame = false;
  private disposed = false;
  private cleanups: (() => void)[] = [];

  constructor(container: HTMLElement, opts: Options) {
    this.container = container;
    this.opts = opts;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.88;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    this.crt = new CrtScreen(opts.channels, opts.index, opts.monoFont);
    this.crt.onImageLoad = () => this.wake();

    const { glass } = this.build();
    this.glass = glass;

    if (opts.returning && !opts.reducedMotion) {
      this.zoom = 1;
      requestAnimationFrame(() => this.animateZoom(0, 1100));
    }

    this.bind();
    this.resize();
    this.renderer.shadowMap.needsUpdate = true;
    this.wake();
    // Covers for the other channels load after the first frame.
    setTimeout(() => this.crt.preloadAll(), 600);
  }

  private build() {
    const { colors } = this.opts;
    const scene = this.scene;
    scene.background = new THREE.Color(colors.paper);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    pmrem.dispose();

    // Light: one soft key from the upper left, a dim fill, and the room.
    const hemi = new THREE.HemisphereLight('#ffffff', '#aeaca6', 0.5);
    scene.add(hemi);
    const key = new THREE.DirectionalLight('#fffcf6', 3.2);
    key.position.set(-6.5, 10, 7.5);
    key.target.position.set(0.5, 0, -1);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -9;
    key.shadow.camera.right = 9;
    key.shadow.camera.top = 9;
    key.shadow.camera.bottom = -9;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.radius = 9;
    key.shadow.blurSamples = 16;
    key.shadow.bias = -0.0004;
    scene.add(key, key.target);
    const fill = new THREE.DirectionalLight('#eef2ff', 0.35);
    fill.position.set(8, 4, 6);
    scene.add(fill);

    // The desk top, curving up into a seamless paper sweep behind.
    const sweep = new THREE.Mesh(
      coveGeometry(),
      new THREE.MeshStandardMaterial({ map: this.sweepTexture(), roughness: 0.95 })
    );
    sweep.receiveShadow = true;
    scene.add(sweep);

    const computer = buildComputer({
      beige: colors.beige,
      screenTexture: this.crt.texture,
      monoFont: this.opts.monoFont
    });
    computer.group.position.set(-0.55, 0, -0.2);
    computer.group.rotation.y = 0.2;
    scene.add(computer.group);

    const mug = buildMug(colors.glaze);
    mug.position.set(2.6, 0, 1.2);
    mug.rotation.y = -2.5;
    scene.add(mug);

    // Contact shadows keep the objects seated on the desk.
    scene.add(this.contactShadow(3.6, 3.2, 0.5, new THREE.Vector3(-0.55, 0.004, -0.3), 0.14));
    scene.add(this.contactShadow(1.25, 1.25, 0.45, new THREE.Vector3(2.6, 0.005, 1.2), 0));

    return { glass: computer.glass };
  }

  /** Light falloff along the sweep: brightest on the curve behind the desk. */
  private sweepTexture() {
    const { colors } = this.opts;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const x = c.getContext('2d')!;
    // v runs from the front of the desk (bottom) to the top of the wall.
    const g = x.createLinearGradient(0, 1024, 0, 0);
    g.addColorStop(0, '#c9c8c3');
    g.addColorStop(0.12, colors.paperDeep);
    g.addColorStop(0.3, colors.desk);
    g.addColorStop(0.5, '#f3f3f1');
    g.addColorStop(0.66, colors.paper);
    g.addColorStop(1, '#d9d9d5');
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 1024);
    // A soft pool of light from the left, where the key light sits.
    const r = x.createRadialGradient(170, 520, 10, 170, 520, 520);
    r.addColorStop(0, 'rgba(255,255,255,0.32)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = r;
    x.fillRect(0, 0, 512, 1024);
    // Fine paper grain.
    const rand = rng(19);
    const img = x.getImageData(0, 0, 512, 1024);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rand() - 0.5) * 5;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    x.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  private contactShadow(w: number, d: number, opacity: number, at: THREE.Vector3, rot: number) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, `rgba(40,34,26,${opacity})`);
    g.addColorStop(0.55, `rgba(40,34,26,${opacity * 0.45})`);
    g.addColorStop(1, 'rgba(40,34,26,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rot;
    mesh.position.copy(at);
    mesh.renderOrder = 1;
    return mesh;
  }

  // ————— Interaction —————

  private bind() {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      this.driftTarget.set(nx, ny);
      if (this.dragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.orbit.set(
          clamp(this.dragOrbitStart.x - dx * 0.0042, -0.55, 0.55),
          clamp(this.dragOrbitStart.y + dy * 0.0026, -0.1, 0.2)
        );
      }
      this.wake();
    };
    const onLeave = () => {
      this.driftTarget.set(0, 0);
      this.wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || this.zoomAnim) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-orbit]')) return;
      this.dragging = true;
      this.dragStart.set(e.clientX, e.clientY);
      this.dragOrbitStart.copy(this.orbit);
      this.orbitVel.set(0, 0);
      this.container.dataset.dragging = 'true';
    };
    const onUp = () => {
      if (!this.dragging) return;
      this.dragging = false;
      delete this.container.dataset.dragging;
      this.wake();
    };
    const onVisibility = () => {
      this.pageVisible = document.visibilityState === 'visible';
      if (this.pageVisible) this.wake();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    const surface = this.container.parentElement ?? this.container;
    surface.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      this.resize();
      this.wake();
    });
    ro.observe(this.container);
    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.wake();
    });
    io.observe(this.container);

    this.cleanups.push(() => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      surface.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      io.disconnect();
    });
  }

  setChannel(index: number) {
    this.crt.set(index, !this.opts.reducedMotion);
    this.wake();
  }

  /** Push the camera into the glass. Resolves when the screen fills the view. */
  zoomIn(onProgress?: (t: number) => void) {
    if (this.opts.reducedMotion) return Promise.resolve();
    return this.animateZoom(1, 820, onProgress);
  }

  private animateZoom(to: number, duration: number, onProgress?: (t: number) => void) {
    return new Promise<void>((resolve) => {
      this.zoomAnim?.resolve();
      this.zoomAnim = {
        from: this.zoom,
        to,
        start: performance.now(),
        duration,
        resolve,
        onProgress
      };
      this.wake();
    });
  }

  private resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Keep the whole desk in frame on narrower windows.
    this.camera.fov =
      aspect < BASE_ASPECT
        ? THREE.MathUtils.radToDeg(
            2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * (BASE_ASPECT / aspect))
          )
        : BASE_FOV;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  // ————— Loop —————

  private wake() {
    if (this.disposed || this.running) return;
    if (!this.visible || !this.pageVisible) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    if (this.disposed) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    let active = false;

    // Pointer drift, eased.
    if (!this.opts.reducedMotion) {
      const k = 1 - Math.exp(-dt * 3.2);
      this.drift.lerp(this.driftTarget, k);
      if (this.drift.distanceToSquared(this.driftTarget) > 1e-6) active = true;
    }

    // Drag orbit, and a spring back to rest once released.
    if (!this.dragging && (this.orbit.lengthSq() > 1e-7 || this.orbitVel.lengthSq() > 1e-7)) {
      const stiffness = 70;
      const damping = 11;
      const ax = -stiffness * this.orbit.x - damping * this.orbitVel.x;
      const ay = -stiffness * this.orbit.y - damping * this.orbitVel.y;
      this.orbitVel.x += ax * dt;
      this.orbitVel.y += ay * dt;
      this.orbit.x += this.orbitVel.x * dt;
      this.orbit.y += this.orbitVel.y * dt;
      active = true;
      if (this.opts.reducedMotion) this.orbit.set(0, 0);
    }
    if (this.dragging) active = true;

    // Zoom into or out of the screen.
    if (this.zoomAnim) {
      const z = this.zoomAnim;
      const t = Math.min(1, (now - z.start) / z.duration);
      this.zoom = z.from + (z.to - z.from) * easeInOut(t);
      z.onProgress?.(t);
      if (t >= 1) {
        this.zoomAnim = null;
        z.resolve();
      } else active = true;
    }

    if (this.crt.update(now)) active = true;

    this.place();
    this.renderer.render(this.scene, this.camera);
    this.reportScreen();
    if (!this.firstFrame) {
      this.firstFrame = true;
      this.opts.onFirstFrame();
    }

    if (active && this.visible && this.pageVisible) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
      const wait = this.crt.nextWake(now);
      clearTimeout(this.wakeTimer);
      if (wait > 0) this.wakeTimer = window.setTimeout(() => this.wake(), wait + 16);
    }
  };

  private rest = new THREE.Vector3();
  private look = new THREE.Vector3();
  private screenCenter = new THREE.Vector3();
  private screenNormal = new THREE.Vector3();
  private zoomPos = new THREE.Vector3();

  private place() {
    const yaw = BASE_YAW + this.drift.x * 0.045 + this.orbit.x;
    const pitch = BASE_PITCH - this.drift.y * 0.022 + this.orbit.y;
    this.rest.set(
      TARGET.x + DISTANCE * Math.cos(pitch) * Math.sin(yaw),
      TARGET.y + DISTANCE * Math.sin(pitch),
      TARGET.z + DISTANCE * Math.cos(pitch) * Math.cos(yaw)
    );

    if (this.zoom <= 0.0001) {
      this.camera.position.copy(this.rest);
      this.camera.lookAt(TARGET);
      return;
    }

    // Close-up pose: square to the glass, near enough that it fills the view.
    this.glass.getWorldPosition(this.screenCenter);
    this.screenNormal.set(0, 0, 1).transformDirection(this.glass.matrixWorld);
    const halfV = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const fitH = (SCREEN.height / 2) / Math.tan(halfV);
    const fitW = (SCREEN.width / 2) / (Math.tan(halfV) * this.camera.aspect);
    const dist = Math.min(fitH, fitW) * 0.86;
    this.zoomPos.copy(this.screenCenter).addScaledVector(this.screenNormal, dist + 0.05);

    const t = this.zoom;
    this.camera.position.lerpVectors(this.rest, this.zoomPos, t);
    this.look.lerpVectors(TARGET, this.screenCenter, Math.min(1, t * 1.25));
    this.camera.lookAt(this.look);
  }

  private corners = [0, 1, 2, 3].map(() => new THREE.Vector3());
  private reportScreen() {
    const hw = SCREEN.width / 2;
    const hh = SCREEN.height / 2;
    const pts = [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh]
    ];
    const rect = this.container.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    pts.forEach(([x, y], i) => {
      const v = this.corners[i].set(x, y, 0.03);
      this.glass.localToWorld(v);
      v.project(this.camera);
      const sx = ((v.x + 1) / 2) * rect.width;
      const sy = ((1 - v.y) / 2) * rect.height;
      minX = Math.min(minX, sx);
      minY = Math.min(minY, sy);
      maxX = Math.max(maxX, sx);
      maxY = Math.max(maxY, sy);
    });
    this.opts.onScreenRect({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.wakeTimer);
    this.cleanups.forEach((fn) => fn());
    this.crt.dispose();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats as THREE.MeshStandardMaterial[]) {
        m.map?.dispose();
        m.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

/**
 * A studio sweep: a flat desk top that curves up into a wall, so there is no
 * hard line behind the objects. Built as a strip along X with a bent profile.
 */
function coveGeometry() {
  const width = 70;
  const front = 9;
  const back = -6;
  const radius = 5;
  const top = 26;
  const profile: [number, number][] = [];
  for (let z = front; z > back; z -= 1) profile.push([z, 0]);
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    profile.push([back - Math.sin(a) * radius, radius - Math.cos(a) * radius]);
  }
  for (let y = radius + 1; y <= top; y += 2) profile.push([back - radius, y]);

  const arc = [0];
  for (let i = 1; i < profile.length; i++) {
    const [z0, y0] = profile[i - 1];
    const [z1, y1] = profile[i];
    arc.push(arc[i - 1] + Math.hypot(z1 - z0, y1 - y0));
  }
  const total = arc.at(-1)!;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  profile.forEach(([z, y], i) => {
    positions.push(-width / 2, y, z, width / 2, y, z);
    const v = arc[i] / total;
    uvs.push(0, v, 1, v);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
