'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
  Drawer,
  Button,
  Fab,
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Timeline as TimelineIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  CheckCircle as CompleteIcon,
  Cancel as FailedIcon,
  ExpandLess as MinimizeIcon,
  ExpandMore as ExpandIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useI18n } from '@/contexts/I18nContext';
import { usePusherEvent } from '@/contexts/PusherContext';
import { t } from '@/lib/i18n';

interface ActivityEntry {
  id: number;
  type: string;
  label: string;
  icon: React.ReactNode;
  timestamp: number;
  status?: string;
}

const MAX_LOG = 50;

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  login: <LoginIcon sx={{ fontSize: 18 }} />,
  register: <RegisterIcon sx={{ fontSize: 18 }} />,
  register_training: <RegisterIcon sx={{ fontSize: 18 }} />,
  exercise_completed: <CompleteIcon sx={{ fontSize: 18 }} />,
  exercise_failed: <FailedIcon sx={{ fontSize: 18 }} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  login: '#4ECDC4',
  register: '#45B7D1',
  register_training: '#45B7D1',
  exercise_completed: '#4caf50',
  exercise_failed: '#ff9800',
};

function HeartContent({ onClose }: { onClose?: () => void }) {
  const { lang } = useI18n();
  const theme = useTheme();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [minimized, setMinimized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const addActivity = useCallback((raw: unknown) => {
    const data = raw as { type: string; status?: string; timestamp: number; trainingRegistered?: boolean };
    const type = data.type === 'register' && data.trainingRegistered
      ? 'register_training'
      : data.type;
    const labelKey = type === 'exercise_completed' && data.status === 'completed'
      ? 'heart.activity.exercise_completed'
      : type === 'exercise_completed' && data.status === 'failed'
      ? 'heart.activity.exercise_failed'
      : `heart.activity.${type}`;

    idRef.current += 1;
    const entry: ActivityEntry = {
      id: idRef.current,
      type,
      label: t(labelKey, lang),
      icon: ACTIVITY_ICONS[type] ?? <TimelineIcon sx={{ fontSize: 18 }} />,
      timestamp: data.timestamp,
      status: data.status,
    };

    setActivities((prev) => [entry, ...prev].slice(0, MAX_LOG));
  }, [lang]);

  usePusherEvent('activity', 'platform-activity', addActivity);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [activities]);

  const helpContent = (
    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
        {t('heart.help.title', lang)}
      </Typography>
      {[1, 2, 3, 4].map((i) => (
        <Typography key={i} variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5, lineHeight: 1.4 }}>
          • {t(`heart.help.line${i}` as string, lang)}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HeartIcon sx={{ color: '#e94560' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('heart.title', lang)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setMinimized(!minimized)}>
            {minimized ? <ExpandIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
          </IconButton>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Banner */}
      <Typography variant="caption" sx={{ color: '#888', mb: 1.5, lineHeight: 1.4, fontStyle: 'italic' }}>
        {t('heart.banner', lang)}
      </Typography>

      {/* Help section */}
      {helpContent}

      {/* Activity log */}
      <Collapse in={!minimized} sx={{ flex: 1, minHeight: 0 }}>
        <Box
          ref={listRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          {activities.length === 0 && (
            <Typography variant="caption" sx={{ color: '#aaa', textAlign: 'center', py: 2 }}>
              {t('heart.empty', lang)}
            </Typography>
          )}
          {activities.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.75,
                borderRadius: 1.5,
                bgcolor: '#f5f5f5',
                borderLeft: `3px solid ${ACTIVITY_COLORS[entry.type] ?? '#ccc'}`,
              }}
            >
              <Box sx={{ color: ACTIVITY_COLORS[entry.type] ?? '#888', display: 'flex' }}>
                {entry.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', lineHeight: 1.3 }}>
                  {entry.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function HeartOfLorien() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Fab
          color="secondary"
          size="small"
          onClick={() => setDrawerOpen(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1200 }}
        >
          <HeartIcon />
        </Fab>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70vh' } } }}
        >
          <Box sx={{ p: 2, height: '100%' }}>
            <HeartContent onClose={() => setDrawerOpen(false)} />
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Card
      sx={{
        width: '30%',
        minWidth: 280,
        maxWidth: 380,
        borderRadius: 3,
        position: 'sticky',
        top: 16,
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
        <HeartContent />
      </CardContent>
    </Card>
  );
}
