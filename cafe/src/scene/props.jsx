import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { coffeeFragment, coffeeVertex, godrayFragment, godrayVertex, steamFragment, steamVertex } from './shaders'
import { getCafeMaps } from './textures'

const crema = '#c9a96e'

function useMaps() {
  return useMemo(() => getCafeMaps(), [])
}

export function Wood({ variant = 'walnut', roughness = 0.62, metalness = 0.04 }) {
  const maps = useMaps()
  const src = variant === 'oak' ? maps.oak : variant === 'floor' ? maps.floor : maps.walnut
  return (
    <meshPhysicalMaterial
      map={src.map}
      normalMap={src.normalMap}
      roughnessMap={src.roughnessMap}
      roughness={roughness}
      metalness={metalness}
      clearcoat={0.08}
      clearcoatRoughness={0.7}
      envMapIntensity={0.85}
    />
  )
}

export function Metal() {
  const maps = useMaps()
  return (
    <meshPhysicalMaterial
      map={maps.metal.map}
      normalMap={maps.metal.normalMap}
      roughnessMap={maps.metal.roughnessMap}
      metalness={0.92}
      roughness={0.28}
      clearcoat={0.35}
      clearcoatRoughness={0.25}
      envMapIntensity={1.2}
    />
  )
}

export function Plaster() {
  const maps = useMaps()
  return (
    <meshStandardMaterial
      map={maps.plaster.map}
      normalMap={maps.plaster.normalMap}
      roughnessMap={maps.plaster.roughnessMap}
      roughness={0.92}
      metalness={0}
    />
  )
}

export function Ceramic() {
  const maps = useMaps()
  return (
    <meshPhysicalMaterial
      map={maps.ceramic.map}
      normalMap={maps.ceramic.normalMap}
      roughnessMap={maps.ceramic.roughnessMap}
      roughness={0.22}
      metalness={0.04}
      clearcoat={0.85}
      clearcoatRoughness={0.18}
      envMapIntensity={0.9}
    />
  )
}

export function Tiles() {
  const maps = useMaps()
  return (
    <meshPhysicalMaterial
      map={maps.tiles.map}
      normalMap={maps.tiles.normalMap}
      roughnessMap={maps.tiles.roughnessMap}
      roughness={0.32}
      metalness={0.06}
      clearcoat={0.35}
      clearcoatRoughness={0.4}
    />
  )
}

export function Steam({ position = [0, 0, 0], count = 20, reduced }) {
  const mat = useRef()
  const geo = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const offsets = new Float32Array(count)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 0.08
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.08
      seeds[i] = Math.random()
      offsets[i] = Math.random()
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    return geometry
  }, [count])

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime
  })

  if (reduced) return null

  return (
    <points position={position} geometry={geo}>
      <shaderMaterial
        ref={mat}
        vertexShader={steamVertex}
        fragmentShader={steamFragment}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

export function CoffeeSurface({ radius = 0.055 }) {
  const mat = useRef()
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.046, 0]}>
      <circleGeometry args={[radius, 32]} />
      <shaderMaterial
        ref={mat}
        vertexShader={coffeeVertex}
        fragmentShader={coffeeFragment}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  )
}

export function GodRays({ reduced }) {
  const mat = useRef()
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime
  })
  if (reduced) return null
  return (
    <mesh position={[0, 1.55, -2.35]} rotation={[0.18, 0, 0]}>
      <planeGeometry args={[3.2, 2.4]} />
      <shaderMaterial
        ref={mat}
        vertexShader={godrayVertex}
        fragmentShader={godrayFragment}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

export function Cup({ position, rotation = [0, 0, 0], withSteam, reduced, scale = 1, simple = false }) {
  const profile = useMemo(
    () =>
      [
        [0.05, 0],
        [0.056, 0.012],
        [0.068, 0.09],
        [0.072, 0.108],
        [0.064, 0.112],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const saucer = useMemo(
    () =>
      [
        [0.02, 0],
        [0.09, 0.006],
        [0.118, 0.012],
        [0.122, 0.018],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, -0.006, 0]} receiveShadow>
        <latheGeometry args={[saucer, 24]} />
        <Ceramic />
      </mesh>
      <mesh castShadow>
        <latheGeometry args={[profile, 28]} />
        <Ceramic />
      </mesh>
      {!simple && <CoffeeSurface />}
      <group position={[0.062, 0.054, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
          <torusGeometry args={[0.034, 0.0084, 10, 20, Math.PI]} />
          <Ceramic />
        </mesh>
        <mesh position={[0.001, 0.033, 0]} castShadow>
          <sphereGeometry args={[0.009, 10, 8]} />
          <Ceramic />
        </mesh>
        <mesh position={[0.001, -0.033, 0]} castShadow>
          <sphereGeometry args={[0.009, 10, 8]} />
          <Ceramic />
        </mesh>
      </group>
      {withSteam && <Steam position={[0, 0.12, 0]} count={20} reduced={reduced} />}
    </group>
  )
}

export function EspressoMachine({ reduced }) {
  const beanRef = useRef()
  const beanSeeds = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        x: (Math.random() - 0.5) * 0.14,
        y: Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.14,
        s: 0.7 + Math.random() * 0.5,
        r: Math.random() * Math.PI,
      })),
    [],
  )

  useLayoutEffect(() => {
    if (!beanRef.current) return
    const dummy = new THREE.Object3D()
    beanSeeds.forEach((seed, i) => {
      dummy.position.set(seed.x, seed.y, seed.z)
      dummy.rotation.set(seed.r, seed.r * 0.4, 0)
      dummy.scale.set(seed.s, seed.s * 0.65, seed.s)
      dummy.updateMatrix()
      beanRef.current.setMatrixAt(i, dummy.matrix)
    })
    beanRef.current.instanceMatrix.needsUpdate = true
  }, [beanSeeds])

  return (
    <group position={[0.1, 0.99, -0.52]}>
      <RoundedBox args={[0.92, 0.58, 0.46]} radius={0.035} smoothness={3} position={[0, 0.29, 0]} castShadow>
        <Metal />
      </RoundedBox>
      <RoundedBox args={[0.92, 0.08, 0.46]} radius={0.02} smoothness={3} position={[0, 0.62, 0]}>
        <meshPhysicalMaterial color="#1a1c20" metalness={0.85} roughness={0.22} />
      </RoundedBox>
      {[-0.2, 0.18].map((x) => (
        <group key={x} position={[x, 0.16, 0.24]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.08, 16]} />
            <Metal />
          </mesh>
          <mesh position={[0, -0.08, 0.02]} rotation={[0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.042, 0.12, 14]} />
            <meshPhysicalMaterial color="#2a1c14" roughness={0.45} metalness={0.2} />
          </mesh>
          <group position={[0.048, -0.09, 0.03]} rotation={[0.08, 0.12, -0.18]}>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.011, 0.014, 0.17, 12]} />
              <Metal />
            </mesh>
            <mesh position={[0.185, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.015, 0.12, 12]} />
              <meshPhysicalMaterial color="#1a1410" roughness={0.62} />
            </mesh>
            <mesh position={[0.248, 0, 0]} castShadow>
              <sphereGeometry args={[0.017, 12, 10]} />
              <meshPhysicalMaterial color="#1a1410" roughness={0.62} />
            </mesh>
          </group>
          <Cup position={[0, -0.155, 0.07]} scale={0.72} simple reduced={reduced} />
        </group>
      ))}
      <mesh position={[0.38, 0.34, 0.18]} rotation={[0.4, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
        <Metal />
      </mesh>
      <mesh position={[0.38, 0.22, 0.3]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <Metal />
      </mesh>
      <mesh position={[-0.34, 0.46, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.012, 28]} />
        <meshPhysicalMaterial color="#1a1c20" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[-0.34, 0.46, 0.242]}>
        <circleGeometry args={[0.03, 24]} />
        <meshPhysicalMaterial color="#c9a227" metalness={0.6} roughness={0.2} emissive="#c9a227" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.78, 0.04, 0.22]} />
        <meshPhysicalMaterial color="#1c1c1e" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.28, -0.14, 0, 0.14, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.042, 0.2]}>
          <boxGeometry args={[0.08, 0.006, 0.18]} />
          <Metal />
        </mesh>
      ))}
      <mesh position={[0.34, 0.44, 0.235]}>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 24]} />
        <meshPhysicalMaterial color={crema} emissive={crema} emissiveIntensity={1.4} metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.16, 24]} />
        <meshPhysicalMaterial
          color="#2a241c"
          roughness={0.18}
          metalness={0.12}
          clearcoat={0.45}
        />
      </mesh>
      <instancedMesh ref={beanRef} args={[undefined, undefined, 24]} position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color="#3a2214" roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

export function Tamper({ position = [0.72, 1.01, -0.18] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.018, 24]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.06, 12]} />
        <Wood variant="walnut" />
      </mesh>
    </group>
  )
}

export function BarStool({ position }) {
  const maps = useMaps()
  return (
    <group position={position}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.16, 0.045, 32]} />
        <Wood variant="walnut" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.155, 0.155, 0.03, 32]} />
        <meshPhysicalMaterial
          map={maps.leather.map}
          normalMap={maps.leather.normalMap}
          roughnessMap={maps.leather.roughnessMap}
          roughness={0.55}
          clearcoat={0.12}
        />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.44, 16]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 10, 28]} />
        <Metal />
      </mesh>
    </group>
  )
}

export function Laptop() {
  const maps = useMaps()
  return (
    <group position={[-2.34, 0.822, -0.94]} rotation={[0, 0.52, 0]} scale={1.48}>
      <RoundedBox args={[0.78, 0.014, 0.52]} radius={0.014} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#4a4a50" metalness={0.82} roughness={0.28} clearcoat={0.22} />
      </RoundedBox>
      <mesh position={[0, 0.008, 0.012]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.46]} />
        <meshPhysicalMaterial color="#1c1c20" roughness={0.62} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.0105, -0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.27]} />
        <meshBasicMaterial map={maps.keyboard} />
      </mesh>
      <RoundedBox args={[0.3, 0.0035, 0.18]} radius={0.012} smoothness={3} position={[0, 0.011, 0.16]}>
        <meshPhysicalMaterial color="#2e2e34" metalness={0.5} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0.009, -0.252]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.74, 12]} />
        <meshPhysicalMaterial color="#2a2a30" metalness={0.84} roughness={0.24} />
      </mesh>
      <group position={[0, 0.016, -0.252]} rotation={[-0.12, 0, 0]}>
        <group position={[0, 0.225, 0]}>
          <RoundedBox args={[0.78, 0.46, 0.012]} radius={0.012} smoothness={4} castShadow>
            <meshPhysicalMaterial color="#4a4a50" metalness={0.82} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0, 0, 0.007]}>
            <planeGeometry args={[0.74, 0.42]} />
            <meshPhysicalMaterial color="#09090b" roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.006, 0.0086]}>
            <planeGeometry args={[0.7, 0.394]} />
            <meshBasicMaterial map={maps.screen} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.208, 0.008]}>
            <circleGeometry args={[0.0045, 10]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0.208, 0.0084]}>
            <circleGeometry args={[0.0018, 8]} />
            <meshStandardMaterial color="#1a3048" emissive="#3a6a9a" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>
      {[[-0.32, -0.2], [0.32, -0.2], [-0.32, 0.2], [0.32, 0.2]].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, -0.01, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.006, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  )
}

export function MenuBoard() {
  const maps = useMaps()
  return (
    <group position={[3.52, 1.58, -0.65]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[1.78, 1.22, 0.07]} radius={0.03} smoothness={4}>
        <Wood variant="walnut" />
      </RoundedBox>
      <mesh position={[0, 0, 0.038]}>
        <planeGeometry args={[1.58, 1.04]} />
        <meshBasicMaterial map={maps.chalkboard} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function GuestWall() {
  const notes = useMemo(() => {
    const items = [
      ['I love the site.', 'Jacques'],
      ['Proactive across teams.', 'Beryl'],
      ['Knowledgeable, with a smile.', 'Jason'],
    ]
    return items.map(([quote, name]) => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 704
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#e8d7b6'
      ctx.fillRect(0, 0, 512, 704)
      const paper = ctx.getImageData(0, 0, 512, 704)
      for (let p = 0; p < paper.data.length; p += 4) {
        const n = (Math.random() * 22) | 0
        paper.data[p] -= n
        paper.data[p + 1] -= n
        paper.data[p + 2] -= n
      }
      ctx.putImageData(paper, 0, 0)
      ctx.fillStyle = '#2a1c12'
      ctx.font = 'italic 48px Georgia, "Times New Roman", serif'
      wrapText(ctx, `"${quote}"`, 40, 150, 430, 62)
      ctx.font = '600 34px Georgia, "Times New Roman", serif'
      ctx.fillText(`— ${name}`, 40, 600)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
      return texture
    })
  }, [])

  return (
    <group position={[-3.52, 1.48, 0.15]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.58, 0, 0.58].map((x, i) => (
        <group key={x} position={[x, 0.08, 0.05]} rotation={[0, 0, (i - 1) * 0.03]}>
          <mesh position={[0, 0, -0.01]} castShadow>
            <boxGeometry args={[0.5, 0.64, 0.018]} />
            <meshPhysicalMaterial color="#d7c4a0" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0, 0.002]} castShadow>
            <planeGeometry args={[0.46, 0.6]} />
            <meshPhysicalMaterial map={notes[i]} roughness={0.86} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let cursor = y
  words.forEach((word) => {
    const test = `${line}${word} `
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, cursor)
      line = `${word} `
      cursor += lineHeight
    } else {
      line = test
    }
  })
  ctx.fillText(line.trim(), x, cursor)
}

export function BottleShelf() {
  return (
    <group position={[0.15, 1.92, -1.02]}>
      <RoundedBox args={[2.5, 0.05, 0.3]} radius={0.01} smoothness={2}>
        <Wood variant="oak" />
      </RoundedBox>
      {[-0.85, -0.28, 0.28, 0.85].map((x, i) => (
        <group key={x} position={[x, 0.24, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.048, 0.052, 0.42, 14]} />
            <meshPhysicalMaterial
              color={i % 2 ? '#4a2018' : '#243428'}
              roughness={0.16}
              metalness={0.08}
              clearcoat={0.55}
              clearcoatRoughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.03, 0.036, 0.08, 12]} />
            <meshPhysicalMaterial color="#cfc6b8" roughness={0.22} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Pendant({ position, intensity = 8 }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.62, 10]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.18, 32]} />
        <Wood variant="walnut" roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshStandardMaterial color="#ffd7a1" emissive="#ffc07a" emissiveIntensity={4.2} toneMapped={false} />
      </mesh>
      {intensity > 0 && (
        <pointLight position={[0, -0.56, 0]} color="#ffc27a" intensity={intensity} distance={5.5} decay={2} />
      )}
    </group>
  )
}

export function Plant({ position }) {
  const maps = useMaps()
  const leafRef = useRef()

  useLayoutEffect(() => {
    if (!leafRef.current) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 + (i % 3) * 0.2
      dummy.position.set(Math.sin(a) * 0.08, 0.2 + (i % 4) * 0.045, Math.cos(a) * 0.08)
      dummy.rotation.set(0.85, a, 0.18)
      dummy.scale.setScalar(0.72 + (i % 3) * 0.14)
      dummy.updateMatrix()
      leafRef.current.setMatrixAt(i, dummy.matrix)
    }
    leafRef.current.instanceMatrix.needsUpdate = true
  }, [])

  const pot = useMemo(
    () =>
      [
        [0.09, 0],
        [0.11, 0.02],
        [0.1, 0.14],
        [0.12, 0.155],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )

  return (
    <group position={position}>
      <mesh castShadow>
        <latheGeometry args={[pot, 24]} />
        <meshStandardMaterial color="#6b3a28" roughness={0.82} />
      </mesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, 10]}>
        <planeGeometry args={[0.16, 0.22]} />
        <meshPhysicalMaterial
          map={maps.leaf}
          transparent
          alphaTest={0.35}
          side={THREE.DoubleSide}
          roughness={0.55}
        />
      </instancedMesh>
    </group>
  )
}

export function ShopSign() {
  const maps = useMaps()
  return (
    <group position={[0, 2.58, -3.18]}>
      <RoundedBox args={[2.05, 0.4, 0.08]} radius={0.02} smoothness={3}>
        <meshPhysicalMaterial color="#160f0c" metalness={0.2} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.86, 0.28]} />
        <meshBasicMaterial map={maps.sign} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Window() {
  const maps = useMaps()
  return (
    <group position={[0, 1.72, -3.34]}>
      <mesh>
        <planeGeometry args={[3.55, 1.9]} />
        <meshBasicMaterial map={maps.dusk} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.55, 1.9]} />
        <meshPhysicalMaterial
          color="#d7c4a4"
          transparent
          opacity={0.12}
          roughness={0.08}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.97, 0.03]}>
        <boxGeometry args={[3.72, 0.07, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, -0.97, 0.03]}>
        <boxGeometry args={[3.72, 0.07, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[-1.8, 0, 0.03]}>
        <boxGeometry args={[0.07, 1.98, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[1.8, 0, 0.03]}>
        <boxGeometry args={[0.07, 1.98, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.05, 1.98, 0.07]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 3.5, 0.07]} />
        <Wood variant="oak" />
      </mesh>
    </group>
  )
}
