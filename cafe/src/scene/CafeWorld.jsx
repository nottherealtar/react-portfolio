import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useCafe } from '../ui/CafeContext'

const wood = '#3a2618'
const woodDark = '#24160e'
const plaster = '#d8c4aa'
const metal = '#8a8f96'
const espresso = '#1a110c'
const crema = '#c9a96e'
const foam = '#f3eadc'

function makeChalkTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1c1914'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#2a241c'
  ctx.fillRect(28, 28, canvas.width - 56, canvas.height - 56)
  ctx.strokeStyle = 'rgba(243,234,220,0.2)'
  ctx.lineWidth = 6
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)
  ctx.fillStyle = '#f3eadc'
  ctx.font = '700 54px "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText("TODAY'S POUR", 90, 150)
  ctx.font = '500 36px "SF Pro Text", "Helvetica Neue", sans-serif'
  ctx.fillStyle = '#c9a96e'
  const lines = [
    '01  Integrations & workflows',
    '02  Internal tools & automation',
    '03  Web platforms in production',
  ]
  lines.forEach((line, i) => ctx.fillText(line, 90, 280 + i * 90))
  ctx.fillStyle = 'rgba(243,234,220,0.55)'
  ctx.font = '400 28px "SF Pro Text", "Helvetica Neue", sans-serif'
  ctx.fillText('Azure · Freshworks · Python · Next.js', 90, 600)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function makeScreenTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 640)
  g.addColorStop(0, '#1b1410')
  g.addColorStop(1, '#0e0b09')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 640)
  ctx.fillStyle = '#c9a96e'
  ctx.font = '700 42px "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText('solve my PROBLEM', 64, 160)
  ctx.fillStyle = '#f3eadc'
  ctx.font = '400 28px "SF Pro Text", "Helvetica Neue", sans-serif'
  ctx.fillText('Email marketing & lead generation', 64, 220)
  ctx.fillText('for growing businesses', 64, 260)
  ctx.fillStyle = '#c9a96e'
  ctx.fillRect(64, 340, 260, 64)
  ctx.fillStyle = '#1d1d1f'
  ctx.font = '650 22px "SF Pro Text", "Helvetica Neue", sans-serif'
  ctx.fillText('Get a Free Quote', 92, 380)
  ctx.fillStyle = 'rgba(243,234,220,0.45)'
  ctx.font = '400 20px "SF Pro Text", "Helvetica Neue", sans-serif'
  ctx.fillText('solvemyproblem.co.za  ·  Live  ·  POPIA', 64, 520)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeSignTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 192
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#160f0c'
  ctx.fillRect(0, 0, 1024, 192)
  ctx.fillStyle = '#c9a96e'
  ctx.font = '700 92px "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TARS ONLINE CAFE', 512, 120)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeWindowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 768)
  g.addColorStop(0, '#2a1c3a')
  g.addColorStop(0.35, '#c45a2a')
  g.addColorStop(0.62, '#e8a15a')
  g.addColorStop(1, '#1a120e')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 768)
  ctx.fillStyle = 'rgba(8,6,10,0.55)'
  for (let i = 0; i < 18; i += 1) {
    const w = 28 + (i % 5) * 10
    const h = 80 + (i * 17) % 160
    ctx.fillRect(40 + i * 54, 420 - h * 0.2, w, h)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function Hotspot({ id, position, children }) {
  const { station, setStation, setHovered } = useCafe()
  const [over, setOver] = useState(false)
  useCursor(over)
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setOver(true)
        setHovered(id)
      }}
      onPointerOut={() => {
        setOver(false)
        setHovered(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        setStation(id)
      }}
    >
      {children}
      <mesh position={[0, 0.02, 0]}>
        <ringGeometry args={[0.16, 0.2, 32]} />
        <meshBasicMaterial
          color={station === id ? crema : foam}
          transparent
          opacity={station === id ? 0.9 : over ? 0.55 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function Steam({ position = [0, 0, 0], count = 28, reduced }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.12,
        z: (Math.random() - 0.5) * 0.12,
        delay: Math.random() * 4,
        speed: 0.18 + Math.random() * 0.22,
        scale: 0.6 + Math.random() * 0.8,
      })),
    [count],
  )

  useFrame((state) => {
    if (!mesh.current || reduced) return
    const t = state.clock.elapsedTime
    seeds.forEach((seed, i) => {
      const life = ((t * seed.speed + seed.delay) % 4) / 4
      dummy.position.set(seed.x + Math.sin(t + i) * 0.04, life * 0.55, seed.z)
      const s = seed.scale * (0.35 + life)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  if (reduced) return null

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={position} frustumCulled={false}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={foam} transparent opacity={0.16} depthWrite={false} />
    </instancedMesh>
  )
}

function Pendant({ position, intensity = 8 }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.16, 24]} />
        <meshStandardMaterial color="#4a3424" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.46, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffd7a1" emissive="#ffbf73" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, -0.55, 0]} color="#ffc27a" intensity={intensity} distance={6} decay={2} />
    </group>
  )
}

function EspressoMachine() {
  return (
    <group position={[0.15, 0.95, -0.55]}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.85, 0.56, 0.42]} />
        <meshStandardMaterial color="#2b2e33" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.85, 0.12, 0.42]} />
        <meshStandardMaterial color="#1b1d21" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[-0.18, 0.18, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.18, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.32, 0.42, 0.22]}>
        <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
        <meshStandardMaterial color={crema} emissive={crema} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Cup({ position, withSteam, reduced }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.065, 0.11, 24]} />
        <meshStandardMaterial color="#efe6d6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
        <meshStandardMaterial color={espresso} roughness={0.5} />
      </mesh>
      <mesh position={[0.09, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.035, 0.01, 8, 16]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      {withSteam && <Steam position={[0, 0.08, 0]} count={18} reduced={reduced} />}
    </group>
  )
}

function Laptop() {
  const screen = useMemo(() => makeScreenTexture(), [])
  return (
    <group position={[-2.45, 0.76, -1.05]} rotation={[0, 0.45, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.02, 0.42]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, -0.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.62, 0.38, 0.018]} />
        <meshStandardMaterial color="#111214" />
      </mesh>
      <mesh position={[0, 0.2, -0.19]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.56, 0.32]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  )
}

function MenuBoard() {
  const chalk = useMemo(() => makeChalkTexture(), [])
  return (
    <group position={[3.55, 1.55, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <boxGeometry args={[1.7, 1.15, 0.06]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[1.55, 1.0]} />
        <meshBasicMaterial map={chalk} toneMapped={false} />
      </mesh>
    </group>
  )
}

function GuestWall() {
  return (
    <group position={[-3.55, 1.45, 0.2]} rotation={[0, Math.PI / 2, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.55, 0.1, 0.03]} castShadow>
          <boxGeometry args={[0.42, 0.55, 0.03]} />
          <meshStandardMaterial color={i === 1 ? '#f0e6d4' : '#e7d7be'} />
        </mesh>
      ))}
    </group>
  )
}

function BarStool({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 20]} />
        <meshStandardMaterial color={woodDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
        <meshStandardMaterial color={metal} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function BottleShelf() {
  return (
    <group position={[0.2, 1.85, -1.05]}>
      <mesh>
        <boxGeometry args={[2.4, 0.06, 0.28]} />
        <meshStandardMaterial color={woodDark} />
      </mesh>
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
        <mesh key={x} position={[x, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.38, 12]} />
          <meshStandardMaterial color={i % 2 ? '#4a2018' : '#2e3a28'} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.16, 12]} />
        <meshStandardMaterial color="#6b3a28" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.sin(i) * 0.08, 0.22, Math.cos(i) * 0.08]} rotation={[0.4, i, 0.2]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#2f5a3a" />
        </mesh>
      ))}
    </group>
  )
}

export default function CafeWorld({ reduced, lowPower }) {
  const windowMap = useMemo(() => makeWindowTexture(), [])
  const signMap = useMemo(() => makeSignTexture(), [])
  const { setStation } = useCafe()

  return (
    <group>
      <hemisphereLight args={['#ffd7b0', '#2a1810', 0.55]} />
      <ambientLight intensity={0.18} color="#f0d2aa" />
      <spotLight
        position={[0, 3.1, 1]}
        angle={0.7}
        penumbra={0.6}
        intensity={lowPower ? 8 : 14}
        color="#ffd0a0"
        castShadow={!lowPower}
        shadow-mapSize={1024}
      />
      <directionalLight position={[-2, 2.4, 4]} intensity={1.1} color="#8aa4ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.2, 9.6]} />
        <meshStandardMaterial color={woodDark} roughness={0.85} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -3.6 + i * 0.68]} receiveShadow>
          <planeGeometry args={[9.2, 0.02]} />
          <meshStandardMaterial color="#1a110c" />
        </mesh>
      ))}

      <mesh position={[0, 1.55, -3.45]} receiveShadow>
        <boxGeometry args={[9.2, 3.1, 0.18]} />
        <meshStandardMaterial color={plaster} roughness={0.9} />
      </mesh>
      <mesh position={[-4.5, 1.55, 0.3]} receiveShadow>
        <boxGeometry args={[0.18, 3.1, 7.6]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[4.5, 1.55, 0.3]} receiveShadow>
        <boxGeometry args={[0.18, 3.1, 7.6]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[-3.1, 1.55, 4.35]} receiveShadow>
        <boxGeometry args={[3.0, 3.1, 0.18]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[3.1, 1.55, 4.35]} receiveShadow>
        <boxGeometry args={[3.0, 3.1, 0.18]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.85, 4.35]}>
        <boxGeometry args={[3.4, 0.55, 0.18]} />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6.2]} receiveShadow>
        <planeGeometry args={[9.2, 4.2]} />
        <meshStandardMaterial color="#1a1410" roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.7, -3.34]}>
        <planeGeometry args={[3.4, 1.8]} />
        <meshBasicMaterial map={windowMap} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.7, -3.33]}>
        <planeGeometry args={[3.5, 1.9]} />
        <meshBasicMaterial color="#cbb79a" transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, 1.7, -3.36]}>
        <boxGeometry args={[3.62, 0.06, 0.08]} />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh position={[-1.75, 1.7, -3.36]}>
        <boxGeometry args={[0.06, 1.9, 0.08]} />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh position={[1.75, 1.7, -3.36]}>
        <boxGeometry args={[0.06, 1.9, 0.08]} />
        <meshStandardMaterial color={wood} />
      </mesh>

      <mesh position={[0, 0.48, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.96, 1.15]} />
        <meshStandardMaterial color={wood} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.98, -0.35]}>
        <boxGeometry args={[4.5, 0.05, 1.25]} />
        <meshStandardMaterial color="#5a3b24" roughness={0.45} />
      </mesh>
      <mesh position={[1.55, 0.62, 0.42]} castShadow>
        <boxGeometry args={[0.7, 0.18, 0.48]} />
        <meshStandardMaterial color="#2c2118" />
      </mesh>

      <EspressoMachine />
      <BottleShelf />
      <Cup position={[-0.18, 1.06, -0.18]} withSteam reduced={reduced} />
      <Cup position={[0.42, 1.06, -0.12]} withSteam reduced={reduced} />
      <Cup position={[1.45, 0.78, 0.42]} />
      <MenuBoard />
      <Laptop />
      <GuestWall />
      <BarStool position={[-0.85, 0, 0.55]} />
      <BarStool position={[0.15, 0, 0.62]} />
      <BarStool position={[1.05, 0, 0.5]} />
      <Plant position={[-3.7, 0.08, -2.6]} />
      <Plant position={[3.7, 0.08, 2.4]} />

      <mesh position={[-2.5, 0.38, -1.15]} castShadow>
        <boxGeometry args={[1.4, 0.76, 0.85]} />
        <meshStandardMaterial color={wood} />
      </mesh>
      <mesh position={[-2.5, 0.78, -1.55]}>
        <boxGeometry args={[1.4, 0.08, 0.12]} />
        <meshStandardMaterial color={woodDark} />
      </mesh>

      <Pendant position={[-1.3, 2.85, 0.2]} intensity={lowPower ? 4 : 7} />
      <Pendant position={[1.1, 2.85, -0.2]} intensity={lowPower ? 5 : 9} />
      <Pendant position={[-2.4, 2.7, -1]} intensity={lowPower ? 3 : 6} />

      <mesh position={[0, 2.55, -3.2]}>
        <boxGeometry args={[1.95, 0.36, 0.08]} />
        <meshStandardMaterial color="#1c1410" />
      </mesh>
      <mesh position={[0, 2.55, -3.15]}>
        <planeGeometry args={[1.8, 0.28]} />
        <meshBasicMaterial map={signMap} toneMapped={false} />
      </mesh>

      <Hotspot id="about" position={[0.15, 0.02, 0.85]}>
        <mesh visible={false}>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
        </mesh>
      </Hotspot>
      <Hotspot id="services" position={[2.6, 0.02, -0.4]}>
        <mesh visible={false}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
        </mesh>
      </Hotspot>
      <Hotspot id="work" position={[-2.45, 0.02, -0.55]}>
        <mesh visible={false}>
          <boxGeometry args={[1.1, 0.2, 0.8]} />
        </mesh>
      </Hotspot>
      <Hotspot id="contact" position={[1.55, 0.02, 0.85]}>
        <mesh visible={false}>
          <boxGeometry args={[0.8, 0.2, 0.6]} />
        </mesh>
      </Hotspot>
      <Hotspot id="process" position={[-0.4, 0.02, 0.15]}>
        <mesh visible={false}>
          <boxGeometry args={[0.6, 0.2, 0.5]} />
        </mesh>
      </Hotspot>
      <Hotspot id="testimonials" position={[-2.8, 0.02, 1.4]}>
        <mesh visible={false}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
        </mesh>
      </Hotspot>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 3.6]}
        onClick={() => setStation('hero')}
      >
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color={crema} transparent opacity={0.12} />
      </mesh>
    </group>
  )
}
