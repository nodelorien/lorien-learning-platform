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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

function EditUserContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/users/${id}`).then(({ data }) => {
      setName(data.name);
      setCompany(data.company);
      setRole(data.role);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const body: Record<string, unknown> = { name, company, role };
    if (password) body.password = password;
    await api.put(`/users/${id}`, body);
    router.push('/admin/users');
  };

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.back()}><BackIcon /></IconButton>
        <Typography variant="h5">Editar Usuario</Typography>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Nombre" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Compañía" value={company} onChange={(e) => setCompany(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Nueva Contraseña (dejar vacío para no cambiar)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Rol</InputLabel>
            <Select value={role} label="Rol" onChange={(e) => setRole(e.target.value as 'user' | 'admin')}>
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => router.back()} sx={{ flex: { xs: 1, sm: 'none' } }}>
              {t('admin.cancel', lang)}
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#e94560', flex: { xs: 1, sm: 'none' } }}>
              {t('admin.save', lang)}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default function EditUserPage() {
  return <AdminRoute><EditUserContent /></AdminRoute>;
}

export function generateStaticParams() {
  return [];
}
