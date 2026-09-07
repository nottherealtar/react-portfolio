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
      roughness={roughness}
      metalness={metalness}
      clearcoat={0.08}
      clearcoatRoughness={0.7}
    />
  )
}

export function Metal() {
  const maps = useMaps()
  return (
    <meshPhysicalMaterial
      map={maps.metal.map}
      normalMap={maps.metal.normalMap}
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
      roughness={0.22}
      metalness={0.04}
      clearcoat={0.85}
      clearcoatRoughness={0.18}
      envMapIntensity={0.9}
    />
  )
}

export function Steam({ position = [0, 0, 0], count = 48, reduced }) {
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
    <points position={position} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={steamVertex}
        fragmentShader={steamFragment}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
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
      <circleGeometry args={[radius, 48]} />
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
      />
    </mesh>
  )
}

export function Cup({ position, rotation = [0, 0, 0], withSteam, reduced }) {
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

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <latheGeometry args={[profile, 48]} />
        <Ceramic />
      </mesh>
      <CoffeeSurface />
      <mesh position={[0.082, 0.05, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.03, 0.0075, 12, 28, Math.PI]} />
        <Ceramic />
      </mesh>
      {withSteam && <Steam position={[0, 0.12, 0]} count={36} reduced={reduced} />}
    </group>
  )
}

export function EspressoMachine() {
  const beanRef = useRef()
  const beanSeeds = useMemo(
    () =>
      Array.from({ length: 42 }, () => ({
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
      <RoundedBox args={[0.92, 0.58, 0.46]} radius={0.035} smoothness={6} position={[0, 0.29, 0]} castShadow>
        <Metal />
      </RoundedBox>
      <RoundedBox args={[0.92, 0.08, 0.46]} radius={0.02} smoothness={4} position={[0, 0.62, 0]}>
        <meshPhysicalMaterial color="#1a1c20" metalness={0.85} roughness={0.22} />
      </RoundedBox>
      {[-0.2, 0.18].map((x) => (
        <group key={x} position={[x, 0.16, 0.24]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.08, 24]} />
            <Metal />
          </mesh>
          <mesh position={[0, -0.08, 0.02]} rotation={[0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.042, 0.12, 20]} />
            <meshPhysicalMaterial color="#2a1c14" roughness={0.45} metalness={0.2} />
          </mesh>
          <mesh position={[0.07, -0.1, 0.02]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.09, 0.018, 0.03]} />
            <Metal />
          </mesh>
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
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.78, 0.04, 0.22]} />
        <meshPhysicalMaterial color="#1c1c1e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.34, 0.44, 0.235]}>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 24]} />
        <meshPhysicalMaterial color={crema} emissive={crema} emissiveIntensity={1.4} metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.16, 24]} />
        <meshPhysicalMaterial color="#2a241c" roughness={0.5} />
      </mesh>
      <instancedMesh ref={beanRef} args={[undefined, undefined, 42]} position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#3a2214" roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

export function BarStool({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.16, 0.045, 32]} />
        <Wood variant="walnut" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.155, 0.155, 0.03, 32]} />
        <meshPhysicalMaterial color="#4a3020" roughness={0.55} />
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
    <group position={[-2.42, 0.805, -1.02]} rotation={[0, 0.48, 0]}>
      <RoundedBox args={[0.64, 0.018, 0.44]} radius={0.012} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#1c1c1e" metalness={0.55} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0, 0.01, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.36]} />
        <meshBasicMaterial map={maps.keyboard} />
      </mesh>
      <group position={[0, 0.205, -0.2]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[0.64, 0.4, 0.016]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial color="#111214" metalness={0.4} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.01, 0.01]}>
          <planeGeometry args={[0.58, 0.34]} />
          <meshBasicMaterial map={maps.screen} toneMapped={false} />
        </mesh>
      </group>
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
      ctx.fillStyle = '#efe3cc'
      ctx.fillRect(0, 0, 512, 704)
      ctx.fillStyle = '#3a2a1c'
      ctx.font = 'italic 36px "SF Pro Text", Georgia, serif'
      wrapText(ctx, `"${quote}"`, 48, 160, 416, 48)
      ctx.font = '600 28px "SF Pro Text", Helvetica, sans-serif'
      ctx.fillText(`— ${name}`, 48, 620)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
      return texture
    })
  }, [])

  return (
    <group position={[-3.52, 1.48, 0.15]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.58, 0, 0.58].map((x, i) => (
        <group key={x} position={[x, 0.08, 0.03]} rotation={[0, 0, (i - 1) * 0.03]}>
          <RoundedBox args={[0.46, 0.6, 0.02]} radius={0.01} smoothness={3} castShadow>
            <meshPhysicalMaterial color="#efe3cc" roughness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.42, 0.54]} />
            <meshBasicMaterial map={notes[i]} />
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
      <RoundedBox args={[2.5, 0.05, 0.3]} radius={0.01} smoothness={3}>
        <Wood variant="oak" />
      </RoundedBox>
      {[-0.95, -0.48, 0, 0.48, 0.95].map((x, i) => (
        <group key={x} position={[x, 0.24, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.048, 0.052, 0.42, 20]} />
            <meshPhysicalMaterial
              color={i % 2 ? '#4a2018' : '#243428'}
              roughness={0.22}
              metalness={0.05}
              clearcoat={0.4}
            />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.03, 0.036, 0.08, 16]} />
            <meshPhysicalMaterial color="#cfc6b8" roughness={0.2} metalness={0.1} />
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
        <meshStandardMaterial color="#ffd7a1" emissive="#ffc07a" emissiveIntensity={4.2} />
      </mesh>
      <pointLight position={[0, -0.56, 0]} color="#ffc27a" intensity={intensity} distance={5.5} decay={2} />
    </group>
  )
}

export function Plant({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.16, 16]} />
        <meshStandardMaterial color="#6b3a28" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 1.1) * 0.09, 0.24 + (i % 3) * 0.05, Math.cos(i * 1.1) * 0.09]}
          rotation={[0.45, i, 0.15]}
          castShadow
        >
          <sphereGeometry args={[0.085 - i * 0.006, 14, 12]} />
          <meshPhysicalMaterial color="#2c5a38" roughness={0.55} />
        </mesh>
      ))}
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
          opacity={0.1}
          roughness={0.08}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.97, 0.02]}>
        <boxGeometry args={[3.72, 0.07, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, -0.97, 0.02]}>
        <boxGeometry args={[3.72, 0.07, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[-1.8, 0, 0.02]}>
        <boxGeometry args={[0.07, 1.98, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[1.8, 0, 0.02]}>
        <boxGeometry args={[0.07, 1.98, 0.09]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.05, 1.98, 0.07]} />
        <Wood variant="oak" />
      </mesh>
    </group>
  )
}
