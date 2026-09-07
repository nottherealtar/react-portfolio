import * as THREE from 'three'

function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function noise2(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const n00 = hash2(xi, yi)
  const n10 = hash2(xi + 1, yi)
  const n01 = hash2(xi, yi + 1)
  const n11 = hash2(xi + 1, yi + 1)
  return n00 * (1 - u) * (1 - v) + n10 * u * (1 - v) + n01 * (1 - u) * v + n11 * u * v
}

function fbm(x, y, octaves = 5) {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i += 1) {
    value += amp * noise2(x * freq, y * freq)
    freq *= 2.03
    amp *= 0.5
  }
  return value
}

function mix(a, b, t) {
  return a + (b - a) * t
}

function makeDataTexture(width, height, fill, { srgb = true, roughMin = 0.32, roughMax = 0.88 } = {}) {
  const data = new Uint8Array(width * height * 4)
  const heightMap = new Float32Array(width * height)
  fill(data, heightMap, width, height)
  const map = new THREE.DataTexture(data, width, height)
  map.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 16
  map.needsUpdate = true

  const normalData = new Uint8Array(width * height * 4)
  const roughnessData = new Uint8Array(width * height * 4)
  const strength = 2.4
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const l = heightMap[y * width + Math.max(x - 1, 0)]
      const r = heightMap[y * width + Math.min(x + 1, width - 1)]
      const u = heightMap[Math.max(y - 1, 0) * width + x]
      const d = heightMap[Math.min(y + 1, height - 1) * width + x]
      let nx = (l - r) * strength
      let ny = (d - u) * strength
      let nz = 1
      const len = Math.hypot(nx, ny, nz) || 1
      nx /= len
      ny /= len
      nz /= len
      const i = (y * width + x) * 4
      normalData[i] = (nx * 0.5 + 0.5) * 255
      normalData[i + 1] = (ny * 0.5 + 0.5) * 255
      normalData[i + 2] = (nz * 0.5 + 0.5) * 255
      normalData[i + 3] = 255
      const rough = THREE.MathUtils.clamp(mix(roughMin, roughMax, heightMap[y * width + x]), 0, 1) * 255
      roughnessData[i] = rough
      roughnessData[i + 1] = rough
      roughnessData[i + 2] = rough
      roughnessData[i + 3] = 255
    }
  }
  const normalMap = new THREE.DataTexture(normalData, width, height)
  normalMap.colorSpace = THREE.NoColorSpace
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping
  normalMap.anisotropy = 16
  normalMap.needsUpdate = true

  const roughnessMap = new THREE.DataTexture(roughnessData, width, height)
  roughnessMap.colorSpace = THREE.NoColorSpace
  roughnessMap.wrapS = THREE.RepeatWrapping
  roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.anisotropy = 16
  roughnessMap.needsUpdate = true
  return { map, normalMap, roughnessMap }
}

function woodFill(data, heightMap, width, height, palette, { planks = false } = {}) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const warp = fbm(u * 3.2, v * 0.7, 4)
      const grain = fbm(u * 1.4 + warp * 0.35, v * 18.0, 5)
      const rings = Math.sin((u * 14 + warp * 1.8 + grain * 0.4) * Math.PI * 2) * 0.5 + 0.5
      const pores = fbm(u * 40, v * 90, 3)
      let t = THREE.MathUtils.clamp(rings * 0.62 + grain * 0.28 + pores * 0.1, 0, 1)
      if (planks) {
        const boards = 9
        const board = Math.floor(v * boards)
        const local = v * boards - board
        t = THREE.MathUtils.clamp(t + (hash2(board, 4) - 0.5) * 0.16, 0, 1)
        if (local < 0.045) t *= 0.22
      }
      const i = (y * width + x) * 4
      data[i] = mix(palette[0], palette[3], t)
      data[i + 1] = mix(palette[1], palette[4], t)
      data[i + 2] = mix(palette[2], palette[5], t)
      data[i + 3] = 255
      heightMap[y * width + x] = t * 0.55 + pores * 0.2
    }
  }
}

function plasterFill(data, heightMap, width, height) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const n = fbm(u * 6, v * 6, 5)
      const speckle = fbm(u * 40, v * 40, 2)
      const t = n * 0.85 + speckle * 0.15
      const i = (y * width + x) * 4
      data[i] = mix(196, 228, t)
      data[i + 1] = mix(176, 210, t)
      data[i + 2] = mix(150, 186, t)
      data[i + 3] = 255
      heightMap[y * width + x] = t * 0.35
    }
  }
}

function metalFill(data, heightMap, width, height) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const brush = fbm(u * 2.5, v * 48, 3)
      const t = brush
      const i = (y * width + x) * 4
      data[i] = mix(92, 168, t)
      data[i + 1] = mix(96, 172, t)
      data[i + 2] = mix(102, 178, t)
      data[i + 3] = 255
      heightMap[y * width + x] = t * 0.22
    }
  }
}

function ceramicFill(data, heightMap, width, height) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const n = fbm(u * 8, v * 8, 4)
      const i = (y * width + x) * 4
      data[i] = mix(232, 248, n)
      data[i + 1] = mix(220, 240, n)
      data[i + 2] = mix(204, 228, n)
      data[i + 3] = 255
      heightMap[y * width + x] = n * 0.12
    }
  }
}

function tileFill(data, heightMap, width, height) {
  const cols = 7
  const rows = 10
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const col = Math.floor(u * cols)
      const row = Math.floor(v * rows)
      const fu = u * cols - col
      const fv = v * rows - row
      const grout = fu < 0.07 || fv < 0.09 || fu > 0.96 || fv > 0.94
      const i = (y * width + x) * 4
      if (grout) {
        data[i] = 92
        data[i + 1] = 78
        data[i + 2] = 64
        data[i + 3] = 255
        heightMap[y * width + x] = 0.02
      } else {
        const n = fbm(u * 18, v * 18, 3)
        const stain = hash2(col, row) * 0.12
        data[i] = mix(214, 236, n) - stain * 30
        data[i + 1] = mix(196, 216, n) - stain * 22
        data[i + 2] = mix(168, 188, n) - stain * 10
        data[i + 3] = 255
        heightMap[y * width + x] = 0.22 + n * 0.08
      }
    }
  }
}

function leatherFill(data, heightMap, width, height) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const grain = fbm(u * 28, v * 28, 4)
      const wrinkle = fbm(u * 6, v * 4, 3)
      const t = grain * 0.7 + wrinkle * 0.3
      const i = (y * width + x) * 4
      data[i] = mix(58, 92, t)
      data[i + 1] = mix(32, 52, t)
      data[i + 2] = mix(22, 36, t)
      data[i + 3] = 255
      heightMap[y * width + x] = t * 0.4
    }
  }
}

function duskFill(data, heightMap, width, height) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const sky = 1 - v
      const haze = fbm(u * 2.2, v * 1.4, 4)
      const i = (y * width + x) * 4
      const r = mix(18, 255, Math.min(1, sky * 0.55 + (1 - Math.abs(v - 0.42)) * 0.7))
      const g = mix(10, 140, sky * 0.35 + haze * 0.2)
      const b = mix(22, 90, sky * 0.55)
      data[i] = r
      data[i + 1] = mix(g, 90, v)
      data[i + 2] = mix(b, 48, 1 - sky)
      data[i + 3] = 255
      if (v > 0.52) {
        const building = ((Math.floor(u * 18) * 17 + Math.floor(v * 12)) % 7) / 7
        const h = 0.52 + building * 0.28
        if (v < h) {
          data[i] = 12 + building * 18
          data[i + 1] = 8 + building * 10
          data[i + 2] = 14
          if (hash2(Math.floor(u * 48), Math.floor(v * 36)) > 0.82) {
            data[i] = 255
            data[i + 1] = 190
            data[i + 2] = 90
          }
        }
      }
      heightMap[y * width + x] = 0
    }
  }
}

function canvasTexture(draw, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  draw(ctx, w, h)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function tileRepeat(src, x, y) {
  src.map.repeat.set(x, y)
  src.normalMap.repeat.set(x, y)
  src.roughnessMap.repeat.set(x, y)
  return src
}

let maps

export function getCafeMaps() {
  if (maps) return maps

  const walnut = makeDataTexture(512, 512, (data, heightMap, w, h) => {
    woodFill(data, heightMap, w, h, [42, 24, 14, 118, 78, 42])
  })
  const oak = makeDataTexture(512, 512, (data, heightMap, w, h) => {
    woodFill(data, heightMap, w, h, [62, 38, 22, 156, 110, 68])
  })
  const floor = makeDataTexture(512, 512, (data, heightMap, w, h) => {
    woodFill(data, heightMap, w, h, [38, 22, 12, 108, 70, 38], { planks: true })
  }, { roughMin: 0.48, roughMax: 0.92 })
  tileRepeat(floor, 8, 8)
  const plaster = makeDataTexture(512, 512, plasterFill, { roughMin: 0.78, roughMax: 0.98 })
  plaster.map.repeat.set(2, 2)
  plaster.normalMap.repeat.set(2, 2)
  plaster.roughnessMap.repeat.set(2, 2)
  const metal = makeDataTexture(512, 512, metalFill, { roughMin: 0.12, roughMax: 0.38 })
  const ceramic = makeDataTexture(256, 256, ceramicFill, { roughMin: 0.08, roughMax: 0.28 })
  const tiles = makeDataTexture(512, 512, tileFill, { roughMin: 0.18, roughMax: 0.42 })
  tiles.map.repeat.set(2.4, 1.1)
  tiles.normalMap.repeat.set(2.4, 1.1)
  tiles.roughnessMap.repeat.set(2.4, 1.1)
  const leather = makeDataTexture(256, 256, leatherFill, { roughMin: 0.42, roughMax: 0.72 })
  const dusk = makeDataTexture(1024, 768, duskFill)

  const chalkboard = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#1a1712'
    ctx.fillRect(0, 0, w, h)
    const img = ctx.getImageData(0, 0, w, h)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() * 18) | 0
      img.data[i] += n
      img.data[i + 1] += n
      img.data[i + 2] += n
    }
    ctx.putImageData(img, 0, 0)
    ctx.strokeStyle = 'rgba(243,234,220,0.22)'
    ctx.lineWidth = 8
    ctx.strokeRect(36, 36, w - 72, h - 72)
    ctx.fillStyle = '#f3eadc'
    ctx.font = '700 52px "SF Pro Display", Helvetica, sans-serif'
    ctx.fillText("TODAY'S POUR", 80, 140)
    ctx.fillStyle = '#c9a96e'
    ctx.font = '500 34px "SF Pro Text", Helvetica, sans-serif'
    ctx.fillText('01  Integrations & workflows', 80, 260)
    ctx.fillText('02  Internal tools & automation', 80, 340)
    ctx.fillText('03  Web platforms in production', 80, 420)
    ctx.fillStyle = 'rgba(243,234,220,0.55)'
    ctx.font = '400 26px "SF Pro Text", Helvetica, sans-serif'
    ctx.fillText('Azure  ·  Freshworks  ·  Python  ·  Next.js', 80, 540)
  }, 1024, 768)

  const sign = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#120c0a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c9a96e'
    ctx.textAlign = 'center'
    ctx.font = '700 78px "SF Pro Display", Helvetica, sans-serif'
    ctx.shadowColor = '#c9a96e'
    ctx.shadowBlur = 18
    ctx.fillText('TARS ONLINE CAFE', w / 2, 118)
  }, 1024, 192)

  const screen = canvasTexture((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#241810')
    g.addColorStop(1, '#0c0907')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c9a96e'
    ctx.font = '700 40px "SF Pro Display", Helvetica, sans-serif'
    ctx.fillText('solve my PROBLEM', 56, 140)
    ctx.fillStyle = '#f3eadc'
    ctx.font = '400 26px "SF Pro Text", Helvetica, sans-serif'
    ctx.fillText('Email marketing & lead generation', 56, 196)
    ctx.fillText('for growing businesses', 56, 234)
    ctx.fillStyle = '#c9a96e'
    ctx.fillRect(56, 310, 248, 56)
    ctx.fillStyle = '#1d1d1f'
    ctx.font = '650 20px "SF Pro Text", Helvetica, sans-serif'
    ctx.fillText('Get a Free Quote', 86, 346)
    ctx.fillStyle = 'rgba(243,234,220,0.5)'
    ctx.font = '400 18px "SF Pro Text", Helvetica, sans-serif'
    ctx.fillText('solvemyproblem.co.za  ·  Live  ·  POPIA', 56, 470)
  }, 1024, 640)

  const keyboard = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#161618'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a2a2e'
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 14; col += 1) {
        ctx.fillRect(18 + col * 70, 20 + row * 46, 60, 36)
      }
    }
    ctx.fillStyle = '#3a3a40'
    ctx.fillRect(360, 270, 300, 90)
  }, 1024, 400)

  const leaf = canvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.translate(w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(0, -h * 0.44)
    ctx.bezierCurveTo(w * 0.3, -h * 0.18, w * 0.32, h * 0.16, 0, h * 0.44)
    ctx.bezierCurveTo(-w * 0.32, h * 0.16, -w * 0.3, -h * 0.18, 0, -h * 0.44)
    const g = ctx.createLinearGradient(-w * 0.1, -h * 0.4, w * 0.12, h * 0.4)
    g.addColorStop(0, '#5a9a58')
    g.addColorStop(0.45, '#2f6a38')
    g.addColorStop(1, '#1c4022')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = 'rgba(18, 40, 20, 0.45)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -h * 0.4)
    ctx.lineTo(0, h * 0.4)
    ctx.stroke()
  }, 256, 256)

  maps = {
    walnut,
    oak,
    floor,
    plaster,
    metal,
    ceramic,
    tiles,
    leather,
    dusk: dusk.map,
    chalkboard,
    sign,
    screen,
    keyboard,
    leaf,
  }
  return maps
}
