/**
 * Three.js desk scene for north-star / future production hero.
 * Monitor, mug, steam, mini integration globe — coffee palette.
 */
(function () {
  const canvas = document.getElementById('ns-scene-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = canvas.parentElement;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a1108, 0.045);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0.35, 1.55, 4.2);
  camera.lookAt(0, 0.75, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Materials
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2e24,
    roughness: 0.82,
    metalness: 0.05,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x14100e,
    roughness: 0.55,
    metalness: 0.15,
  });
  const mugMat = new THREE.MeshStandardMaterial({
    color: 0xf0e6d8,
    roughness: 0.35,
    metalness: 0.08,
  });
  const coffeeMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.4,
    metalness: 0.1,
  });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a0806,
    emissive: 0xc9a96e,
    emissiveIntensity: 0.35,
    roughness: 0.9,
    metalness: 0,
  });
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.45,
    metalness: 0.35,
    emissive: 0xc9a96e,
    emissiveIntensity: 0.45,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x93e5ff,
    transparent: true,
    opacity: 0.82,
  });

  const desk = new THREE.Group();
  scene.add(desk);

  // Desk top
  const topGeo = new THREE.BoxGeometry(4.2, 0.12, 1.6);
  const top = new THREE.Mesh(topGeo, woodMat);
  top.position.y = 0.75;
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  // Desk apron
  const apron = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.7, 1.4), woodMat);
  apron.position.y = 0.38;
  apron.castShadow = true;
  desk.add(apron);

  // Monitor group
  const monitor = new THREE.Group();
  monitor.position.set(-0.55, 1.18, -0.05);
  desk.add(monitor);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.95, 0.08), darkMat);
  bezel.castShadow = true;
  monitor.add(bezel);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.78), screenMat);
  screen.position.z = 0.045;
  monitor.add(screen);

  const chin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.06), darkMat);
  chin.position.set(0, -0.52, 0.02);
  monitor.add(chin);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.1), darkMat);
  stand.position.set(0, -0.72, 0);
  monitor.add(stand);

  // Keyboard
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.38), darkMat);
  keyboard.position.set(0.15, 0.84, 0.35);
  keyboard.rotation.x = -0.08;
  keyboard.castShadow = true;
  desk.add(keyboard);

  // Mug
  const mug = new THREE.Group();
  mug.position.set(1.35, 0.88, 0.15);
  desk.add(mug);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.22, 24), mugMat);
  cup.castShadow = true;
  mug.add(cup);

  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.02, 24), coffeeMat);
  liquid.position.y = 0.09;
  mug.add(liquid);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 16, Math.PI), mugMat);
  handle.rotation.y = Math.PI / 2;
  handle.position.set(0.15, 0, 0);
  mug.add(handle);

  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24), mugMat);
  saucer.position.y = -0.12;
  mug.add(saucer);

  // Mini globe on desk — integrations motif
  const miniGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), globeMat);
  miniGlobe.position.set(-1.45, 0.97, 0.2);
  miniGlobe.castShadow = true;
  desk.add(miniGlobe);

  const globeLight = new THREE.PointLight(0x7dd3fc, 0.55, 1.2);
  globeLight.position.copy(miniGlobe.position).add(new THREE.Vector3(0.15, 0.2, 0.25));
  desk.add(globeLight);

  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.224, 14, 14));
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  wire.position.copy(miniGlobe.position);
  desk.add(wire);

  // Steam particles
  const steamCount = 24;
  const steamGeo = new THREE.BufferGeometry();
  const steamPositions = new Float32Array(steamCount * 3);
  const steamSpeeds = [];
  for (let i = 0; i < steamCount; i++) {
    steamPositions[i * 3] = 1.35 + (Math.random() - 0.5) * 0.08;
    steamPositions[i * 3 + 1] = 1.05 + Math.random() * 0.15;
    steamPositions[i * 3 + 2] = 0.15 + (Math.random() - 0.5) * 0.06;
    steamSpeeds.push(0.004 + Math.random() * 0.006);
  }
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
  const steamMat = new THREE.PointsMaterial({
    color: 0xfff8ee,
    size: 0.09,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const steam = new THREE.Points(steamGeo, steamMat);
  desk.add(steam);

  // Lights
  scene.add(new THREE.AmbientLight(0xc9a96e, 0.28));
  const lamp = new THREE.PointLight(0xffd9a0, 1.1, 12);
  lamp.position.set(1.8, 2.4, 2.2);
  lamp.castShadow = true;
  scene.add(lamp);

  const fill = new THREE.DirectionalLight(0xf7efe2, 0.45);
  fill.position.set(-3, 4, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc9a96e, 0.25);
  rim.position.set(0, 2, -4);
  scene.add(rim);

  // Floor shadow catcher
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.72;
  floor.receiveShadow = true;
  scene.add(floor);

  let controls = null;
  if (THREE.OrbitControls && !reducedMotion) {
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minAzimuthAngle = -0.55;
    controls.maxAzimuthAngle = 0.65;
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    let idleTimer = 0;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      window.clearTimeout(idleTimer);
    });
    controls.addEventListener('end', () => {
      idleTimer = window.setTimeout(() => {
        controls.autoRotate = true;
      }, 4000);
    });
  }

  let raf = 0;
  let t = 0;
  let visible = true;

  if ('IntersectionObserver' in window && container) {
    const visObs = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    visObs.observe(container);
  }

  function animate() {
    if (reducedMotion) return;
    raf = requestAnimationFrame(animate);
    if (!visible) return;
    t += 0.016;

    screenMat.emissiveIntensity = 0.28 + Math.sin(t * 1.8) * 0.08;
    miniGlobe.rotation.y += 0.004;
    wire.rotation.y = miniGlobe.rotation.y;

    const pos = steamGeo.attributes.position.array;
    for (let i = 0; i < steamCount; i++) {
      pos[i * 3 + 1] += steamSpeeds[i];
      pos[i * 3] += Math.sin(t * 2 + i) * 0.0004;
      if (pos[i * 3 + 1] > 1.55) {
        pos[i * 3 + 1] = 1.02;
        pos[i * 3] = 1.35 + (Math.random() - 0.5) * 0.08;
      }
    }
    steamGeo.attributes.position.needsUpdate = true;

    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', resize);
  resize();

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    animate();
  }

  container?.classList.add('is-ready');
  document.dispatchEvent(new CustomEvent('ns-scene-ready'));

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    if (controls) controls.dispose();
    renderer.dispose();
  });
})();
