
// =====================================================================
// 11 · Cielo, sol real de Barranquilla y luces
// =====================================================================
const LAT = 10.9639, LON = -74.7964, TZ = -5;
function dayOfYear(m, d) { return [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][m - 1] + d; }
// Algoritmo NOAA (precisión ~0,5°): altura y azimut (desde el norte, horario)
function sunPosition(m, d, hour) {
  const lat = LAT * D2R, N = dayOfYear(m, d);
  const g = 2 * Math.PI / 365 * (N - 1 + (hour - 12) / 24);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const tst = hour * 60 + eq + 4 * LON - 60 * TZ;
  const ha = (tst / 4 - 180) * D2R;
  const cz = clamp(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha), -1, 1);
  const zen = Math.acos(cz);
  let az = Math.acos(clamp((Math.sin(lat) * Math.cos(zen) - Math.sin(decl)) / (Math.cos(lat) * Math.sin(zen) || 1e-6), -1, 1)) * R2D;
  az = ha > 0 ? (az + 180) % 360 : (540 - az) % 360;
  return { alt: 90 - zen * R2D, az };
}
const dirFromAltAz = (alt, az) => new THREE.Vector3(Math.cos(alt * D2R) * Math.sin(az * D2R), Math.sin(alt * D2R), -Math.cos(alt * D2R) * Math.cos(az * D2R));
const CARD = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
const cardinal = (az) => CARD[Math.round(((az % 360) + 360) % 360 / 45) % 8];
const MOON_DIR = dirFromAltAz(36, 105);

// --- cielo con noche, estrellas y luna
const sky = new Sky(); sky.scale.setScalar(4000); sky.frustumCulled = false;
const su = sky.material.uniforms;
su.skyGain = { value: 1 }; su.nightZ = { value: new THREE.Color(0x02060f) }; su.nightH = { value: new THREE.Color(0x0e1a30) };
su.starAmt = { value: 0 }; su.moonDir = { value: MOON_DIR.clone() }; su.skySat = { value: 1.5 }; su.skyPow = { value: 1.3 };
sky.material.fragmentShader = sky.material.fragmentShader
  .replace('uniform vec3 up;', 'uniform vec3 up;\nuniform float skyGain; uniform float skySat; uniform float skyPow; uniform vec3 nightZ; uniform vec3 nightH; uniform float starAmt; uniform vec3 moonDir;')
  .replace('gl_FragColor = vec4( retColor, 1.0 );', `
    float hor = clamp(direction.y, 0.0, 1.0);
    vec3 night = mix(nightH, nightZ, pow(hor, 0.45));
    vec3 cell = floor(direction * 380.0);
    float hs = fract(sin(dot(cell, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    float star = step(0.9972, hs) * smoothstep(0.03, 0.3, direction.y) * (0.35 + 0.65 * fract(hs * 937.0));
    float md = dot(direction, normalize(moonDir));
    float moon = smoothstep(0.99955, 0.99968, md);
    float halo = pow(max(md, 0.0), 300.0) * 0.18;
    vec3 sc = retColor * skyGain; float sl = dot(sc, vec3(0.2126, 0.7152, 0.0722));
    sc = pow(max(mix(vec3(sl), sc, skySat), 0.0), vec3(skyPow));
    vec3 col = sc + (night + vec3(star) * 1.4 + vec3(1.0, 0.97, 0.88) * moon * 2.2 + vec3(0.45, 0.52, 0.7) * halo) * starAmt;
    gl_FragColor = vec4( col, 1.0 );`);
scene.add(sky);
// escena de ambiente para reflejos (PMREM)
const envScene = new THREE.Scene();
const skyEnv = new Sky(); skyEnv.material = sky.material; skyEnv.scale.setScalar(4000); envScene.add(skyEnv);
const envGroundMat = new THREE.MeshBasicMaterial({ color: 0x2c3326, side: THREE.DoubleSide });
const envGround = new THREE.Mesh(new THREE.CircleGeometry(400, 32), envGroundMat); envGround.rotation.x = -Math.PI / 2; envGround.position.y = -3; envScene.add(envGround);
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null, envTimer = 0;
function updateEnv() { const g = su.skyGain.value; su.skyGain.value = 1; const rt = pmrem.fromScene(envScene, 0, 0.1, 1000); su.skyGain.value = g; if (envRT) envRT.dispose(); envRT = rt; scene.environment = rt.texture; }
function scheduleEnv() { clearTimeout(envTimer); envTimer = setTimeout(updateEnv, 120); }

// --- luces
const SUN_I = 5.2;
const sun = new THREE.DirectionalLight(0xffffff, SUN_I);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -27, right: 27, top: 27, bottom: -27, near: 1, far: 180 });
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03;
sun.target.position.set(0, 0, 1.5); scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x6b5a45, 0.6); scene.add(hemi);
scene.fog = new THREE.Fog(0xcfd8e0, 80, 900);

const LAMP_DEF = [
  // x, y, z, intensidad, alcance, color
  [5.7, 2.7, 1.6, 9, 8, 0xffd6a8], [2.1, 2.2, 2.9, 6, 6, 0xffd2a0], [-1.7, 2.7, 2.5, 8, 7, 0xffdcb4], [1.7, 4.4, -3.3, 12, 10, 0xffd2a0],
  [5.3, 2.7, -3.3, 7, 6, 0xffe2c4], [-4.75, 2.7, -2.2, 7, 7, 0xe8f0ff], [-5.5, 2.7, 2.7, 5, 6, 0xffe6cc],
  [-4.7, 5.8, -3.3, 6, 6, 0xffd6a8], [5.3, 5.8, -3.3, 6, 6, 0xffd6a8], [5.3, 5.8, 1.2, 7, 7, 0xffd6a8], [-0.5, 5.8, 1.2, 6, 6, 0xffe0c0],
  [-5.6, 5.8, 1.6, 5, 5, 0xffd6a8], [0.5, 5.9, -1.1, 6, 9, 0xffd6a8],
  [1.5, -0.9, 11.5, 24, 12, 0x46d8ff], [3.0, 2.7, 6.6, 7, 9, 0xffc890], [2.1, 0.5, -8.4, 6, 10, 0xffc890],
];
const LAMPS = LAMP_DEF.map(([x, y, z, i, d, c]) => { const l = new THREE.PointLight(c, 0, d, 2); l.position.set(x, y, z); l.userData.max = i; scene.add(l); return l; });

const TOD = { hour: 10.5, m: 10, d: 13, lights: 'auto', lightsOn: false, alt: 0, az: 0 };
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function updateSky() {
  const { alt, az } = sunPosition(TOD.m, TOD.d, TOD.hour); TOD.alt = alt; TOD.az = az;
  const dir = dirFromAltAz(alt, az);
  const dayK = smooth(-7, 9, alt), golden = 1 - smooth(3, 30, alt), high = smooth(5, 45, alt);
  su.sunPosition.value.copy(dir);
  su.turbidity.value = lerp(3.0, 8.5, golden); su.rayleigh.value = lerp(2.0, 3.2, golden);
  su.mieCoefficient.value = 0.005; su.mieDirectionalG.value = 0.82;
  su.starAmt.value = 1 - smooth(-9, 0, alt); su.skyGain.value = lerp(0.62, 0.9, golden) * (0.1 + 0.9 * smooth(-10, 0, alt));
  if (alt > -2) {
    sun.position.copy(dir).multiplyScalar(90).add(sun.target.position);
    sun.intensity = SUN_I * smooth(-2, 7, alt) * lerp(0.7, 1, high);
    sun.color.setRGB(1, lerp(0.58, 0.96, smooth(0, 35, alt)), lerp(0.32, 0.9, smooth(0, 42, alt)));
  } else {
    sun.position.copy(MOON_DIR).multiplyScalar(90).add(sun.target.position);
    sun.intensity = 0.32 * (1 - smooth(-9, -2, alt)); sun.color.set(0x9db4ff);
  }
  // cielo y suelo del hemisferio
  _c1.setRGB(0.72, 0.84, 1.0).lerp(_c2.setRGB(1.0, 0.72, 0.52), golden * 0.7); hemi.color.copy(_c1).lerp(_c2.setRGB(0.18, 0.24, 0.42), 1 - dayK);
  hemi.groundColor.setRGB(0.4, 0.33, 0.25).multiplyScalar(lerp(0.15, 1, dayK));
  hemi.intensity = lerp(0.1, 0.75, dayK);
  scene.environmentIntensity = lerp(0.12, 1.0, dayK);
  renderer.toneMappingExposure = lerp(1.05, 0.62, dayK) * lerp(1, 1.12, golden * dayK);
  // niebla y cerros con perspectiva aérea
  _c1.setRGB(0.80, 0.86, 0.92).lerp(_c2.setRGB(0.98, 0.74, 0.56), golden * 0.85).lerp(_c2.setRGB(0.04, 0.06, 0.11), 1 - dayK);
  scene.fog.color.copy(_c1);
  MAT.cerroLejano.color.setRGB(0.27, 0.38, 0.33).lerp(_c1, 0.55).multiplyScalar(lerp(0.25, 0.9, dayK));
  envGroundMat.color.setRGB(0.2, 0.22, 0.17).multiplyScalar(lerp(0.04, 1, dayK));
  // luces de la casa
  TOD.lightsOn = TOD.lights === 'on' || (TOD.lights === 'auto' && alt < 4);
  const k = TOD.lightsOn ? 1 : 0;
  LAMPS.forEach((l) => { l.intensity = l.userData.max * k; });
  for (const [m, v] of NIGHT_EMISSIVE) m.emissiveIntensity = v * k * (m === MAT.ventanaVecina ? (1 - dayK) : 1);
  CAUSTIC_UNIFORM.value = 0.3 * high;
  scheduleEnv();
}
