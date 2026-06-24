'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/RouteGuard';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

interface Exercise {
  id: string;
  title: string;
  type: 'prompt' | 'trivia';
  category: string;
}

interface TrainingExercise {
  id: string;
  exerciseId: string;
  position: number;
  enabled: boolean;
  exercise?: Exercise;
}

function EditTrainingContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalUsers: number; totalCompleted: number; winners: Array<{ userName: string }> } | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/trainings/${id}`),
      api.get('/exercises'),
      api.get(`/stats/training/${id}`),
    ]).then(([trRes, exRes, statsRes]) => {
      const tr = trRes.data;
      setTitle(tr.title);
      setDescription(tr.description);
      setExpirationDate(tr.expirationDate ? tr.expirationDate.split('T')[0] : '');
      setEnabled(tr.enabled);
      setExercises(tr.exercises || []);
      setAvailableExercises(exRes.data);
      setStats(statsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    await api.put(`/trainings/${id}`, {
      title,
      description,
      expirationDate: expirationDate || undefined,
      enabled,
    });
    router.push('/admin/trainings');
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (!id) return;
    await api.post(`/trainings/${id}/exercises`, { exerciseId });
    const { data } = await api.get(`/trainings/${id}`);
    setExercises(data.exercises || []);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!id) return;
    await api.delete(`/trainings/${id}/exercises/${exerciseId}`);
    const { data } = await api.get(`/trainings/${id}`);
    setExercises(data.exercises || []);
  };

  const moveExercise = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    const ids = exercises.map((e) => e.exerciseId);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    if (!id) return;
    await api.put(`/trainings/${id}/exercises/reorder`, { exerciseIds: ids });
    const { data } = await api.get(`/trainings/${id}`);
    setExercises(data.exercises || []);
  };

  const addedIds = new Set(exercises.map((e) => e.exerciseId));
  const availableToAdd = availableExercises.filter((e) => !addedIds.has(e.id));

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;
  if (!id) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push('/admin/trainings')}><BackIcon /></IconButton>
        <Typography variant="h5">Editar Training</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('admin.expiration', lang)}
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
              label={enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => router.push('/admin/trainings')}>
                {t('admin.cancel', lang)}
              </Button>
              <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#e94560' }}>
                {t('admin.save', lang)}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('training.exercises', lang)}</Typography>
            {exercises.length === 0 && (
              <Typography color="text.secondary">{t('admin.dragdrop', lang)}</Typography>
            )}
            {exercises.sort((a, b) => a.position - b.position).map((te, i) => (
              <Card key={te.id} sx={{ mb: 1, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  <DragIcon sx={{ color: '#999', cursor: 'grab' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{te.exercise?.title || 'Ejercicio'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {te.exercise?.type} {te.exercise?.category ? `- ${te.exercise.category}` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" disabled={i === 0} onClick={() => moveExercise(i, -1)}>↑</Button>
                    <Button size="small" disabled={i === exercises.length - 1} onClick={() => moveExercise(i, 1)}>↓</Button>
                    <IconButton size="small" color="error" onClick={() => handleRemoveExercise(te.exerciseId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Ejercicios Disponibles</Typography>
            {availableToAdd.map((ex) => (
              <Card key={ex.id} sx={{ mb: 1, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{ex.title}</Typography>
                    <Chip label={ex.type} size="small" variant="outlined" />
                  </Box>
                  <IconButton size="small" color="primary" onClick={() => handleAddExercise(ex.id)}>
                    <AddIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
            {availableToAdd.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Todos los ejercicios están agregados
              </Typography>
            )}
          </Paper>

          {stats && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('admin.stats', lang)}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip label={`${t('admin.registered', lang)}: ${stats.totalUsers}`} color="primary" />
                <Chip label={`${t('admin.completed', lang)}: ${stats.totalCompleted}`} color="success" />
              </Box>
              {stats.winners.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('admin.winners', lang)}</Typography>
                  {stats.winners.slice(0, 3).map((w, i) => (
                    <Typography key={i} variant="body2">
                      {i + 1}. {w.userName}
                    </Typography>
                  ))}
                </>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default function EditTrainingPage() {
  return <AdminRoute><EditTrainingContent /></AdminRoute>;
}
