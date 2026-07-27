import { Navigate, Route, Routes } from 'react-router-dom'
import { ContentLayout } from '@/components/ContentLayout'
import { HomePage } from '@/pages/HomePage'
import { ResumePage } from '@/pages/ResumePage'
import { WritingListPage } from '@/pages/WritingListPage'
import { WritingPostPage } from '@/pages/WritingPostPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<ContentLayout />}>
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/writing" element={<WritingListPage />} />
        <Route path="/writing/:slug" element={<WritingPostPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
