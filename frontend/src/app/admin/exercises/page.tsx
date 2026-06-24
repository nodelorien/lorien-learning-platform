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
  type: 'prompt' | 'trivia';
  category: string;
  topic: string;
  enabled: boolean;
}

function AdminExercisesContent() {
  const { lang } = useI18n();
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

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1a1a2e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Título</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categoría</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tema</TableCell>
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
                  <Chip
                    label={ex.type === 'prompt' ? 'Prompt' : 'Trivia'}
                    color={ex.type === 'prompt' ? 'info' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{ex.category || '-'}</TableCell>
                <TableCell>{ex.topic || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={ex.enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)}
                    color={ex.enabled ? 'success' : 'default'}
                    size="small"
                  />
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
    </Container>
  );
}

export default function AdminExercisesPage() {
  return <AdminRoute><AdminExercisesContent /></AdminRoute>;
}
