import { Sparkles } from '@react-three/drei'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { useCafe } from '../ui/CafeContext'
import {
  BarStool,
  BottleShelf,
  Cup,
  EspressoMachine,
  GodRays,
  GuestWall,
  Laptop,
  MenuBoard,
  Pendant,
  Plant,
  Plaster,
  ShopSign,
  Tamper,
  Tiles,
  Window,
  Wood,
} from './props'

export default function CafeWorld({ reduced, lowPower }) {
  const { setStation } = useCafe()

  useLayoutEffect(() => {
    RectAreaLightUniformsLib.init()
  }, [])

  return (
    <group>
      <hemisphereLight args={['#ffd4b0', '#1a100c', 0.38]} />
      <ambientLight intensity={0.12} color="#f0d2aa" />
      <spotLight
        position={[0.2, 3.35, 0.4]}
        angle={0.62}
        penumbra={0.72}
        intensity={lowPower ? 16 : 24}
        color="#ffd2a4"
        castShadow={!lowPower}
        shadow-mapSize={1024}
        shadow-bias={-0.00018}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[-2.4, 3.2, 3.4]} intensity={1.35} color="#9eb6ff" />
      <rectAreaLight
        width={3.4}
        height={1.8}
        intensity={lowPower ? 8 : 16}
        color="#ffb070"
        position={[0, 1.72, -3.22]}
        rotation={[Math.PI, 0, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10.4]} />
        <Wood variant="floor" roughness={0.78} />
      </mesh>

      <mesh position={[0, 1.58, -3.48]} receiveShadow>
        <boxGeometry args={[9.4, 3.16, 0.2]} />
        <Plaster />
      </mesh>
      <mesh position={[-4.6, 1.58, 0.35]} receiveShadow>
        <boxGeometry args={[0.2, 3.16, 7.8]} />
        <Plaster />
      </mesh>
      <mesh position={[4.6, 1.58, 0.35]} receiveShadow>
        <boxGeometry args={[0.2, 3.16, 7.8]} />
        <Plaster />
      </mesh>
      <mesh position={[-3.15, 1.58, 4.42]} receiveShadow>
        <boxGeometry args={[3.1, 3.16, 0.2]} />
        <Plaster />
      </mesh>
      <mesh position={[3.15, 1.58, 4.42]} receiveShadow>
        <boxGeometry args={[3.1, 3.16, 0.2]} />
        <Plaster />
      </mesh>
      <mesh position={[0, 2.92, 4.42]}>
        <boxGeometry args={[3.5, 0.52, 0.2]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[0, 3.18, 0.3]} receiveShadow>
        <boxGeometry args={[9.4, 0.1, 7.8]} />
        <Plaster />
      </mesh>
      {[-2.35, 0, 2.35].map((x) => (
        <mesh key={x} position={[x, 3.08, 0.3]}>
          <boxGeometry args={[0.18, 0.16, 7.6]} />
          <Wood variant="walnut" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, -3.36]}>
        <boxGeometry args={[9.2, 0.16, 0.08]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[-4.48, 0.08, 0.35]}>
        <boxGeometry args={[0.08, 0.16, 7.6]} />
        <Wood variant="oak" />
      </mesh>
      <mesh position={[4.48, 0.08, 0.35]}>
        <boxGeometry args={[0.08, 0.16, 7.6]} />
        <Wood variant="oak" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6.35]} receiveShadow>
        <planeGeometry args={[9.4, 4.4]} />
        <meshStandardMaterial color="#16110e" roughness={0.96} />
      </mesh>

      <Window />
      <GodRays reduced={reduced || lowPower} />
      {!lowPower && !reduced && (
        <Sparkles
          count={18}
          scale={[3.2, 1.8, 1.4]}
          position={[0, 1.55, -2.1]}
          size={2}
          speed={0.22}
          opacity={0.35}
          color="#ffd4a0"
        />
      )}

      <mesh position={[0, 0.48, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[4.55, 0.96, 1.18]} />
        <Wood variant="walnut" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.985, -0.32]} receiveShadow>
        <boxGeometry args={[4.68, 0.045, 1.28]} />
        <Wood variant="oak" roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[1.58, 0.64, 0.46]} castShadow>
        <boxGeometry args={[0.72, 0.16, 0.5]} />
        <Wood variant="walnut" />
      </mesh>
      <mesh position={[0, 0.92, 0.28]} castShadow>
        <boxGeometry args={[4.58, 0.055, 0.08]} />
        <Wood variant="oak" roughness={0.32} />
      </mesh>
      <mesh position={[0.08, 1.42, -0.76]} receiveShadow>
        <planeGeometry args={[2.15, 0.72]} />
        <Tiles />
      </mesh>

      <EspressoMachine reduced={reduced} />
      <Tamper />
      <BottleShelf />
      <Cup position={[-0.62, 1.01, 0.12]} withSteam reduced={reduced} />
      <Cup position={[0.62, 1.01, 0.16]} withSteam reduced={reduced} />
      <Cup position={[1.48, 0.74, 0.46]} />
      <MenuBoard />
      <Laptop />
      <GuestWall />
      <BarStool position={[-0.88, 0, 0.58]} />
      <BarStool position={[0.12, 0, 0.66]} />
      <BarStool position={[1.08, 0, 0.52]} />
      <Plant position={[-3.72, 0.08, -2.55]} />
      <Plant position={[3.72, 0.08, 2.42]} />

      <mesh position={[-2.48, 0.4, -1.12]} castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.8, 0.9]} />
        <Wood variant="walnut" />
      </mesh>
      <mesh position={[-2.48, 0.82, -1.54]}>
        <boxGeometry args={[1.48, 0.06, 0.1]} />
        <Wood variant="oak" />
      </mesh>

      <Pendant position={[-1.28, 2.92, 0.18]} intensity={lowPower ? 5 : 8} />
      <Pendant position={[1.12, 2.92, -0.16]} intensity={lowPower ? 6 : 10} />
      <Pendant position={[-2.38, 2.78, -1]} intensity={0} />
      <ShopSign />

      <Hotspots setStation={setStation} />
    </group>
  )
}

function Hotspots({ setStation }) {
  const { station, setHovered } = useCafe()
  const rings = [
    ['about', [0.12, 0.02, 0.88]],
    ['services', [2.62, 0.02, -0.38]],
    ['work', [-2.42, 0.02, -0.52]],
    ['contact', [1.55, 0.02, 0.88]],
    ['process', [-0.38, 0.02, 0.16]],
    ['testimonials', [-2.78, 0.02, 1.42]],
  ]

  return (
    <group>
      {rings.map(([id, position]) => (
        <mesh
          key={id}
          position={position}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(id)
          }}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => {
            e.stopPropagation()
            setStation(id)
          }}
        >
          <ringGeometry args={[0.14, 0.2, 40]} />
          <meshBasicMaterial
            color={station === id ? '#c9a96e' : '#f3eadc'}
            transparent
            opacity={station === id ? 0.92 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 3.7]} onClick={() => setStation('hero')}>
        <circleGeometry args={[0.26, 28]} />
        <meshBasicMaterial color="#c9a96e" transparent opacity={0.12} />
      </mesh>
    </group>
  )
}
