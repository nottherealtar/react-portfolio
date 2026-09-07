import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Preload } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useCafe } from '../ui/CafeContext'
import CafeWorld from './CafeWorld'

const STATIONS = {
  hero: {
    position: new THREE.Vector3(0.15, 1.58, 6.85),
    target: new THREE.Vector3(0.1, 1.18, -0.4),
  },
  about: {
    position: new THREE.Vector3(0.85, 1.42, 2.05),
    target: new THREE.Vector3(-0.35, 1.12, -0.55),
  },
  services: {
    position: new THREE.Vector3(1.55, 1.5, 0.35),
    target: new THREE.Vector3(3.35, 1.55, -0.85),
  },
  work: {
    position: new THREE.Vector3(-1.55, 1.32, 1.15),
    target: new THREE.Vector3(-2.55, 1.02, -1.15),
  },
  process: {
    position: new THREE.Vector3(-0.05, 1.28, 0.85),
    target: new THREE.Vector3(-0.55, 1.08, -0.35),
  },
  testimonials: {
    position: new THREE.Vector3(-2.05, 1.48, 2.35),
    target: new THREE.Vector3(-3.45, 1.45, 0.15),
  },
  contact: {
    position: new THREE.Vector3(1.65, 1.4, 2.55),
    target: new THREE.Vector3(0.25, 1.05, 0.35),
  },
}

function CameraRig({ reduced }) {
  const { station } = useCafe()
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0.1, 1.18, -0.4))
  const desired = useRef(new THREE.Vector3())
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const next = STATIONS[station] || STATIONS.hero
    const t = 1 - Math.exp(-delta * (reduced ? 8 : 2.4))
    const parallax = reduced ? 0 : 0.22
    const mobile = size.width < 720
    desired.current.set(
      next.position.x + pointer.current.x * parallax * (mobile ? 0.35 : 1),
      next.position.y - pointer.current.y * parallax * 0.45,
      next.position.z,
    )
    camera.position.lerp(desired.current, t)
    look.current.lerp(next.target, t)
    camera.lookAt(look.current)
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 42 : 36, t)
    camera.updateProjectionMatrix()
  })

  return null
}

export default function CafeCanvas({ reduced, lowPower }) {
  const dprCap = lowPower ? 1 : 1.5
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={[1, dprCap]}
        gl={{ antialias: !lowPower, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0.15, 1.58, 6.85], fov: 36, near: 0.1, far: 40 }}
        shadows={!lowPower}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
          scene.background = new THREE.Color('#120c09')
          scene.fog = new THREE.Fog('#120c09', 8, 18)
        }}
      >
        <Suspense fallback={null}>
          <CameraRig reduced={reduced} />
          <CafeWorld reduced={reduced} lowPower={lowPower} />
          {!lowPower && <ContactShadows position={[0, 0.001, 0]} opacity={0.42} scale={12} blur={2.4} far={4} />}
          <AdaptiveDpr />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
