import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function CrescentMoon() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000011) // Dark blue sky
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create crescent moon using two spheres
    const moonRadius = 1
    const cutRadius = 0.8
    const cutOffset = 0.3

    // Main moon sphere
    const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32)
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      roughness: 0.8,
      metalness: 0.1
    })
    const moon = new THREE.Mesh(moonGeometry, moonMaterial)
    scene.add(moon)

    // Cut-out sphere (to create the crescent)
    const cutGeometry = new THREE.SphereGeometry(cutRadius, 32, 32)
    const cutMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0
    })
    const cutSphere = new THREE.Mesh(cutGeometry, cutMaterial)
    cutSphere.position.x = cutOffset
    scene.add(cutSphere)

    // Create a group to hold both spheres
    const moonGroup = new THREE.Group()
    moonGroup.add(moon)
    moonGroup.add(cutSphere)
    scene.add(moonGroup)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the moon group
      moonGroup.rotation.y += 0.005

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000011',
        cursor: 'grab'
      }}
    />
  )
}

export default CrescentMoon 