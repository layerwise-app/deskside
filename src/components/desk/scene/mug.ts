import * as THREE from 'three';
import { glazeTextures } from './textures';

/**
 * A thrown stoneware mug, about 10 cm tall. The profile is drawn as one line
 * from the foot, up the outside, over the rim, and down into the well, then
 * turned on a lathe.
 */
export function buildMug(glaze: string) {
  const group = new THREE.Group();
  group.name = 'mug';

  const control: [number, number][] = [
    [0.0, 0.035],
    [0.3, 0.035],
    [0.345, 0.0],
    [0.378, 0.012],
    [0.392, 0.06],
    [0.398, 0.2],
    [0.405, 0.45],
    [0.414, 0.72],
    [0.424, 0.93],
    [0.428, 0.985],
    [0.418, 1.008],
    [0.398, 1.0],
    [0.392, 0.96],
    [0.386, 0.75],
    [0.378, 0.45],
    [0.366, 0.2],
    [0.33, 0.115],
    [0.2, 0.1],
    [0.0, 0.098]
  ];
  const curve = new THREE.SplineCurve(control.map(([x, y]) => new THREE.Vector2(x, y)));
  const points = curve.getSpacedPoints(90);
  points[0].x = 0;
  points[points.length - 1].x = 0;

  // Arc length along the profile, so the glaze line follows real height.
  const arc = [0];
  for (let i = 1; i < points.length; i++) arc.push(arc[i - 1] + points[i].distanceTo(points[i - 1]));
  const total = arc.at(-1)!;
  const rimIndex = points.reduce((best, p, i) => (p.y > points[best].y ? i : best), 0);
  const rimV = arc[rimIndex] / total;
  // Glaze runs down the outside to about 44% of the height.
  const glazeIndex = points.findIndex((p, i) => i < rimIndex && p.y > 0.44);
  const glazeV = arc[glazeIndex] / total;

  const segments = 72;
  const geo = new THREE.LatheGeometry(points, segments);
  const uv = geo.attributes.uv;
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j < points.length; j++) {
      uv.setY(i * points.length + j, arc[j] / total);
    }
  }
  geo.computeVertexNormals();

  const { map, roughnessMap } = glazeTextures(glaze, glazeV, rimV);
  const mat = new THREE.MeshPhysicalMaterial({
    map,
    roughnessMap,
    roughness: 1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(geo, mat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Handle: an oval loop pulled from the wall, glazed all over.
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.39, 0.82, 0),
    new THREE.Vector3(0.6, 0.86, 0),
    new THREE.Vector3(0.7, 0.66, 0),
    new THREE.Vector3(0.64, 0.4, 0),
    new THREE.Vector3(0.39, 0.3, 0)
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 48, 0.052, 14, false);
  // Flatten the section a little so it reads as pulled, not extruded.
  const hp = handleGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) hp.setZ(i, hp.getZ(i) * 0.72);
  handleGeo.computeVertexNormals();
  const glazeColor = new THREE.Color(glaze);
  const handleMat = new THREE.MeshPhysicalMaterial({
    color: glazeColor,
    roughness: 0.16,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.castShadow = true;
  handle.receiveShadow = true;
  group.add(handle);

  // Coffee, about two thirds full.
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.382, 48),
    new THREE.MeshPhysicalMaterial({
      color: '#24160d',
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04
    })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.74;
  group.add(coffee);

  return group;
}
