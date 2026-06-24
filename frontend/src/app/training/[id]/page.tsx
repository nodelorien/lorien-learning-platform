'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/RouteGuard';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Timer as TimerIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { usePusherEvent } from '@/contexts/PusherContext';
import { t } from '@/lib/i18n';
import PromptExercise from '@/components/PromptExercise';
import TriviaExercise from '@/components/TriviaExercise';
import TokensExercise from '@/components/TokensExercise';

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'prompt' | 'trivia' | 'tokens';
  content: string;
  timeLimitSeconds: number;
}

interface TrainingExercise {
  id: string;
  trainingId: string;
  exerciseId: string;
  position: number;
  enabled: boolean;
  exercise?: Exercise;
}

const TYPE_ICONS: Record<string, string> = {
  prompt: '✍️',
  trivia: '🧠',
  tokens: '🔢',
};

const TYPE_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  trivia: 'Trivia',
  tokens: 'Tokens',
};

function TrainingDetailContent() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [trainingExercises, setTrainingExercises] = useState<TrainingExercise[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const loadExercises = useCallback(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id || !user) return;

    Promise.all([
      api.get(`/trainings/${id}`),
      user.role !== 'admin' ? api.get(`/stats/training/${id}/user/${user.id}`) : Promise.resolve({ data: [] }),
    ]).then(([{ data: trainingData }, statsData]) => {
      const items: TrainingExercise[] = (trainingData.exercises || []).filter((e: TrainingExercise) => e.enabled);
      const done = new Set<string>((statsData.data || []).map((s: { exerciseId: string }) => s.exerciseId));
      setCompletedIds(done);
      Promise.all(
        items.map(async (te: TrainingExercise) => {
          const { data: ex } = await api.get(`/exercises/${te.exerciseId}`);
          return { ...te, exercise: ex };
        }),
      ).then((results) => {
        const filtered = user.role !== 'admin' ? results.filter((r) => !done.has(r.exerciseId)) : results;
        setTrainingExercises(filtered);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [params.id, user]);

  useEffect(() => { loadExercises(); }, [loadExercises]);

  const trainingId = Array.isArray(params.id) ? params.id[0] : params.id;
  usePusherEvent('trainings', 'training-updated', useCallback(() => {
    if (trainingId) loadExercises();
  }, [trainingId, loadExercises]));

  const currentExercise = trainingExercises[currentStep]?.exercise;

  const handleSubmit = useCallback(async (correct: boolean, score?: number) => {
    if (!currentExercise || !user) return;
    if (completedIds.has(currentExercise.id) && user.role !== 'admin') return;

    setResult(correct ? 'correct' : 'incorrect');

    try {
      await api.post('/stats/attempts', {
        userId: user.id,
        exerciseId: currentExercise.id,
        trainingId,
        status: correct ? 'completed' : 'failed',
        timeSpent: 0,
        score: score ?? (correct ? 100 : 0),
      });
    } catch {
      // Silently fail — the exercise still advances
    }

    setCompletedIds((prev) => new Set(prev).add(currentExercise.id));
    setTimeout(() => {
      setResult(null);
      setCurrentStep((prev) => prev + 1);
    }, 1500);
  }, [currentExercise, user, trainingId, completedIds]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (trainingExercises.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5">{t('training.noTraining', lang)}</Typography>
        <Button startIcon={<BackIcon />} onClick={() => router.push('/training')} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Container>
    );
  }

  const allCompleted = currentStep >= trainingExercises.length;

  if (allCompleted) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CompleteIcon sx={{ fontSize: 64, color: '#4caf50' }} />
        <Typography variant="h4" sx={{ mt: 2 }}>¡Training Completado!</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Has completado todos los ejercicios del curso.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/training')} startIcon={<BackIcon />}>
          Volver a trainings
        </Button>
      </Container>
    );
  }

  const content = currentExercise ? JSON.parse(currentExercise.content) : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<BackIcon />} onClick={() => router.push('/training')} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Box sx={{ overflowX: 'auto', mb: 4 }}>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ minWidth: trainingExercises.length * 120 }}>
          {trainingExercises.map((te, i) => (
            <Step key={te.id} completed={i < currentStep}>
              <StepLabel>
                {TYPE_ICONS[te.exercise?.type ?? '']} {te.exercise?.title || `Ejercicio ${i + 1}`}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={<TimerIcon />}
              label={`Ejercicio ${currentStep + 1}/${trainingExercises.length}`}
              color="primary"
            />
            <Chip
              label={`${TYPE_ICONS[currentExercise?.type ?? '']} ${TYPE_LABELS[currentExercise?.type ?? '']}`}
              variant="outlined"
            />
          </Box>

          <Typography variant="h5" sx={{ mb: 1 }}>{currentExercise?.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{currentExercise?.description}</Typography>

          {currentExercise?.type === 'prompt' && content && (
            <PromptExercise key={currentExercise.id} exerciseId={currentExercise.id} content={content} onSubmit={(correct) => handleSubmit(correct)} />
          )}

          {currentExercise?.type === 'trivia' && content && (
            <TriviaExercise key={currentExercise.id} content={content} timeLimitSeconds={currentExercise.timeLimitSeconds ?? 15} onSubmit={(correct, score) => handleSubmit(correct, score)} />
          )}

          {currentExercise?.type === 'tokens' && content && (
            <TokensExercise key={currentExercise.id} content={content} timeLimitSeconds={currentExercise.timeLimitSeconds ?? 120} onSubmit={(correct) => handleSubmit(correct)} />
          )}

          {result && (
            <Alert severity={result === 'correct' ? 'success' : 'error'} sx={{ mt: 2 }}>
              {result === 'correct' ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default function TrainingDetailPage() {
  return <ProtectedRoute><TrainingDetailContent /></ProtectedRoute>;
}
