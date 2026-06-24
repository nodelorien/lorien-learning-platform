'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
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

export default function HomePage() {
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
