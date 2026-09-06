import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

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

function EmberParticles({ mouse, intensity, count }) {
  const points = useRef()
  const lines = useRef()
  const { viewport } = useThree()

  const { positions, seeds, linkPositions, linkCount } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.62) * 8.2
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.4) * 7.2
      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r * 0.7
      seeds[i3] = Math.random() * Math.PI * 2
      seeds[i3 + 1] = 0.2 + Math.random() * 0.95
      seeds[i3 + 2] = 0.35 + Math.random() * 1.35
    }
    const linkCount = Math.min(56, Math.floor(count / 18))
    const linkPositions = new Float32Array(linkCount * 6)
    return { positions, seeds, linkPositions, linkCount }
  }, [count])

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
    if (!points.current) return
    const t = state.clock.elapsedTime
    const arr = points.current.geometry.attributes.position.array
    const ampScale = 0.55 + intensity.current * 0.7
    const mx = mouse.current.x * viewport.width * 0.1
    const my = mouse.current.y * viewport.height * 0.08

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const phase = seeds[i3]
      const speed = seeds[i3 + 1]
      const amp = seeds[i3 + 2] * ampScale
      arr[i3] = positions[i3] + Math.sin(t * speed + phase) * 0.16 * amp + mx * (0.12 + (i % 5) * 0.008)
      arr[i3 + 1] = positions[i3 + 1] + Math.cos(t * speed * 0.85 + phase) * 0.12 * amp + my * 0.1
      arr[i3 + 2] = positions[i3 + 2] + Math.sin(t * 0.32 + phase) * 0.1
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.rotation.y = t * 0.028 + mouse.current.x * 0.12
    points.current.rotation.x = mouse.current.y * 0.06

    if (lines.current) {
      const linkArr = lines.current.geometry.attributes.position.array
      let cursor = 0
      for (let i = 0; i < linkCount; i += 1) {
        const a = (i * 17) % count
        const b = (i * 29 + 11) % count
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
      lines.current.material.opacity = 0.08 + intensity.current * 0.12
    }

    points.current.material.opacity = 0.55 + intensity.current * 0.35
    points.current.material.size = 0.032 + intensity.current * 0.02
  })

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          size={0.04}
          color="#e8a054"
          transparent
          opacity={0.8}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={lines} geometry={lineGeometry}>
        <lineBasicMaterial color="#d4894a" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <mesh position={[2.1, 0.35, -1.4]}>
        <sphereGeometry args={[1.25, 24, 24]} />
        <meshBasicMaterial color="#d4894a" transparent opacity={0.04} />
      </mesh>
    </group>
  )
}

export default function EmberField({ scrollProgress }) {
  const reduce = useReducedMotion()
  const mobile = useIsMobile()
  const mouse = useRef({ x: 0, y: 0 })
  const intensity = useRef(0.45)
  const [visible, setVisible] = useState(true)
  const rootRef = useRef(null)
  const count = mobile ? 520 : 1100

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
      intensity.current = Math.max(0.2, 1 - v * 1.4)
    })
    return unsub
  }, [scrollProgress])

  if (reduce) {
    return <div className="ember-field ember-field--static" aria-hidden="true" />
  }

  return (
    <div
      ref={rootRef}
      className="ember-field"
      aria-hidden="true"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      }}
    >
      {visible && (
        <Canvas
          dpr={mobile ? [1, 1.25] : [1, 1.6]}
          camera={{ position: [0, 0.15, 7.1], fov: 42 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0)
            scene.background = null
          }}
          gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: false }}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={['#070605', 7, 17]} />
            <EmberParticles mouse={mouse} intensity={intensity} count={count} />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
