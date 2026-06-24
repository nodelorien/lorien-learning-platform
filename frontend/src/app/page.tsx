'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  Edit as PromptIcon,
  Timer as TriviaIcon,
  Token as TokenIcon,
  ArrowForward as ArrowIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { usePusherEvent } from '@/contexts/PusherContext';
import { t } from '@/lib/i18n';

interface RankingEntry {
  userId: string;
  userName: string;
  company: string;
  completedExercises: number;
  totalTimeSpent: number;
  averageScore: number;
}

function RankingCard({ entry, index }: { entry: RankingEntry; index: number }) {
  const { lang } = useI18n();
  return (
    <Card sx={{ borderRadius: 2, mb: 1 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ minWidth: 40, textAlign: 'center' }}>
            {index === 0 ? <TrophyIcon sx={{ color: '#FFD700', fontSize: 28 }} /> : null}
            {index === 1 ? <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 28 }} /> : null}
            {index === 2 ? <TrophyIcon sx={{ color: '#CD7F32', fontSize: 28 }} /> : null}
            {index > 2 && <Typography sx={{ fontWeight: 700 }}>#{index + 1}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: '#e94560', width: 36, height: 36, fontSize: 16 }}>
            {entry.userName[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>{entry.userName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {entry.company || '-'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <Chip icon={<CheckIcon />} label={entry.completedExercises} color="success" size="small" sx={{ mb: 0.5 }} />
            <Typography variant="caption" sx={{ display: 'block' }}>
              <TimeIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} /> {entry.totalTimeSpent}s
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }} color="primary">
              {entry.averageScore.toFixed(1)} pts
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function RankingView() {
  const { lang } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  const refresh = useCallback(() => {
    api.get('/stats/ranking').then(({ data }) => setRanking(data)).catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  usePusherEvent('ranking', 'ranking-updated', refresh);

  if (isMobile) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <TrophyIcon sx={{ fontSize: 40, color: '#e94560' }} />
          <Typography variant="h5">{t('home.title', lang)}</Typography>
        </Box>
        {ranking.map((entry, i) => (
          <RankingCard key={entry.userId} entry={entry} index={i} />
        ))}
        {ranking.length === 0 && (
          <Typography sx={{ textAlign: 'center' }} color="text.secondary">{t('loading', lang)}</Typography>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TrophyIcon sx={{ fontSize: 48, color: '#e94560' }} />
        <Typography variant="h4">{t('home.title', lang)}</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1a1a2e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.rank', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.user', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.company', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">{t('home.completed', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">{t('home.time', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">{t('home.score', lang)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((entry, i) => (
              <TableRow key={entry.userId} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {i === 0 ? <TrophyIcon sx={{ color: '#FFD700' }} /> : null}
                    {i === 1 ? <TrophyIcon sx={{ color: '#C0C0C0' }} /> : null}
                    {i === 2 ? <TrophyIcon sx={{ color: '#CD7F32' }} /> : null}
                    <Typography sx={{ fontWeight: 700 }}>{i + 1}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#e94560', width: 32, height: 32, fontSize: 14 }}>
                      {entry.userName[0]?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600 }}>{entry.userName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{entry.company || '-'}</TableCell>
                <TableCell align="center">
                  <Chip icon={<CheckIcon />} label={entry.completedExercises} color="success" size="small" />
                </TableCell>
                <TableCell align="center">
                  <Chip icon={<TimeIcon />} label={`${entry.totalTimeSpent}s`} variant="outlined" size="small" />
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontWeight: 600 }} color="primary">{entry.averageScore.toFixed(1)}</Typography>
                </TableCell>
              </TableRow>
            ))}
            {ranking.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{t('loading', lang)}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

function LandingPage() {
  const { lang } = useI18n();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sectionSx = { py: { xs: 6, md: 10 } };

  return (
    <>
      {/* Hero */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', ...sectionSx, textAlign: 'center' }}>
        <Container maxWidth="md">
          <SchoolIcon sx={{ fontSize: 56, color: '#e94560', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', md: '2.75rem' } }}>
            {t('landing.hero.title', lang)}
          </Typography>
          <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            {t('landing.hero.subtitle', lang)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
              sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' }, px: 4 }}
            >
              {t('nav.login', lang)}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RegisterIcon />}
              onClick={() => router.push('/register')}
              sx={{ borderColor: '#e94560', color: '#e94560', '&:hover': { borderColor: '#d63851', bgcolor: 'rgba(233,69,96,0.08)' }, px: 4 }}
            >
              {t('nav.register', lang)}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How it works */}
      <Box sx={{ bgcolor: 'white', ...sectionSx }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}>
            {t('landing.how.title', lang)}
          </Typography>
          <Grid container spacing={4}>
            {[
              { num: '1', text: t('landing.how.step1', lang), icon: <SchoolIcon /> },
              { num: '2', text: t('landing.how.step2', lang), icon: <PromptIcon /> },
              { num: '3', text: t('landing.how.step3', lang), icon: <TrophyIcon /> },
            ].map((step) => (
              <Grid size={{ xs: 12, md: 4 }} key={step.num}>
                <Card sx={{ textAlign: 'center', height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ py: 4 }}>
                    <Avatar sx={{ bgcolor: '#e94560', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      {step.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#e94560', mb: 1 }}>
                      {step.num}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {step.text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Exercise types */}
      <Box sx={{ bgcolor: '#f8f9fa', ...sectionSx }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}>
            {t('landing.exercises.title', lang)}
          </Typography>
          <Grid container spacing={4}>
            {[
              { title: t('landing.exercises.trivia.title', lang), desc: t('landing.exercises.trivia.desc', lang), icon: <TriviaIcon sx={{ fontSize: 32 }} /> },
              { title: t('landing.exercises.prompt.title', lang), desc: t('landing.exercises.prompt.desc', lang), icon: <PromptIcon sx={{ fontSize: 32 }} /> },
              { title: t('landing.exercises.tokens.title', lang), desc: t('landing.exercises.tokens.desc', lang), icon: <TokenIcon sx={{ fontSize: 32 }} /> },
            ].map((ex) => (
              <Grid size={{ xs: 12, md: 4 }} key={ex.title}>
                <Card sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: '#e94560', mb: 2 }}>{ex.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{ex.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{ex.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Training structure */}
      <Box sx={{ bgcolor: 'white', ...sectionSx }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 48, color: '#e94560', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            {t('landing.trainings.title', lang)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            {t('landing.trainings.desc', lang)}
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={() => router.push('/register')}
            sx={{ bgcolor: '#1a1a2e', '&:hover': { bgcolor: '#2d2d4e' } }}
          >
            {t('landing.hero.cta', lang)}
          </Button>
        </Container>
      </Box>

      {/* Story / About */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', ...sectionSx }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            {t('landing.story.title', lang)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: '#b0b0b0' }}>
            {t('landing.story.desc', lang)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#888' }}>
            {t('landing.story.built', lang)} <strong>{t('landing.story.date', lang)}</strong>
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0f0f1a', color: '#666', py: 3, textAlign: 'center' }}>
        <Typography variant="body2">{t('landing.footer', lang)}</Typography>
      </Box>
    </>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <RankingView />;
}
