'use client';

import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/RouteGuard';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Box,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as ExerciseIcon,
  BarChart as StatsIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

const adminCards = [
  {
    title: 'admin.trainings',
    icon: <SchoolIcon sx={{ fontSize: 48 }} />,
    path: '/admin/trainings',
    color: '#1a1a2e',
  },
  {
    title: 'admin.exercises',
    icon: <ExerciseIcon sx={{ fontSize: 48 }} />,
    path: '/admin/exercises',
    color: '#e94560',
  },
  {
    title: 'admin.users',
    icon: <UsersIcon sx={{ fontSize: 48 }} />,
    path: '/admin/users',
    color: '#2e7d32',
  },
];

function AdminContent() {
  const { lang } = useI18n();
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4">{t('admin.title', lang)}</Typography>
      </Box>

      <Grid container spacing={3}>
        {adminCards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                borderRadius: 3,
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardActionArea onClick={() => router.push(card.path)} sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', color: card.color }}>{card.icon}</Box>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{t(card.title, lang)}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default function AdminPage() {
  return <AdminRoute><AdminContent /></AdminRoute>;
}
