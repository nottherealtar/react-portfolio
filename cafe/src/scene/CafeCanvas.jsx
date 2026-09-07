import { AdaptiveDpr, ContactShadows, Environment, Lightformer, Preload, SoftShadows } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useCafe } from '../ui/CafeContext'
import CafeWorld from './CafeWorld'

const STATIONS = {
  hero: {
    position: new THREE.Vector3(0.12, 1.52, 6.55),
    target: new THREE.Vector3(0.08, 1.16, -0.35),
  },
  about: {
    position: new THREE.Vector3(0.78, 1.38, 1.92),
    target: new THREE.Vector3(-0.28, 1.12, -0.48),
  },
  services: {
    position: new THREE.Vector3(1.42, 1.48, 0.32),
    target: new THREE.Vector3(3.28, 1.55, -0.78),
  },
  work: {
    position: new THREE.Vector3(-1.42, 1.28, 1.08),
    target: new THREE.Vector3(-2.48, 1.02, -1.08),
  },
  process: {
    position: new THREE.Vector3(0.02, 1.22, 0.78),
    target: new THREE.Vector3(-0.48, 1.06, -0.28),
  },
  testimonials: {
    position: new THREE.Vector3(-1.95, 1.45, 2.22),
    target: new THREE.Vector3(-3.38, 1.46, 0.12),
  },
  contact: {
    position: new THREE.Vector3(1.55, 1.36, 2.42),
    target: new THREE.Vector3(0.22, 1.04, 0.32),
  },
}

function CameraRig({ reduced }) {
  const { station } = useCafe()
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0.08, 1.16, -0.35))
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
    const t = 1 - Math.exp(-delta * (reduced ? 8 : 2.35))
    const parallax = reduced ? 0 : 0.18
    const mobile = size.width < 720
    desired.current.set(
      next.position.x + pointer.current.x * parallax * (mobile ? 0.3 : 1),
      next.position.y - pointer.current.y * parallax * 0.4,
      next.position.z,
    )
    camera.position.lerp(desired.current, t)
    look.current.lerp(next.target, t)
    camera.lookAt(look.current)
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 40 : 34, t)
    camera.updateProjectionMatrix()
  })

  return null
}

function StudioLights() {
  return (
    <Environment resolution={512} environmentIntensity={0.48}>
      <Lightformer intensity={3.6} position={[0, 4.2, -3.2]} scale={[7, 1.2, 1]} color="#ffb070" />
      <Lightformer intensity={1.6} position={[0, 3.8, 4]} scale={[8, 2, 1]} color="#2a1810" />
      <Lightformer intensity={2.2} position={[-5, 2.2, 0.5]} scale={[2.5, 5, 1]} color="#8aa4ff" />
      <Lightformer intensity={1.4} position={[5, 1.6, 0]} scale={[2, 3, 1]} color="#ffd2a8" />
    </Environment>
  )
}

export default function CafeCanvas({ reduced, lowPower }) {
  const dprCap = lowPower ? 1 : 1.75
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={[1, dprCap]}
        gl={{
          antialias: lowPower,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        shadows={!lowPower}
        camera={{ position: [0.12, 1.52, 6.55], fov: 34, near: 0.08, far: 40 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          scene.background = new THREE.Color('#100b08')
          scene.fog = new THREE.FogExp2('#100b08', 0.045)
        }}
      >
        <Suspense fallback={null}>
          <CameraRig reduced={reduced} />
          {!lowPower && <SoftShadows size={18} samples={12} focus={0.6} />}
          <StudioLights />
          <CafeWorld reduced={reduced} lowPower={lowPower} />
          {!lowPower && (
            <ContactShadows
              position={[0, 0.012, 0]}
              opacity={0.48}
              scale={11}
              blur={2.3}
              far={2.8}
              resolution={512}
              frames={1}
              color="#0a0706"
            />
          )}
          {!lowPower && !reduced && (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <N8AO aoRadius={0.85} intensity={1.2} quality="performance" halfRes color="#1a100c" />
              <Bloom intensity={0.42} luminanceThreshold={0.88} mipmapBlur />
              <Vignette eskil={false} offset={0.18} darkness={0.55} />
              <SMAA />
            </EffectComposer>
          )}
          <AdaptiveDpr />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
