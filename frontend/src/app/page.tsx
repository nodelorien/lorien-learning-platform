'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

interface RankingEntry {
  userId: string;
  userName: string;
  company: string;
  completedExercises: number;
  totalTimeSpent: number;
  averageScore: number;
}

export default function HomePage() {
  const { lang } = useI18n();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    api.get('/stats/ranking').then(({ data }) => setRanking(data)).catch(() => {});
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TrophyIcon sx={{ fontSize: 48, color: '#e94560' }} />
        <Typography variant="h4">{t('home.title', lang)}</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1a1a2e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.rank', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.user', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('home.company', lang)}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                {t('home.completed', lang)}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                {t('home.time', lang)}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                {t('home.score', lang)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((entry, i) => (
              <TableRow
                key={entry.userId}
                sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
              >
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
                  <Chip
                    icon={<CheckIcon />}
                    label={entry.completedExercises}
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<TimeIcon />}
                    label={`${entry.totalTimeSpent}s`}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontWeight: 600 }} color="primary">
                    {entry.averageScore.toFixed(1)}
                  </Typography>
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
