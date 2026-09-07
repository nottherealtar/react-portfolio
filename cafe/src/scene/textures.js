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

function makeDataTexture(width, height, fill, srgb = true) {
  const data = new Uint8Array(width * height * 4)
  const heightMap = new Float32Array(width * height)
  fill(data, heightMap, width, height)
  const map = new THREE.DataTexture(data, width, height)
  map.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8
  map.needsUpdate = true

  const normalData = new Uint8Array(width * height * 4)
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
    }
  }
  const normalMap = new THREE.DataTexture(normalData, width, height)
  normalMap.colorSpace = THREE.NoColorSpace
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping
  normalMap.anisotropy = 8
  normalMap.needsUpdate = true
  return { map, normalMap }
}

function mix(a, b, t) {
  return a + (b - a) * t
}

function woodFill(data, heightMap, width, height, palette) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const warp = fbm(u * 3.2, v * 0.7, 4)
      const grain = fbm(u * 1.4 + warp * 0.35, v * 18.0, 5)
      const rings = Math.sin((u * 14 + warp * 1.8 + grain * 0.4) * Math.PI * 2) * 0.5 + 0.5
      const pores = fbm(u * 40, v * 90, 3)
      const t = THREE.MathUtils.clamp(rings * 0.62 + grain * 0.28 + pores * 0.1, 0, 1)
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
    woodFill(data, heightMap, w, h, [38, 22, 12, 108, 70, 38])
  })
  floor.map.repeat.set(8, 8)
  floor.normalMap.repeat.set(8, 8)
  const plaster = makeDataTexture(512, 512, plasterFill)
  const metal = makeDataTexture(512, 512, metalFill)
  const ceramic = makeDataTexture(256, 256, ceramicFill)
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

  maps = {
    walnut,
    oak,
    floor,
    plaster,
    metal,
    ceramic,
    dusk: dusk.map,
    chalkboard,
    sign,
    screen,
    keyboard,
  }
  return maps
}
