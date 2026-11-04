import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { badgeTexture, bumpTexture } from './textures';

/** Units are decimeters: the computer is about 30 cm wide and 36 cm tall. */
export const SCREEN = { width: 2.16, height: 1.62 };

function roundedRect<T extends THREE.Path>(shape: T, w: number, h: number, r: number): T {
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A gently curved rectangle, like the face of a small CRT tube. */
function curvedGlass(w: number, h: number, bulge: number) {
  const geo = new THREE.PlaneGeometry(w, h, 40, 30);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (w / 2);
    const y = pos.getY(i) / (h / 2);
    pos.setZ(i, bulge * (1 - 0.55 * x * x - 0.55 * y * y));
  }
  geo.computeVertexNormals();
  return geo;
}

export function buildComputer(opts: {
  beige: string;
  screenTexture: THREE.Texture;
  monoFont: string;
}) {
  const group = new THREE.Group();
  group.name = 'computer';

  const bump = bumpTexture(11);
  bump.repeat.set(6, 6);
  const plastic = new THREE.MeshPhysicalMaterial({
    color: opts.beige,
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    bumpMap: bump,
    bumpScale: 0.35
  });
  const plasticShade = plastic.clone();
  plasticShade.color = new THREE.Color(opts.beige).multiplyScalar(0.9);
  const plasticDeep = plastic.clone();
  plasticDeep.color = new THREE.Color(opts.beige).multiplyScalar(0.78);
  const slot = new THREE.MeshStandardMaterial({ color: '#1b1a18', roughness: 0.8 });
  const charcoal = new THREE.MeshStandardMaterial({ color: '#262522', roughness: 0.55 });

  const shadowed = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Plinth: a slightly darker, inset foot so the body reads as lifted.
  const foot = shadowed(
    new THREE.Mesh(new RoundedBoxGeometry(2.62, 0.24, 2.5, 3, 0.06), plasticDeep)
  );
  foot.position.set(0, 0.12, -0.1);
  group.add(foot);

  // Main body.
  const bodyH = 3.3;
  const bodyD = 2.9;
  const body = shadowed(
    new THREE.Mesh(new RoundedBoxGeometry(3.0, bodyH, bodyD, 5, 0.15), plastic)
  );
  const bodyY = 0.22 + bodyH / 2;
  body.position.set(0, bodyY, -0.05);
  group.add(body);
  const front = -0.05 + bodyD / 2;

  // Raised, rounded surround that holds the tube.
  const screenY = 2.48;
  const surroundShape = roundedRect(new THREE.Shape(), 2.62, 2.08, 0.2);
  surroundShape.holes.push(roundedRect(new THREE.Path(), 2.26, 1.72, 0.2));
  const surround = shadowed(
    new THREE.Mesh(
      new THREE.ExtrudeGeometry(surroundShape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 5,
        curveSegments: 10
      }),
      plasticShade
    )
  );
  surround.position.set(0, screenY, front - 0.02);
  group.add(surround);

  // Dark mask behind the glass edge.
  const mask = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(new THREE.Shape(), 2.32, 1.78, 0.22), 10),
    charcoal
  );
  mask.position.set(0, screenY, front + 0.004);
  group.add(mask);

  // The glass. Its emissive map is the live channel canvas.
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    emissive: '#ffffff',
    emissiveMap: opts.screenTexture,
    emissiveIntensity: 1,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.12
  });
  // Show the channel in its true colors, like a lit screen.
  glassMat.toneMapped = false;
  const glass = new THREE.Mesh(curvedGlass(SCREEN.width, SCREEN.height, 0.045), glassMat);
  glass.name = 'screen';
  glass.position.set(0, screenY, front + 0.012);
  group.add(glass);

  // Floppy drive: a recessed door with a slot and an eject button.
  const driveDoor = shadowed(
    new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.26, 0.06, 2, 0.02), plasticShade)
  );
  driveDoor.position.set(0.62, 0.78, front + 0.005);
  group.add(driveDoor);
  const driveSlot = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.045, 0.02), slot);
  driveSlot.position.set(0.58, 0.8, front + 0.036);
  group.add(driveSlot);
  const eject = shadowed(
    new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.07, 0.06, 2, 0.015), plasticDeep)
  );
  eject.position.set(1.06, 0.69, front + 0.04);
  group.add(eject);

  // Speaker grille: a short run of vertical slots.
  const grille = new THREE.MeshStandardMaterial({ color: '#4a463e', roughness: 0.9 });
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.22, 0.01), grille);
    s.position.set(-1.16 + i * 0.07, 0.78, front + 0.002);
    group.add(s);
  }

  // Model badge.
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.094),
    new THREE.MeshStandardMaterial({
      map: badgeTexture('DS·84', opts.monoFont),
      transparent: true,
      roughness: 0.5
    })
  );
  badge.position.set(-0.36, 0.78, front + 0.003);
  group.add(badge);

  // Power light.
  const ledMat = new THREE.MeshStandardMaterial({
    color: '#3a2a12',
    emissive: '#ffb23e',
    emissiveIntensity: 2.2
  });
  const led = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.set(1.28, 0.78, front + 0.01);
  group.add(led);

  // Vents along both sides, near the back where the tube runs warm.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.035, 1.1), slot);
      v.position.set(side * 1.5, 2.45 + i * 0.1, -0.55);
      group.add(v);
    }
  }

  return { group, glass, screenY, front };
}
