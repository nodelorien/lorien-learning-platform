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

interface Training {
  id: string;
  title: string;
  enabled: boolean;
  expirationDate?: string;
}

function AdminTrainingsContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/trainings').then(({ data }) => {
      setTrainings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar training?')) return;
    await api.delete(`/trainings/${id}`);
    load();
  };

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push('/admin')}><BackIcon /></IconButton>
        <Typography variant="h5" sx={{ flex: 1 }}>{t('admin.trainings', lang)}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/trainings/new')}>
          {t('admin.new', lang)}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#1a1a2e' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Título</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Expira</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainings.map((tr) => (
              <TableRow key={tr.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{tr.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={tr.enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)}
                    color={tr.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {tr.expirationDate ? new Date(tr.expirationDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => router.push(`/admin/trainings/${tr.id}`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(tr.id)} color="error">
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

export default function AdminTrainingsPage() {
  return <AdminRoute><AdminTrainingsContent /></AdminRoute>;
}
