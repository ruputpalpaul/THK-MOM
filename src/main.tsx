import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { AlertProvider } from './providers/AlertProvider.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AlertProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </AlertProvider>
    </AuthProvider>
  </StrictMode>,
)
