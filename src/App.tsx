import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/shared/ErrorBoundary'
import Dashboard from './routes/Dashboard'
import Applications from './routes/Applications'
import ApplicationDetail from './routes/ApplicationDetail'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function ConditionalGoogleProvider({ children }: { children: ReactNode }) {
  if (!CLIENT_ID) return <>{children}</>
  return <GoogleOAuthProvider clientId={CLIENT_ID}>{children}</GoogleOAuthProvider>
}

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    background: { default: '#f9fafb' },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 12 },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConditionalGoogleProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ConditionalGoogleProvider>
    </ThemeProvider>
  )
}

export default App
