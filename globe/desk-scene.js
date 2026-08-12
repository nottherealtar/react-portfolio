/**
 * Three.js desk scene — scroll-driven intro into the workspace.
 * Camera dollies from a distant monitor glow down to the desk (edh-style).
 */
(function () {
  const canvas = document.getElementById('ns-scene-canvas');
  const scrollStage = document.getElementById('ns-scroll-stage');
  const sceneRoot = document.getElementById('ns-scene');
  const screenOverlay = document.getElementById('ns-screen-overlay');
  const heroEl = document.getElementById('ns-hero');
  const scrollHint = document.getElementById('ns-scroll-hint');
  const progressFill = document.getElementById('ns-scroll-progress-fill');

  if (!canvas || !scrollStage || typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const container = canvas.parentElement;

  const CAM_PATH = [
    { pos: [0.1, 3.8, 8.6], look: [-0.45, 1.22, -0.05], fov: 44 },
    { pos: [2.4, 2.35, 6.2], look: [-0.2, 1.05, 0.1], fov: 40 },
    { pos: [0.85, 1.75, 4.85], look: [-0.35, 1.02, 0.05], fov: 38 },
    { pos: [0.35, 1.55, 4.2], look: [0, 0.85, 0], fov: 38 },
  ];

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a1108, 0.065);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const lookAt = new THREE.Vector3(0, 0.85, 0);
  const tmpVec = new THREE.Vector3();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    emissiveIntensity: 0.55,
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

  const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 1.6), woodMat);
  top.position.y = 0.75;
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  const apron = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.7, 1.4), woodMat);
  apron.position.y = 0.38;
  apron.castShadow = true;
  desk.add(apron);

  const monitor = new THREE.Group();
  monitor.position.set(-0.55, 1.18, -0.05);
  desk.add(monitor);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.95, 0.08), darkMat);
  bezel.castShadow = true;
  monitor.add(bezel);

  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.78), screenMat);
  screenMesh.position.z = 0.045;
  monitor.add(screenMesh);

  const chin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.06), darkMat);
  chin.position.set(0, -0.52, 0.02);
  monitor.add(chin);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.1), darkMat);
  stand.position.set(0, -0.72, 0);
  monitor.add(stand);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.38), darkMat);
  keyboard.position.set(0.15, 0.84, 0.35);
  keyboard.rotation.x = -0.08;
  keyboard.castShadow = true;
  desk.add(keyboard);

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

  const miniGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.22, isMobile ? 20 : 32, isMobile ? 20 : 32), globeMat);
  miniGlobe.position.set(-1.45, 0.97, 0.2);
  miniGlobe.castShadow = true;
  desk.add(miniGlobe);

  const globeLight = new THREE.PointLight(0x7dd3fc, 0.55, 1.2);
  globeLight.position.copy(miniGlobe.position).add(new THREE.Vector3(0.15, 0.2, 0.25));
  desk.add(globeLight);

  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.224, isMobile ? 10 : 14, isMobile ? 10 : 14));
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  wire.position.copy(miniGlobe.position);
  desk.add(wire);

  const steamCount = isMobile ? 14 : 24;
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
    size: isMobile ? 0.07 : 0.09,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const steam = new THREE.Points(steamGeo, steamMat);
  desk.add(steam);

  scene.add(new THREE.AmbientLight(0xc9a96e, 0.28));
  const lamp = new THREE.PointLight(0xffd9a0, 1.1, 12);
  lamp.position.set(1.8, 2.4, 2.2);
  lamp.castShadow = !isMobile;
  scene.add(lamp);

  const fill = new THREE.DirectionalLight(0xf7efe2, 0.45);
  fill.position.set(-3, 4, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc9a96e, 0.25);
  rim.position.set(0, 2, -4);
  scene.add(rim);

  const monitorGlow = new THREE.PointLight(0xc9a96e, 1.4, 6);
  monitorGlow.position.set(-0.55, 1.2, 0.35);
  scene.add(monitorGlow);

  if (!isMobile) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.72;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  let controls = null;
  let scrollSettled = reducedMotion;
  let settledFired = false;

  function enableOrbit() {
    if (controls || !THREE.OrbitControls || reducedMotion || isMobile) {
      if (!settledFired) {
        settledFired = true;
        document.dispatchEvent(new CustomEvent('ns-scroll-settled'));
      }
      return;
    }
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minAzimuthAngle = -0.55;
    controls.maxAzimuthAngle = 0.65;
    controls.target.copy(lookAt);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

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

    canvas.classList.add('is-orbit-ready');
    settledFired = true;
    document.dispatchEvent(new CustomEvent('ns-scroll-settled'));
  }

  let scrollTarget = reducedMotion ? 1 : 0;
  let scrollCurrent = scrollTarget;
  const scrollSmoothing = isMobile ? 0.09 : 0.07;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function sampleCameraPath(t) {
    const eased = easeOutCubic(Math.min(1, Math.max(0, t)));
    const segments = CAM_PATH.length - 1;
    const scaled = eased * segments;
    const idx = Math.min(segments - 1, Math.floor(scaled));
    const local = scaled - idx;
    const a = CAM_PATH[idx];
    const b = CAM_PATH[idx + 1];
    const smooth = local * local * (3 - 2 * local);

    camera.position.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], smooth),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], smooth),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], smooth)
    );
    lookAt.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], smooth),
      THREE.MathUtils.lerp(a.look[1], b.look[1], smooth),
      THREE.MathUtils.lerp(a.look[2], b.look[2], smooth)
    );
    camera.fov = THREE.MathUtils.lerp(a.fov, b.fov, smooth);
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt);
  }

  function getScrollProgress() {
    const rect = scrollStage.getBoundingClientRect();
    const stageHeight = scrollStage.offsetHeight - window.innerHeight;
    if (stageHeight <= 0) return 1;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / stageHeight));
  }

  function updateScrollUi(progress) {
    if (progressFill) progressFill.style.transform = 'scaleX(' + progress + ')';

    const heroIn = Math.min(1, Math.max(0, (progress - 0.62) / 0.28));
    if (heroEl) heroEl.style.setProperty('--ns-hero-in', heroIn.toFixed(3));

    if (scrollHint) {
      scrollHint.style.opacity = String(Math.max(0, 1 - progress * 2.5));
    }

    if (sceneRoot) {
      sceneRoot.classList.toggle('is-close', progress > 0.45);
      sceneRoot.classList.toggle('is-settled', progress > 0.92);
    }

    scene.fog.density = THREE.MathUtils.lerp(0.075, 0.038, progress);
    monitorGlow.intensity = THREE.MathUtils.lerp(2.2, 0.9, progress);
  }

  function projectScreenOverlay(progress) {
    if (!screenOverlay) return;

    if (progress < 0.38) {
      screenOverlay.hidden = true;
      return;
    }

    screenOverlay.hidden = false;
    desk.updateMatrixWorld(true);

    const corners = [
      new THREE.Vector3(-0.675, 0.39, 0.045),
      new THREE.Vector3(0.675, 0.39, 0.045),
      new THREE.Vector3(0.675, -0.39, 0.045),
      new THREE.Vector3(-0.675, -0.39, 0.045),
    ];

    const w = container.clientWidth;
    const h = container.clientHeight;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    corners.forEach((corner) => {
      tmpVec.copy(corner);
      monitor.localToWorld(tmpVec);
      tmpVec.project(camera);
      const x = (tmpVec.x * 0.5 + 0.5) * w;
      const y = (-tmpVec.y * 0.5 + 0.5) * h;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    if (!Number.isFinite(minX)) return;

    const pad = isMobile ? 2 : 4;
    const width = Math.max(40, maxX - minX + pad);
    const height = Math.max(24, maxY - minY + pad);
    const opacity = Math.min(1, Math.max(0, (progress - 0.38) / 0.22));

    screenOverlay.style.left = (minX - pad * 0.5) + 'px';
    screenOverlay.style.top = (minY - pad * 0.5) + 'px';
    screenOverlay.style.width = width + 'px';
    screenOverlay.style.height = height + 'px';
    screenOverlay.style.opacity = opacity.toFixed(3);
    screenOverlay.style.transform = 'none';
  }

  function onScroll() {
    scrollTarget = getScrollProgress();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let raf = 0;
  let t = 0;
  let visible = true;

  if ('IntersectionObserver' in window && container) {
    const visObs = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    visObs.observe(scrollStage);
  }

  function animate() {
    if (reducedMotion) return;
    raf = requestAnimationFrame(animate);
    if (!visible) return;

    t += 0.016;
    scrollCurrent = THREE.MathUtils.lerp(scrollCurrent, scrollTarget, scrollSmoothing);

    if (!scrollSettled && scrollCurrent > 0.96 && scrollTarget > 0.96) {
      scrollSettled = true;
      scrollStage.classList.add('is-settled');
      if (!settledFired) {
        settledFired = true;
        enableOrbit();
      }
    }

    if (!controls) {
      sampleCameraPath(scrollCurrent);
    } else if (controls) {
      controls.target.copy(lookAt);
    }

    updateScrollUi(scrollCurrent);
    projectScreenOverlay(scrollCurrent);

    const baseEmissive = THREE.MathUtils.lerp(0.72, 0.35, scrollCurrent);
    screenMat.emissiveIntensity = scrollSettled
      ? baseEmissive + Math.sin(t * 1.8) * 0.08
      : baseEmissive;

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
    if (!controls) projectScreenOverlay(scrollCurrent);
  }

  window.addEventListener('resize', resize);
  resize();

  if (reducedMotion) {
    sampleCameraPath(1);
    updateScrollUi(1);
    projectScreenOverlay(1);
    scrollStage.classList.add('is-settled');
    if (screenOverlay) screenOverlay.hidden = false;
    screenMat.emissiveIntensity = 0.35;
    renderer.render(scene, camera);
    if (!settledFired) {
      settledFired = true;
      document.dispatchEvent(new CustomEvent('ns-scroll-settled'));
    }
  } else {
    sampleCameraPath(0);
    updateScrollUi(0);
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
