import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

/**
 * Directional “brew + build” field:
 * - Roast column: warm embers rise from a hearth bed (coffee)
 * - Integration rails: brighter nodes linked in directed pipelines (fullstack systems)
 * Pointer steers pour bend; scroll cools intensity.
 */

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

function BrewField({ mouse, intensity, count, railCount }) {
  const roastRef = useRef()
  const nodesRef = useRef()
  const railsRef = useRef()
  const { viewport } = useThree()

  const roast = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const i4 = i * 4
      // Hearth ellipse at bottom — roast bed
      const u = Math.random()
      const v = Math.random()
      const rx = (u - 0.5) * 7.2
      const rz = (v - 0.5) * 3.4
      positions[i3] = rx
      positions[i3 + 1] = -3.4 + Math.random() * 0.55
      positions[i3 + 2] = rz - 0.4
      seeds[i4] = Math.random() * Math.PI * 2 // phase
      seeds[i4 + 1] = 0.55 + Math.random() * 1.15 // rise speed
      seeds[i4 + 2] = 0.25 + Math.random() * 0.9 // sway
      seeds[i4 + 3] = 4.8 + Math.random() * 4.2 // max height before recycle
    }
    return { positions, seeds }
  }, [count])

  const rails = useMemo(() => {
    // Directed pipelines: left→right integration lanes at staggered depths
    const lanes = Math.max(3, Math.min(7, Math.floor(railCount / 18)))
    const nodesPerLane = Math.max(4, Math.floor(railCount / lanes))
    const total = lanes * nodesPerLane
    const positions = new Float32Array(total * 3)
    const seeds = new Float32Array(total * 3)
    const laneMeta = []
    let idx = 0
    for (let lane = 0; lane < lanes; lane += 1) {
      const yBase = -1.6 + lane * 0.85
      const z = -1.2 + (lane % 3) * 0.55
      const start = idx
      for (let n = 0; n < nodesPerLane; n += 1) {
        const t = n / (nodesPerLane - 1)
        const i3 = idx * 3
        positions[i3] = -4.6 + t * 9.2
        positions[i3 + 1] = yBase + Math.sin(t * Math.PI) * 0.22
        positions[i3 + 2] = z
        seeds[i3] = t
        seeds[i3 + 1] = 0.35 + Math.random() * 0.4
        seeds[i3 + 2] = lane * 0.7 + Math.random()
        idx += 1
      }
      laneMeta.push({ start, count: nodesPerLane })
    }
    // Directed segments along each lane (not random mesh)
    const segments = laneMeta.reduce((sum, l) => sum + Math.max(0, l.count - 1), 0)
    const linkPositions = new Float32Array(segments * 6)
    return { positions, seeds, laneMeta, linkPositions, total, segments }
  }, [railCount])

  const roastGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(roast.positions.slice(0), 3))
    return geo
  }, [roast])

  const nodeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(rails.positions.slice(0), 3))
    return geo
  }, [rails])

  const railGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(rails.linkPositions, 3))
    return geo
  }, [rails])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pourX = mouse.current.x * viewport.width * 0.14
    const pourY = mouse.current.y
    const lift = 0.7 + intensity.current * 0.9 + Math.max(0, -pourY) * 0.35

    // Rising roast steam / embers
    if (roastRef.current) {
      const arr = roastRef.current.geometry.attributes.position.array
      const base = roast.positions
      const seeds = roast.seeds
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3
        const i4 = i * 4
        const phase = seeds[i4]
        const speed = seeds[i4 + 1] * lift
        const sway = seeds[i4 + 2]
        const maxH = seeds[i4 + 3]
        const life = (t * speed + phase * 1.7) % maxH
        const progress = life / maxH
        // taper: denser near hearth, thinner as it rises
        const spread = 1 + progress * 1.35
        arr[i3] =
          base[i3] * spread +
          Math.sin(t * (0.6 + sway) + phase) * 0.22 * sway +
          pourX * (0.15 + progress * 0.55)
        arr[i3 + 1] = base[i3 + 1] + life
        arr[i3 + 2] = base[i3 + 2] * (1 + progress * 0.25) + Math.cos(t * 0.45 + phase) * 0.12
      }
      roastRef.current.geometry.attributes.position.needsUpdate = true
      roastRef.current.material.opacity = 0.42 + intensity.current * 0.38
      roastRef.current.material.size = 0.028 + intensity.current * 0.018
    }

    // Directed integration rails (packet flow left → right)
    if (nodesRef.current && railsRef.current) {
      const narr = nodesRef.current.geometry.attributes.position.array
      const base = rails.positions
      const seeds = rails.seeds
      for (let i = 0; i < rails.total; i += 1) {
        const i3 = i * 3
        const pulse = Math.sin(t * (1.2 + seeds[i3 + 1]) + seeds[i3] * Math.PI * 2 + seeds[i3 + 2])
        // packets drift along lane direction
        const drift = ((t * 0.55 * seeds[i3 + 1] + seeds[i3]) % 1) * 0.35
        narr[i3] = base[i3] + drift + pourX * 0.08
        narr[i3 + 1] = base[i3 + 1] + pulse * 0.06 + pourY * 0.12
        narr[i3 + 2] = base[i3 + 2]
      }
      nodesRef.current.geometry.attributes.position.needsUpdate = true

      const linkArr = railsRef.current.geometry.attributes.position.array
      let cursor = 0
      for (const lane of rails.laneMeta) {
        for (let n = 0; n < lane.count - 1; n += 1) {
          const a = (lane.start + n) * 3
          const b = (lane.start + n + 1) * 3
          linkArr[cursor++] = narr[a]
          linkArr[cursor++] = narr[a + 1]
          linkArr[cursor++] = narr[a + 2]
          linkArr[cursor++] = narr[b]
          linkArr[cursor++] = narr[b + 1]
          linkArr[cursor++] = narr[b + 2]
        }
      }
      railsRef.current.geometry.attributes.position.needsUpdate = true
      railsRef.current.material.opacity = 0.1 + intensity.current * 0.16
      nodesRef.current.material.opacity = 0.55 + intensity.current * 0.3
    }
  })

  return (
    <group>
      {/* Hearth glow — roast bed */}
      <mesh position={[0, -3.55, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color="#c8884a" transparent opacity={0.05} />
      </mesh>
      <mesh position={[0, -3.2, 0]}>
        <sphereGeometry args={[2.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshBasicMaterial color="#d4894a" transparent opacity={0.055} side={THREE.DoubleSide} />
      </mesh>

      <points ref={roastRef} geometry={roastGeo}>
        <pointsMaterial
          size={0.036}
          color="#e8a054"
          transparent
          opacity={0.75}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={nodesRef} geometry={nodeGeo}>
        <pointsMaterial
          size={0.055}
          color="#f0c48a"
          transparent
          opacity={0.7}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={railsRef} geometry={railGeo}>
        <lineBasicMaterial color="#c8884a" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

export default function EmberField({ scrollProgress }) {
  const reduce = useReducedMotion()
  const mobile = useIsMobile()
  const mouse = useRef({ x: 0, y: 0 })
  const intensity = useRef(0.55)
  const [visible, setVisible] = useState(true)
  const rootRef = useRef(null)
  const count = mobile ? 380 : 820
  const railCount = mobile ? 48 : 84

  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!scrollProgress) return undefined
    const unsub = scrollProgress.on('change', (v) => {
      intensity.current = Math.max(0.22, 0.95 - v * 1.25)
    })
    return unsub
  }, [scrollProgress])

  useEffect(() => {
    if (reduce || window.matchMedia('(pointer: coarse)').matches) return undefined
    const onMove = (e) => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce])

  if (reduce) {
    return <div className="ember-field ember-field--static" aria-hidden="true" />
  }

  return (
    <div ref={rootRef} className="ember-field" aria-hidden="true">
      {visible && (
        <Canvas
          dpr={mobile ? [1, 1.25] : [1, 1.6]}
          camera={{ position: [0, 0.35, 7.4], fov: 40 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0)
            scene.background = null
          }}
          gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: false }}
          style={{ pointerEvents: 'none' }}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={['#070605', 8, 16]} />
            <BrewField mouse={mouse} intensity={intensity} count={count} railCount={railCount} />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
