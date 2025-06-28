import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Three.js
jest.mock('three', () => {
  return {
    Scene: jest.fn(() => ({
      add: jest.fn()
    })),
    PerspectiveCamera: jest.fn(() => ({
      position: { set: jest.fn() },
      aspect: 1,
      updateProjectionMatrix: jest.fn()
    })),
    WebGLRenderer: jest.fn(() => ({
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      domElement: global.document.createElement('canvas'),
      render: jest.fn(),
      dispose: jest.fn()
    })),
    AmbientLight: jest.fn(() => ({})),
    DirectionalLight: jest.fn(() => ({
      position: { set: jest.fn() }
    })),
    BoxGeometry: jest.fn(() => ({})),
    MeshStandardMaterial: jest.fn(() => ({})),
    Mesh: jest.fn(() => ({
      rotation: { set: jest.fn(), x: 0, y: 0 }
    }))
  }
})

describe('App', () => {
  test('renders the 3D scene container', () => {
    render(<App />)

    // Check that the container div is rendered
    const container = screen.getByTestId('three-container')
    expect(container).toBeInTheDocument()
  })

  test('has proper styling for full viewport', () => {
    render(<App />)

    const container = screen.getByTestId('three-container')
    expect(container).toHaveStyle({
      width: '100vw',
      height: '100vh',
      background: '#222',
      cursor: 'grab'
    })
  })
}) 