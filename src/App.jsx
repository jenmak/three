import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function App() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(2, 2, 2)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x222222)
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create spinning cube
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0xff8c00 })
    const cube = new THREE.Mesh(geometry, material)
    cube.rotation.set(0.4, 0.4, 0)
    scene.add(cube)

    // Orbit controls (simple mouse controls)
    let isMouseDown = false
    let mouseX = 0
    let mouseY = 0

    const handleMouseDown = (event) => {
      isMouseDown = true
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const handleMouseMove = (event) => {
      if (!isMouseDown) return

      const deltaX = event.clientX - mouseX
      const deltaY = event.clientY - mouseY

      camera.position.x = Math.cos(deltaX * 0.01) * 2
      camera.position.z = Math.sin(deltaX * 0.01) * 2
      camera.position.y = Math.max(0.5, Math.min(5, camera.position.y - deltaY * 0.01))

      camera.lookAt(scene.position)

      mouseX = event.clientX
      mouseY = event.clientY
    }

    const handleMouseUp = () => {
      isMouseDown = false
    }

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the cube
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

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
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      data-testid="three-container"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#222',
        cursor: 'grab'
      }}
    />
  )
}

export default App
