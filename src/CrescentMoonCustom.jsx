import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function CrescentMoonCustom() {
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
    renderer.setClearColor(0x000011)
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create crescent moon using custom geometry
    function createCrescentMoon(outerRadius = 1, innerRadius = 0.7, cutOffset = 0.3, segments = 32) {
      const geometry = new THREE.BufferGeometry()
      const vertices = []
      const indices = []
      const uvs = []

      // Generate vertices for the crescent
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2

        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI

          // Calculate position on sphere
          const x = Math.sin(theta) * Math.cos(phi)
          const y = Math.cos(theta)
          const z = Math.sin(theta) * Math.sin(phi)

          // Check if this point is inside the cut-out
          const distanceFromCut = Math.sqrt((x - cutOffset) ** 2 + y ** 2 + z ** 2)

          if (distanceFromCut > innerRadius) {
            // This point is outside the cut-out, so include it
            const radius = outerRadius
            vertices.push(x * radius, y * radius, z * radius)
            uvs.push(i / segments, j / segments)
          }
        }
      }

      // Generate indices for triangles
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const a = i * (segments + 1) + j
          const b = a + segments + 1
          const c = a + 1
          const d = b + 1

          if (vertices[a * 3] !== undefined && vertices[b * 3] !== undefined &&
            vertices[c * 3] !== undefined && vertices[d * 3] !== undefined) {
            indices.push(a, b, c)
            indices.push(b, d, c)
          }
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()

      return geometry
    }

    const moonGeometry = createCrescentMoon(1, 0.7, 0.3, 32)
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      roughness: 0.8,
      metalness: 0.1
    })
    const moon = new THREE.Mesh(moonGeometry, moonMaterial)
    scene.add(moon)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the moon
      moon.rotation.y += 0.005

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

export default CrescentMoonCustom 