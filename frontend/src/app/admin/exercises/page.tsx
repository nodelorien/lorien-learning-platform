'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/RouteGuard';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

interface Exercise {
  id: string;
  title: string;
  type: string;
  category: string;
  topic: string;
  enabled: boolean;
  timeLimitSeconds: number;
}

function AdminExercisesContent() {
  const { lang } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/exercises').then(({ data }) => {
      setExercises(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar ejercicio?')) return;
    await api.delete(`/exercises/${id}`);
    load();
  };

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push('/admin')}><BackIcon /></IconButton>
        <Typography variant="h5" sx={{ flex: 1 }}>{t('admin.exercises', lang)}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/exercises/new')}>
          {t('admin.new', lang)}
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {exercises.map((ex) => (
            <Card key={ex.id} sx={{ borderRadius: 2, mb: 1.5 }}>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>{ex.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={ex.type === 'prompt' ? 'Prompt' : ex.type === 'trivia' ? 'Trivia' : 'Tokens'} color={ex.type === 'prompt' ? 'info' : ex.type === 'trivia' ? 'warning' : 'success'} size="small" />
                      <Chip label={`${ex.timeLimitSeconds ?? 15}s`} variant="outlined" size="small" />
                      <Chip label={ex.enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)} color={ex.enabled ? 'success' : 'default'} size="small" />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {ex.category ? `Cat: ${ex.category}` : ''}{ex.category && ex.topic ? ' | ' : ''}{ex.topic ? `Tema: ${ex.topic}` : ''}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="medium" startIcon={<EditIcon />} onClick={() => router.push(`/admin/exercises/${ex.id}`)}>
                  {t('admin.edit', lang)}
                </Button>
                <Button size="medium" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(ex.id)}>
                  {t('admin.delete', lang)}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a1a2e' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Título</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categoría</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tema</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tiempo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercises.map((ex) => (
                <TableRow key={ex.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{ex.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ex.type === 'prompt' ? 'Prompt' : ex.type === 'trivia' ? 'Trivia' : 'Tokens'} color={ex.type === 'prompt' ? 'info' : ex.type === 'trivia' ? 'warning' : 'success'} size="small" />
                  </TableCell>
                  <TableCell>{ex.category || '-'}</TableCell>
                  <TableCell>{ex.topic || '-'}</TableCell>
                  <TableCell>{ex.timeLimitSeconds ?? 15}s</TableCell>
                  <TableCell>
                    <Chip label={ex.enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)} color={ex.enabled ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => router.push(`/admin/exercises/${ex.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(ex.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default function AdminExercisesPage() {
  return <AdminRoute><AdminExercisesContent /></AdminRoute>;
}
