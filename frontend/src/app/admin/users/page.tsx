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

interface User {
  id: string;
  name: string;
  company: string;
  role: string;
  createdAt: string;
}

function AdminUsersContent() {
  const { lang } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/users').then(({ data }) => {
      setUsers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch {
      alert('No se puede eliminar este usuario');
    }
  };

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push('/admin')}><BackIcon /></IconButton>
        <Typography variant="h5" sx={{ flex: 1 }}>{t('admin.users', lang)}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/users/new')}>
          {t('admin.new', lang)}
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {users.map((u) => (
            <Card key={u.id} sx={{ borderRadius: 2, mb: 1.5 }}>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{u.company || '-'}</Typography>
                  </Box>
                  <Chip label={u.role} color={u.role === 'admin' ? 'error' : 'primary'} size="small" />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="medium" startIcon={<EditIcon />} onClick={() => router.push(`/admin/users/${u.id}`)}>
                  {t('admin.edit', lang)}
                </Button>
                <Button size="medium" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(u.id)}>
                  {t('admin.delete', lang)}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a1a2e' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Compañía</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Registro</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                  </TableCell>
                  <TableCell>{u.company || '-'}</TableCell>
                  <TableCell>
                    <Chip label={u.role} color={u.role === 'admin' ? 'error' : 'primary'} size="small" />
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => router.push(`/admin/users/${u.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(u.id)} color="error">
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

export default function AdminUsersPage() {
  return <AdminRoute><AdminUsersContent /></AdminRoute>;
}
