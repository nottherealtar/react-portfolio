import { AdaptiveDpr, BakeShadows, ContactShadows, Environment, Lightformer, Preload } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useCafe } from '../ui/CafeContext'
import CafeWorld from './CafeWorld'

const STATIONS = {
  hero: {
    position: new THREE.Vector3(0.12, 1.52, 6.55),
    target: new THREE.Vector3(0.08, 1.16, -0.35),
    fov: 34,
  },
  about: {
    position: new THREE.Vector3(0.72, 1.36, 1.88),
    target: new THREE.Vector3(-0.22, 1.1, -0.42),
    fov: 32,
  },
  services: {
    position: new THREE.Vector3(1.42, 1.48, 0.32),
    target: new THREE.Vector3(3.28, 1.55, -0.78),
    fov: 34,
  },
  work: {
    position: new THREE.Vector3(-1.58, 1.14, -0.16),
    target: new THREE.Vector3(-2.28, 1.01, -0.9),
    fov: 26,
  },
  process: {
    position: new THREE.Vector3(0.08, 1.24, 0.82),
    target: new THREE.Vector3(-0.42, 1.06, -0.22),
    fov: 32,
  },
  testimonials: {
    position: new THREE.Vector3(-1.95, 1.45, 2.22),
    target: new THREE.Vector3(-3.38, 1.46, 0.12),
    fov: 34,
  },
  contact: {
    position: new THREE.Vector3(1.55, 1.36, 2.42),
    target: new THREE.Vector3(0.22, 1.04, 0.32),
    fov: 34,
  },
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function CameraRig({ reduced }) {
  const { station } = useCafe()
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(0.08, 1.16, -0.35))
  const pointer = useRef({ x: 0, y: 0 })
  const pointerSmooth = useRef({ x: 0, y: 0 })
  const fromPos = useRef(new THREE.Vector3(0.12, 1.52, 6.55))
  const fromLook = useRef(new THREE.Vector3(0.08, 1.16, -0.35))
  const fromFov = useRef(34)
  const basePos = useRef(new THREE.Vector3(0.12, 1.52, 6.55))
  const progress = useRef(1)
  const prevFov = useRef(camera.fov)
  const ready = useRef(false)

  useLayoutEffect(() => {
    if (!ready.current) {
      ready.current = true
      return
    }
    fromPos.current.copy(basePos.current)
    fromLook.current.copy(look.current)
    fromFov.current = camera.fov
    progress.current = 0
  }, [station, camera])

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
    const dt = Math.min(delta, 0.05)
    pointerSmooth.current.x = THREE.MathUtils.damp(pointerSmooth.current.x, pointer.current.x, 8, dt)
    pointerSmooth.current.y = THREE.MathUtils.damp(pointerSmooth.current.y, pointer.current.y, 8, dt)
    const parallax = reduced ? 0 : 0.07
    const mobile = size.width < 720
    const px = pointerSmooth.current.x * parallax * (mobile ? 0.28 : 1)
    const py = pointerSmooth.current.y * parallax * 0.28
    const duration = reduced ? 0.22 : 0.86
    progress.current = Math.min(1, progress.current + Math.min(delta, 0.1) / duration)
    const k = reduced ? 1 : easeInOutCubic(progress.current)
    basePos.current.lerpVectors(fromPos.current, next.position, k)
    look.current.lerpVectors(fromLook.current, next.target, k)
    camera.position.copy(basePos.current)
    camera.position.x += px
    camera.position.y -= py
    camera.lookAt(look.current)
    const fovTarget = mobile ? Math.min(40, next.fov + 6) : next.fov
    camera.fov = THREE.MathUtils.lerp(fromFov.current, fovTarget, k)
    if (Math.abs(camera.fov - prevFov.current) > 0.02) {
      prevFov.current = camera.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

function StudioLights() {
  return (
    <Environment resolution={256} environmentIntensity={0.5} frames={1}>
      <Lightformer intensity={3.4} position={[0, 4.2, -3.2]} scale={[7, 1.2, 1]} color="#ffb070" />
      <Lightformer intensity={1.5} position={[0, 3.8, 4]} scale={[8, 2, 1]} color="#2a1810" />
      <Lightformer intensity={2} position={[-5, 2.2, 0.5]} scale={[2.5, 5, 1]} color="#8aa4ff" />
      <Lightformer intensity={1.3} position={[5, 1.6, 0]} scale={[2, 3, 1]} color="#ffd2a8" />
    </Environment>
  )
}

export default function CafeCanvas({ reduced, lowPower }) {
  const dprCap = lowPower ? 1 : 1.45
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={[1, dprCap]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          stencil: false,
          depth: true,
        }}
        shadows={!lowPower}
        camera={{ position: [0.12, 1.52, 6.55], fov: 34, near: 0.1, far: 28 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          scene.background = new THREE.Color('#100b08')
          scene.fog = new THREE.FogExp2('#100b08', 0.048)
        }}
      >
        <Suspense fallback={null}>
          <CameraRig reduced={reduced} />
          <StudioLights />
          <CafeWorld reduced={reduced} lowPower={lowPower} />
          {!lowPower && (
            <ContactShadows
              position={[0, 0.012, 0]}
              opacity={0.4}
              scale={11}
              blur={2.1}
              far={2.4}
              resolution={256}
              frames={1}
              color="#0a0706"
            />
          )}
          {!lowPower && <BakeShadows />}
          {!lowPower && !reduced && (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom intensity={0.22} luminanceThreshold={0.96} mipmapBlur />
              <Vignette eskil={false} offset={0.2} darkness={0.5} />
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
