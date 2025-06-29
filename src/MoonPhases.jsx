import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function MoonPhases() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 15)
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

    // Function to create a moon phase
    function createMoonPhase(phase, radius = 0.8) {
      const moonGeometry = new THREE.SphereGeometry(radius, 32, 32)
      const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4f4f4,
        roughness: 0.8,
        metalness: 0.1
      })
      const moon = new THREE.Mesh(moonGeometry, moonMaterial)

      // Create cut-out sphere for the dark part
      const cutGeometry = new THREE.SphereGeometry(radius * 0.9, 32, 32)
      const cutMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0
      })
      const cutSphere = new THREE.Mesh(cutGeometry, cutMaterial)

      // Position the cut-out based on the phase
      const cutOffset = radius * 0.3
      cutSphere.position.x = Math.cos(phase) * cutOffset
      cutSphere.position.z = Math.sin(phase) * cutOffset

      // Create group
      const moonGroup = new THREE.Group()
      moonGroup.add(moon)
      moonGroup.add(cutSphere)

      return moonGroup
    }

    // Moon phase names and their positions
    const moonPhases = [
      { name: 'New Moon', phase: Math.PI, position: 0 },           // Top
      { name: 'Waxing Crescent', phase: Math.PI * 0.83, position: 1 },
      { name: 'First Quarter', phase: Math.PI * 0.67, position: 2 },
      { name: 'Waxing Gibbous', phase: Math.PI * 0.5, position: 3 },
      { name: 'Full Moon', phase: 0, position: 4 },                // Bottom
      { name: 'Waning Gibbous', phase: Math.PI * 1.5, position: 5 },
      { name: 'Last Quarter', phase: Math.PI * 1.33, position: 6 },
      { name: 'Waning Crescent', phase: Math.PI * 1.17, position: 7 },
      { name: 'New Moon', phase: Math.PI, position: 8 },           // Top again
      { name: 'Waxing Crescent', phase: Math.PI * 0.83, position: 9 },
      { name: 'First Quarter', phase: Math.PI * 0.67, position: 10 },
      { name: 'Waxing Gibbous', phase: Math.PI * 0.5, position: 11 }
    ]

    // Create moon phases in a circle
    const circleRadius = 8
    const moonGroup = new THREE.Group()

    moonPhases.forEach((moonPhase, index) => {
      const angle = (index / moonPhases.length) * Math.PI * 2 - Math.PI / 2 // Start from top
      const x = Math.cos(angle) * circleRadius
      const y = Math.sin(angle) * circleRadius

      const moon = createMoonPhase(moonPhase.phase)
      moon.position.set(x, y, 0)
      moonGroup.add(moon)

      // Add text label (simplified as a small cube for now)
      const labelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
      const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const label = new THREE.Mesh(labelGeometry, labelMaterial)
      label.position.set(x, y - 1.5, 0)
      moonGroup.add(label)
    })

    scene.add(moonGroup)

    // Add center point
    const centerGeometry = new THREE.SphereGeometry(0.2, 16, 16)
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 })
    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    scene.add(center)

    // Orbit controls
    let isMouseDown = false
    let mouseX = 0
    let mouseY = 0
    let cameraAngleX = 0
    let cameraAngleY = 0
    let cameraDistance = 15

    const handleMouseDown = (event) => {
      isMouseDown = true
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const handleMouseMove = (event) => {
      if (!isMouseDown) return

      const deltaX = event.clientX - mouseX
      const deltaY = event.clientY - mouseY

      cameraAngleX += deltaX * 0.01
      cameraAngleY += deltaY * 0.01
      cameraAngleY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraAngleY))

      camera.position.x = cameraDistance * Math.cos(cameraAngleY) * Math.sin(cameraAngleX)
      camera.position.y = cameraDistance * Math.sin(cameraAngleY)
      camera.position.z = cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)

      camera.lookAt(0, 0, 0)

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

      // Rotate the entire moon group slowly
      moonGroup.rotation.y += 0.002

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
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000011',
        cursor: 'grab'
      }}
    />
  )
}

export default MoonPhases 