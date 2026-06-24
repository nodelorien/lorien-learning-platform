'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface PromptContent {
  prompt: string;
  expectedAnswer: string;
  structureCheck: Record<string, string[]>;
}

const STRUCTURE_LABELS: Record<string, { label: string; icon: string }> = {
  role: { label: 'Rol', icon: '🎭' },
  context: { label: 'Contexto', icon: '📋' },
  objective: { label: 'Objetivo', icon: '🎯' },
  format: { label: 'Formato', icon: '📐' },
  restrictions: { label: 'Restricciones', icon: '🔒' },
};

export default function PromptExercise({
  exerciseId,
  content,
  onSubmit,
}: {
  exerciseId: string;
  content: PromptContent;
  onSubmit: (correct: boolean) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    breakdown: Record<string, boolean>;
  } | null>(null);

  const handleSubmit = async () => {
    setSubmitted(true);
    setGrading(true);

    try {
      const { data } = await api.post('/exercises/grade-prompt', {
        exerciseId,
        userPrompt: answer,
      });
      setResult(data);
    } catch {
      setResult({
        score: 0,
        feedback: 'Error al conectar con el evaluador. Intenta de nuevo.',
        breakdown: { role: false, context: false, objective: false, format: false, restrictions: false },
      });
    }

    setGrading(false);
  };

  const handleContinue = () => {
    onSubmit((result?.score ?? 0) >= 60);
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
        {content.prompt}
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Escribe tu prompt aquí..."
        disabled={submitted && !grading}
        sx={{ mb: 2 }}
      />

      {grading && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Evaluando con IA...
          </Typography>
        </Box>
      )}

      {result && !grading && (
        <Box sx={{ mb: 2 }}>
          <Alert severity={result.score >= 60 ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Puntaje: {result.score}/100 — {result.score >= 60 ? '¡Aprobado!' : 'Necesita mejorar'}
            </Typography>
            <Typography variant="body2">{result.feedback}</Typography>
          </Alert>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Componentes del prompt profesional:
          </Typography>

          <List dense>
            {Object.entries(STRUCTURE_LABELS).map(([key, meta]) => {
              const present = result.breakdown[key] ?? false;
              return (
                <ListItem key={key}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: present ? '#4caf50' : '#e0e0e0', width: 32, height: 32 }}>
                      {present ? <CheckIcon sx={{ fontSize: 18 }} /> : <WarningIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${meta.icon} ${meta.label}`}
                    secondary={present ? '✓ Presente' : '✗ No detectado'}
                    sx={{ '& .MuiListItemText-primary': { fontWeight: present ? 600 : 400 } }}
                  />
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip icon={<AiIcon />} label="Evaluado por DeepSeek AI" color="primary" variant="outlined" size="small" />
            {result.score >= 60 ? (
              <Chip icon={<LightbulbIcon />} label="Prompt profesional" color="success" variant="outlined" />
            ) : (
              <Chip icon={<LightbulbIcon />} label="Sigue practicando" color="warning" variant="outlined" />
            )}
          </Box>
        </Box>
      )}

      {!submitted && !grading && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!answer.trim()}
          sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' } }}
        >
          Enviar Prompt
        </Button>
      )}

      {submitted && !grading && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleContinue}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
        >
          {result && result.score >= 60 ? '✅ Continuar' : 'Continuar'}
        </Button>
      )}
    </Box>
  );
}
