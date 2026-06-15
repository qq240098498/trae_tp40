import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Record from '@/pages/Record'
import History from '@/pages/History'
import Trends from '@/pages/Trends'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/record" replace />} />
          <Route path="/record" element={<Record />} />
          <Route path="/history" element={<History />} />
          <Route path="/trends" element={<Trends />} />
        </Routes>
      </Layout>
    </Router>
  )
}
