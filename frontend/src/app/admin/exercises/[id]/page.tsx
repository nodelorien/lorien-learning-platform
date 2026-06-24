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
  FormControlLabel,
  Switch,
  Radio,
} from '@mui/material';
import { ArrowBack as BackIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';
import { v4 as uuid } from 'uuid';

interface Option {
  id: string;
  text: string;
  correct: boolean;
}

function EditExerciseContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'prompt' | 'trivia'>('prompt');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/exercises/${id}`).then(({ data }) => {
      setTitle(data.title);
      setDescription(data.description);
      setType(data.type);
      setCategory(data.category);
      setTopic(data.topic);
      setEnabled(data.enabled);
      const content = JSON.parse(data.content);
      if (data.type === 'prompt') {
        setPrompt(content.prompt);
        setExpectedAnswer(content.expectedAnswer);
      } else {
        setQuestion(content.question);
        setOptions(content.options);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAddOption = () => {
    setOptions([...options, { id: uuid(), text: '', correct: false }]);
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCorrectChange = (id: string) => {
    setOptions(options.map((o) => ({ ...o, correct: o.id === id })));
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 1) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    let content: string;
    if (type === 'prompt') {
      content = JSON.stringify({ prompt, expectedAnswer });
    } else {
      content = JSON.stringify({ question, options });
    }

    await api.put(`/exercises/${id}`, {
      title, description, type, content, category, topic, enabled,
    });
    router.push('/admin/exercises');
  };

  if (loading) return <Container sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.back()}><BackIcon /></IconButton>
        <Typography variant="h5">Editar Ejercicio</Typography>
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
            rows={2}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={type} label="Tipo" onChange={(e) => setType(e.target.value as 'prompt' | 'trivia')}>
                <MenuItem value="prompt">Prompt</MenuItem>
                <MenuItem value="trivia">Trivia</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} />
            <TextField fullWidth label="Tema" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Box>

          <FormControlLabel
            control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
            label={enabled ? t('admin.enabled', lang) : t('admin.disabled', lang)}
            sx={{ mb: 2 }}
          />

          {type === 'prompt' ? (
            <>
              <TextField
                fullWidth
                label="Prompt / Enunciado"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Respuesta esperada"
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Pregunta"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={2}
                required
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Opciones</Typography>
              {options.map((opt, i) => (
                <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Radio checked={opt.correct} onChange={() => handleCorrectChange(opt.id)} name="correct-option" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Opción ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                    required
                  />
                  <IconButton size="small" color="error" onClick={() => handleRemoveOption(opt.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={handleAddOption} sx={{ mb: 3 }}>
                Agregar opción
              </Button>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => router.back()}>{t('admin.cancel', lang)}</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#e94560' }}>{t('admin.save', lang)}</Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default function EditExercisePage() {
  return <AdminRoute><EditExerciseContent /></AdminRoute>;
}
