export const steamVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aOffset;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    float life = fract(uTime * (0.11 + aSeed * 0.09) + aOffset);
    vec3 p = position;
    p.x += sin(uTime * 0.9 + aSeed * 12.0) * 0.04 * life;
    p.z += cos(uTime * 0.7 + aSeed * 8.0) * 0.03 * life;
    p.y += life * 0.58;
    vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.42, 1.0, life));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(18.0, 44.0, life) * mix(0.85, 1.15, aSeed);
  }
`

export const steamFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float core = smoothstep(0.48, 0.08, d);
    if (core < 0.02) discard;
    vec3 col = vec3(0.86, 0.82, 0.76);
    gl_FragColor = vec4(col, core * vAlpha * 0.12);
  }
`

export const coffeeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const coffeeFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float a = atan(p.y, p.x);
    float swirl = noise(vec2(a * 1.4 + uTime * 0.18, r * 8.0 - uTime * 0.22));
    vec3 dark = vec3(0.09, 0.05, 0.03);
    vec3 mid = vec3(0.22, 0.12, 0.06);
    vec3 cream = vec3(0.78, 0.62, 0.38);
    vec3 col = mix(dark, mid, swirl);
    float crema = smoothstep(0.42, 0.22, r) * swirl;
    col = mix(col, cream, crema * 0.45);
    float rim = smoothstep(0.48, 0.38, r);
    col += vec3(0.16, 0.1, 0.05) * (1.0 - rim) * 0.4;
    if (r > 0.5) discard;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export const godrayVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const godrayFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float shaft = 0.0;
    shaft += pow(max(0.0, 1.0 - abs(vUv.x - 0.28) * 3.4), 2.5);
    shaft += pow(max(0.0, 1.0 - abs(vUv.x - 0.5) * 2.6), 2.2) * 0.85;
    shaft += pow(max(0.0, 1.0 - abs(vUv.x - 0.74) * 3.4), 2.5) * 0.7;
    float fall = pow(1.0 - vUv.y, 1.35);
    float shimmer = 0.82 + 0.18 * sin(uTime * 0.32 + vUv.y * 9.0 + vUv.x * 4.0);
    float dust = 0.92 + 0.08 * sin(uTime * 1.1 + vUv.y * 40.0);
    float alpha = clamp(shaft, 0.0, 1.0) * fall * 0.16 * shimmer * dust;
    vec3 col = vec3(1.0, 0.78, 0.48);
    gl_FragColor = vec4(col, alpha);
  }
`
