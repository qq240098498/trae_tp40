import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Record from '@/pages/Record'
import History from '@/pages/History'
import Trends from '@/pages/Trends'
import Habits from '@/pages/Habits'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/record" replace />} />
          <Route path="/record" element={<Record />} />
          <Route path="/history" element={<History />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/habits" element={<Habits />} />
        </Routes>
      </Layout>
    </Router>
  )
}
