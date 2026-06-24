'use client';

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
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { t, Language, languages } from '@/lib/i18n';

export default function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLangChange = (l: Language) => {
    setLang(l);
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a1a2e' }}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 1, color: '#e94560' }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 0, mr: 4, cursor: 'pointer', fontWeight: 700 }}
          onClick={() => router.push('/')}
        >
          Lorien
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <Button color="inherit" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
            {t('nav.home', lang)}
          </Button>
          <Button color="inherit" startIcon={<SchoolIcon />} onClick={() => router.push('/training')}>
            {t('nav.training', lang)}
          </Button>
          {user?.role === 'admin' && (
            <Button color="inherit" startIcon={<AdminIcon />} onClick={() => router.push('/admin')}>
              {t('nav.admin', lang)}
            </Button>
          )}
        </Box>

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

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#e94560', fontSize: 14 }}>
              {(user.name ?? '?')[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2">{user.name}</Typography>
            <Button color="inherit" onClick={logout}>
              {t('nav.logout', lang)}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => router.push('/login')}>
              {t('nav.login', lang)}
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => router.push('/register')}>
              {t('nav.register', lang)}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
