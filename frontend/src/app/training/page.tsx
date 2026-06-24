'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/RouteGuard';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  TimerOff as ExpireIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { usePusherEvent } from '@/contexts/PusherContext';
import { t } from '@/lib/i18n';

interface Training {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  expirationDate?: string;
}

function TrainingPageContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/trainings').then(({ data }) => {
      setTrainings(data.filter((t: Training) => t.enabled));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const pollRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    pollRef.current = setInterval(load, 30000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  usePusherEvent('trainings', 'training-updated', load);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SchoolIcon sx={{ fontSize: 48, color: '#e94560' }} />
        <Typography variant="h4">{t('training.title', lang)}</Typography>
      </Box>

      {trainings.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center' }} color="text.secondary">
          {t('training.noTraining', lang)}
        </Typography>
      )}

      <Grid container spacing={3}>
        {trainings.map((tr) => (
          <Grid key={tr.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              }}
              onClick={() => router.push(`/training/${tr.id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>{tr.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tr.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={t('training.start', lang)}
                    color="primary"
                    size="small"
                  />
                  {tr.expirationDate && (
                    <Chip
                      icon={<ExpireIcon />}
                      label={`${t('training.expires', lang)}: ${new Date(tr.expirationDate).toLocaleDateString()}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="medium" color="secondary" startIcon={<SchoolIcon />}>
                  {t('training.start', lang)}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default function TrainingPage() {
  return <ProtectedRoute><TrainingPageContent /></ProtectedRoute>;
}
