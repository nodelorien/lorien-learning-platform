'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { PersonAdd as RegisterIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

interface Training {
  id: string;
  title: string;
}

export default function RegisterPage() {
  const { lang } = useI18n();
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [trainingId, setTrainingId] = useState('');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    api.get('/trainings').then(({ data }) => setTrainings(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      await api.post('/auth/register', { name, company, password, trainingId: trainingId || undefined });
      setSuccess(t('register.success', lang));
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar';
      setError(msg);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <RegisterIcon sx={{ fontSize: 48, color: '#e94560', mb: 1 }} />
          <Typography variant="h5">{t('register.title', lang)}</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('register.name', lang)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label={t('register.company', lang)}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('register.password', lang)}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('register.training', lang)}</InputLabel>
            <Select
              value={trainingId}
              label={t('register.training', lang)}
              onChange={(e) => setTrainingId(e.target.value)}
            >
              <MenuItem value="">—</MenuItem>
              {trainings.map((tr) => (
                <MenuItem key={tr.id} value={tr.id}>
                  {tr.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' }, py: 1.5 }}
          >
            {t('register.submit', lang)}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
