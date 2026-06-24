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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
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

function NewExerciseContent() {
  const { lang } = useI18n();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'prompt' | 'trivia'>('prompt');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Option[]>([{ id: uuid(), text: '', correct: false }]);

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

    let content: string;
    if (type === 'prompt') {
      content = JSON.stringify({ prompt, expectedAnswer });
    } else {
      if (!options.some((o) => o.correct)) {
        alert('Debe seleccionar una opción correcta');
        return;
      }
      content = JSON.stringify({ question, options });
    }

    await api.post('/exercises', {
      title,
      description,
      type,
      content,
      category,
      topic,
    });
    router.push('/admin/exercises');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.back()}><BackIcon /></IconButton>
        <Typography variant="h5">{t('admin.new', lang)} Ejercicio</Typography>
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
            <TextField
              fullWidth
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <TextField
              fullWidth
              label="Tema"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </Box>

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
                  <Radio
                    checked={opt.correct}
                    onChange={() => handleCorrectChange(opt.id)}
                    name="correct-option"
                  />
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

export default function NewExercisePage() {
  return <AdminRoute><NewExerciseContent /></AdminRoute>;
}
