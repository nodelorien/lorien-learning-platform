'use client';

import { CssBaseline, ThemeProvider, createTheme, Box, Alert } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider, useI18n } from '@/contexts/I18nContext';
import { PusherProvider } from '@/contexts/PusherContext';
import { t } from '@/lib/i18n';
import Topbar from '@/components/Topbar';
import HeartOfLorien from '@/components/HeartOfLorien';

const theme = createTheme({
  palette: {
    primary: { main: '#1a1a2e' },
    secondary: { main: '#e94560' },
    background: { default: '#f0f2f5' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

function DisclaimerBar() {
  const { lang } = useI18n();
  return (
    <Alert severity="warning" sx={{ borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5 }}>
      {t('disclaimer.text', lang)}
    </Alert>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nProvider>
        <AuthProvider>
          <PusherProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Topbar />
            <DisclaimerBar />
            <Box sx={{ flex: 1, display: 'flex', gap: { md: 2 }, p: { xs: 1.5, sm: 3 }, bgcolor: '#f0f2f5', overflow: 'hidden' }}>
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{children}</Box>
              <HeartOfLorien />
            </Box>
          </Box>
          </PusherProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
