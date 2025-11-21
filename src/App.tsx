import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Fit Pilot
                </h1>
                <p className="text-lg text-gray-600">
                  AI-powered workout routine management system
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </>
  )
}

export default App
