'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/RouteGuard';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

function NewTrainingContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/trainings', {
      title,
      description,
      expirationDate: expirationDate || undefined,
    });
    router.push('/admin/trainings');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.back()}><BackIcon /></IconButton>
        <Typography variant="h5">{t('admin.new', lang)} Training</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
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
            sx={{ mb: 3 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => router.back()}>
              {t('admin.cancel', lang)}
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#e94560' }}>
              {t('admin.save', lang)}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default function NewTrainingPage() {
  return <AdminRoute><NewTrainingContent /></AdminRoute>;
}
