import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SkipLink } from './components/ui/SkipLink'

function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </ErrorBoundary>
  )
}

export default App
