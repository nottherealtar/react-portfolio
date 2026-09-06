import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

const COUNT = 1400

function EmberParticles({ mouse }) {
  const points = useRef()
  const lines = useRef()
  const { viewport } = useThree()

  const { positions, seeds, linkPositions } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.65) * 8.5
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.42) * 7.5
      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r * 0.72
      seeds[i3] = Math.random() * Math.PI * 2
      seeds[i3 + 1] = 0.25 + Math.random() * 0.9
      seeds[i3 + 2] = 0.4 + Math.random() * 1.4
    }

    const linkPositions = new Float32Array(420 * 6)
    return { positions, seeds, linkPositions }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3))
    return geo
  }, [linkPositions])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const arr = points.current.geometry.attributes.position.array
    const mx = mouse.current.x * viewport.width * 0.12
    const my = mouse.current.y * viewport.height * 0.1

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3
      const baseX = positions[i3]
      const baseY = positions[i3 + 1]
      const baseZ = positions[i3 + 2]
      const phase = seeds[i3]
      const speed = seeds[i3 + 1]
      const amp = seeds[i3 + 2]
      arr[i3] = baseX + Math.sin(t * speed + phase) * 0.18 * amp + mx * (0.15 + (i % 7) * 0.01)
      arr[i3 + 1] = baseY + Math.cos(t * speed * 0.8 + phase) * 0.14 * amp + my * 0.12
      arr[i3 + 2] = baseZ + Math.sin(t * 0.35 + phase) * 0.12
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.rotation.y = t * 0.035 + mouse.current.x * 0.15
    points.current.rotation.x = mouse.current.y * 0.08

    // constellation links between nearby bright particles
    const linkArr = lines.current.geometry.attributes.position.array
    let cursor = 0
    for (let i = 0; i < 70; i += 1) {
      const a = i * 17
      const b = (i * 29 + 11) % COUNT
      const a3 = a * 3
      const b3 = b * 3
      linkArr[cursor++] = arr[a3]
      linkArr[cursor++] = arr[a3 + 1]
      linkArr[cursor++] = arr[a3 + 2]
      linkArr[cursor++] = arr[b3]
      linkArr[cursor++] = arr[b3 + 1]
      linkArr[cursor++] = arr[b3 + 2]
    }
    lines.current.geometry.attributes.position.needsUpdate = true
    lines.current.rotation.copy(points.current.rotation)
  })

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          size={0.045}
          color="#e8a054"
          transparent
          opacity={0.85}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={lines} geometry={lineGeometry}>
        <lineBasicMaterial color="#d4894a" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <mesh position={[2.2, 0.4, -1.5]}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial color="#d4894a" transparent opacity={0.045} />
      </mesh>
    </group>
  )
}

function Scene({ mouse }) {
  return (
    <>
      <fog attach="fog" args={['#070605', 7, 18]} />
      <EmberParticles mouse={mouse} />
    </>
  )
}

export default function EmberField() {
  const reduce = useReducedMotion()
  const mouse = useRef({ x: 0, y: 0 })

  if (reduce) {
    return <div className="ember-field ember-field--static" aria-hidden="true" />
  }

  return (
    <div
      className="ember-field"
      aria-hidden="true"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      }}
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.2, 7.2], fov: 42 }}
        onCreated={({ gl, scene }) => { gl.setClearColor(0x000000, 0); scene.background = null }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: false }}
      >
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  )
}
