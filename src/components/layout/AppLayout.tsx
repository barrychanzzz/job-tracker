import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, IconButton, useMediaQuery, useTheme,
} from '@mui/material'
import { LayoutDashboard, Briefcase, Menu, X, Download } from 'lucide-react'
import { exportJSON, exportCSV } from '../../services/export'

const DRAWER_WIDTH = 220

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/applications', label: '求职记录', icon: Briefcase },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const drawer = (
    <Box sx={{ pt: 1 }}>
      <List>
        {menuItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <item.icon size={20} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ px: 2, mt: 'auto', mb: 2, borderTop: '1px solid #e5e7eb', pt: 2 }}>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
          数据导出
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ListItemButton sx={{ borderRadius: 2, py: 0.5 }} onClick={exportJSON}>
            <ListItemIcon sx={{ minWidth: 28 }}><Download size={14} /></ListItemIcon>
            <ListItemText primary="JSON" />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 2, py: 0.5 }} onClick={exportCSV}>
            <ListItemIcon sx={{ minWidth: 28 }}><Download size={14} /></ListItemIcon>
            <ListItemText primary="CSV" />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={0}>
        <Toolbar sx={{ bgcolor: '#1e293b' }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          )}
          <Briefcase size={24} className="mr-2" />
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            Job Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #e5e7eb' },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
