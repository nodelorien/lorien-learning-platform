'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Translate as TranslateIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { t, Language, languages } from '@/lib/i18n';

export default function Topbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLangChange = (l: Language) => {
    setLang(l);
    setAnchorEl(null);
  };

  const navItems = [
    { label: t('nav.home', lang), icon: <HomeIcon />, action: () => router.push('/') },
    { label: t('nav.training', lang), icon: <SchoolIcon />, action: () => router.push('/training') },
    ...(user?.role === 'admin'
      ? [{ label: t('nav.admin', lang), icon: <AdminIcon />, action: () => router.push('/admin') }]
      : []),
  ];

  const drawerContent = (
    <Box sx={{ width: 260 }} onClick={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon sx={{ color: '#e94560' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Lorien</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {languages.map((l) => (
          <ListItem key={l} disablePadding>
            <ListItemButton
              selected={lang === l}
              onClick={() => { setLang(l); setDrawerOpen(false); }}
            >
              <ListItemIcon><TranslateIcon /></ListItemIcon>
              <ListItemText primary={l.toUpperCase()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary={t('nav.logout', lang)} />
            </ListItemButton>
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/login')}>
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary={t('nav.login', lang)} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/register')}>
                <ListItemIcon><RegisterIcon /></ListItemIcon>
                <ListItemText primary={t('nav.register', lang)} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <SchoolIcon sx={{ mr: 1, color: '#e94560' }} />
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', fontWeight: 700, mr: isMobile ? 0 : 4 }}
            onClick={() => router.push('/')}
          >
            Lorien
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button key={item.label} color="inherit" startIcon={item.icon} onClick={item.action}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile && (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <TranslateIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {languages.map((l) => (
                  <MenuItem key={l} selected={lang === l} onClick={() => handleLangChange(l)}>
                    {l.toUpperCase()}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {!isMobile && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e94560', fontSize: 14 }}>
                {(user.name ?? '?')[0].toUpperCase()}
              </Avatar>
              <Typography variant="body2">{user.name}</Typography>
              <Button color="inherit" onClick={logout}>
                {t('nav.logout', lang)}
              </Button>
            </Box>
          ) : !isMobile ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => router.push('/login')}>
                {t('nav.login', lang)}
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => router.push('/register')}>
                {t('nav.register', lang)}
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
}
