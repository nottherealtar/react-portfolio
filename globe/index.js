// Space Globe: Custom Three.js Globe with Johannesburg Pin and Animated Commit Lines
// Uses global THREE and OrbitControls (from CDN)

(function () {
  // --- DOM Setup ---
  const container = document.querySelector('.container');
  const canvas = container ? container.querySelector('.canvas') : null;
  if (!canvas) return;

  // --- Scene Setup ---
  const width = canvas.width;
  const height = canvas.height;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 3.2);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0); // transparent
  renderer.setSize(width, height, false);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // --- Globe ---
  const RADIUS = 1;
  const globeGeometry = new THREE.SphereGeometry(RADIUS, 64, 64);
  const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0x1e293b,
    specular: 0x222222,
    shininess: 18,
    transparent: true,
    opacity: 0.98,
  });
  const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globeMesh);

  // --- Dot World Map Overlay with Lazy Loading ---
  const mapImg = new window.Image();
  
  // Create lazy loading for the world map image
  const loadWorldMap = () => {
    mapImg.src = '/world_alpha_mini.jpg';
    mapImg.onload = function () {
      // Draw dots on globe after image loads
      drawWorldDots(mapImg);
    };
    mapImg.onerror = function () {
      console.warn('Failed to load world map image, using fallback dots');
      // Create fallback dots without map data
      createFallbackDots();
    };
  };

  // Use intersection observer to load map when globe container is visible
  if ('IntersectionObserver' in window) {
    const globeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadWorldMap();
          globeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    globeObserver.observe(container);
  } else {
    // Fallback for older browsers
    loadWorldMap();
  }

  function drawWorldDots(img) {
    // Use a hidden canvas to read the map image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
    const dotGroup = new THREE.Group();
    for (let y = 0; y < img.height; y += 2) {
      for (let x = 0; x < img.width; x += 2) {
        const idx = (y * img.width + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        // Only place dots on white (land) pixels
        if (r > 200 && g > 200 && b > 200) {
          // Convert (x, y) to lat/lon
          const lon = (x / img.width) * 360 - 180;
          const lat = 90 - (y / img.height) * 180;
          const pos = calcPosFromLatLonRad(lat, lon, RADIUS + 0.008);
          const dotGeo = new THREE.SphereGeometry(0.008, 6, 6);
          const dotMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
          const dot = new THREE.Mesh(dotGeo, dotMat);
          dot.position.set(pos.x, pos.y, pos.z);
          dotGroup.add(dot);
        }
      }
    }
    scene.add(dotGroup);
  }

  function createFallbackDots() {
    // Create basic dots pattern when image fails to load
    const dotGroup = new THREE.Group();
    const majorCities = [
      { lat: 51.5074, lon: -0.1278 },   // London
      { lat: 40.7128, lon: -74.0060 },  // New York
      { lat: 35.6895, lon: 139.6917 },  // Tokyo
      { lat: 48.8566, lon: 2.3522 },    // Paris
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 55.7558, lon: 37.6173 },   // Moscow
      { lat: 19.4326, lon: -99.1332 },  // Mexico City
      { lat: 39.9042, lon: 116.4074 },  // Beijing
      { lat: 1.3521, lon: 103.8198 },   // Singapore
      { lat: 52.52, lon: 13.405 },      // Berlin
    ];
    
    majorCities.forEach(city => {
      const pos = calcPosFromLatLonRad(city.lat, city.lon, RADIUS + 0.008);
      const dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(pos.x, pos.y, pos.z);
      dotGroup.add(dot);
    });
    
    scene.add(dotGroup);
  }

  // --- Johannesburg Pin ---
  function addJohannesburgPin() {
    const lat = -26.2041;
    const lon = 28.0473;
    const pinHeight = 0.22; // larger
    const pinRadius = 0.032; // larger
    const pinColor = 0xffd600; // bright yellow
    // Pin body (cylinder)
    const pinGeo = new THREE.CylinderGeometry(pinRadius * 0.7, pinRadius * 0.5, pinHeight, 24);
    const pinMat = new THREE.MeshPhongMaterial({ color: pinColor, emissive: pinColor, shininess: 100 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    // Pin head (sphere)
    const headGeo = new THREE.SphereGeometry(pinRadius * 1.5, 24, 24);
    const headMat = new THREE.MeshPhongMaterial({ color: pinColor, emissive: pinColor, shininess: 100 });
    const head = new THREE.Mesh(headGeo, headMat);
    // Add glow (sprite)
    const spriteMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png');
    const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: pinColor, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.25, 0.25, 1);
    // Position pin
    const base = calcPosFromLatLonRad(lat, lon, RADIUS + pinHeight / 2);
    const tip = calcPosFromLatLonRad(lat, lon, RADIUS + pinHeight);
    pin.position.set(base.x, base.y, base.z);
    head.position.set(tip.x, tip.y, tip.z);
    sprite.position.set(tip.x, tip.y, tip.z);
    // Orient pin to globe normal
    pin.lookAt(calcPosFromLatLonRad(lat, lon, RADIUS * 2));
    head.lookAt(calcPosFromLatLonRad(lat, lon, RADIUS * 2));
    // Add to scene
    scene.add(pin);
    scene.add(head);
    scene.add(sprite);
  }
  addJohannesburgPin();

  // --- Animated Commit Lines ---
  // Generate random destinations (lat/lon pairs)
  const johannesburg = { lat: -26.2041, lon: 28.0473 };
  const commitLines = [];
  const NUM_LINES = 8;
  for (let i = 0; i < NUM_LINES; i++) {
    const dest = randomCountryLatLon();
    const curve = createGlobeCurve(johannesburg, dest, RADIUS);
    const line = createAnimatedLine(curve);
    commitLines.push({ line, curve, progress: 0, speed: 0.012 + Math.random() * 0.012 });
    scene.add(line);
  }

  function createAnimatedLine(curve) {
    // Start with a short segment, will animate
    const points = curve.getPoints(2);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00fff7, // bright cyan
      linewidth: 4, // thicker
      transparent: true,
      opacity: 0.95,
    });
    // Add glow effect using Line2 if available, fallback to LineBasicMaterial
    return new THREE.Line(geometry, material);
  }

  function updateAnimatedLine(line, curve, progress) {
    // Animate the line drawing from 0 to 1 along the curve
    const N = 48;
    const pts = curve.getPoints(Math.floor(N * progress) + 2);
    line.geometry.setFromPoints(pts);
    // Animate opacity for trailing effect
    line.material.opacity = 0.7 + 0.3 * Math.sin(progress * Math.PI);
  }

  // --- Orbit Controls ---
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // --- Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);
    // Animate commit lines
    for (const obj of commitLines) {
      obj.progress += obj.speed;
      if (obj.progress > 1) obj.progress = 0;
      updateAnimatedLine(obj.line, obj.curve, obj.progress);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // --- Utility Functions ---
  function calcPosFromLatLonRad(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return {
      x: -radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    };
  }

  function randomCountryLatLon() {
    // List of major country lat/lon (not exhaustive, but enough for demo)
    const countries = [
      { lat: 51.5074, lon: -0.1278 },   // London
      { lat: 40.7128, lon: -74.0060 },  // New York
      { lat: 35.6895, lon: 139.6917 },  // Tokyo
      { lat: 48.8566, lon: 2.3522 },    // Paris
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 55.7558, lon: 37.6173 },   // Moscow
      { lat: 19.4326, lon: -99.1332 },  // Mexico City
      { lat: 39.9042, lon: 116.4074 },  // Beijing
      { lat: 1.3521, lon: 103.8198 },   // Singapore
      { lat: 52.52, lon: 13.405 },      // Berlin
      { lat: 37.7749, lon: -122.4194 }, // San Francisco
      { lat: -23.5505, lon: -46.6333 }, // São Paulo
      { lat: 28.6139, lon: 77.2090 },   // New Delhi
      { lat: 41.9028, lon: 12.4964 },   // Rome
      { lat: 31.2304, lon: 121.4737 },  // Shanghai
      { lat: 34.0522, lon: -118.2437 }, // Los Angeles
      { lat: 43.6532, lon: -79.3832 },  // Toronto
      { lat: 6.5244, lon: 3.3792 },     // Lagos
      { lat: 59.3293, lon: 18.0686 },   // Stockholm
      { lat: 13.7563, lon: 100.5018 },  // Bangkok
    ];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  function createGlobeCurve(from, to, radius) {
    // Create a curve that arcs above the globe
    const start = calcPosFromLatLonRad(from.lat, from.lon, radius + 0.01);
    const end = calcPosFromLatLonRad(to.lat, to.lon, radius + 0.01);
    // Midpoint for arc
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
      z: (start.z + end.z) / 2,
    };
    // Raise midpoint for arc height
    const arcHeight = 0.32 + Math.random() * 0.18;
    const midLen = Math.sqrt(mid.x * mid.x + mid.y * mid.y + mid.z * mid.z);
    mid.x *= (1 + arcHeight / midLen);
    mid.y *= (1 + arcHeight / midLen);
    mid.z *= (1 + arcHeight / midLen);
    // Create curve
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(start.x, start.y, start.z),
      new THREE.Vector3(mid.x, mid.y, mid.z),
      new THREE.Vector3(end.x, end.y, end.z),
    ]);
  }

  // --- Responsive Resize ---
  function handleResize() {
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  // --- Interactivity: Only on Globe Canvas ---
  // (OrbitControls already attached to renderer.domElement, which is the canvas)
})();