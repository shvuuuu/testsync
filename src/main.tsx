import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { SupabaseProvider } from './lib/supabase/SupabaseProvider'
import { ProjectProvider } from './lib/context/ProjectContext'
import { TestCaseProvider } from './lib/context/TestCaseContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProjectProvider>
            <TestCaseProvider>
              <App />
            </TestCaseProvider>
          </ProjectProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SupabaseProvider>
  </React.StrictMode>,
)