'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { t } from '@/lib/i18n';

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'prompt' | 'trivia';
  content: string;
}

interface TrainingExercise {
  id: string;
  trainingId: string;
  exerciseId: string;
  position: number;
  enabled: boolean;
  exercise?: Exercise;
}

function TrainingDetailContent() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const [trainingExercises, setTrainingExercises] = useState<TrainingExercise[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;

    api.get(`/trainings/${id}`).then(({ data }) => {
      const items: TrainingExercise[] = (data.exercises || []).filter((e: TrainingExercise) => e.enabled);
      Promise.all(
        items.map(async (te: TrainingExercise) => {
          const { data: ex } = await api.get(`/exercises/${te.exerciseId}`);
          return { ...te, exercise: ex };
        }),
      ).then((results) => {
        setTrainingExercises(results);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [params.id]);

  const currentExercise = trainingExercises[currentStep]?.exercise;

  const handleSubmit = async () => {
    if (!currentExercise || !user) return;

    const content = JSON.parse(currentExercise.content);
    let isCorrect = false;

    if (currentExercise.type === 'prompt') {
      isCorrect = answer.trim().toLowerCase() === content.expectedAnswer?.toLowerCase();
    } else {
      isCorrect = content.options?.find((o: { id: string; correct: boolean }) => o.id === answer)?.correct ?? false;
    }

    setResult(isCorrect ? 'correct' : 'incorrect');
    const elapsed = Math.floor(timeSpent / 1000);

    await api.post('/stats/attempts', {
      userId: user.id,
      exerciseId: currentExercise.id,
      trainingId: Array.isArray(params.id) ? params.id[0] : params.id,
      status: isCorrect ? 'completed' : 'failed',
      timeSpent: elapsed,
      score: isCorrect ? 100 : 0,
    });

    setTimeout(() => {
      setResult(null);
      setAnswer('');
      setTimeSpent(0);
      if (currentStep < trainingExercises.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 2000);
  };

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
      </Container>
    );
  }

  const content = currentExercise ? JSON.parse(currentExercise.content) : null;
  const allCompleted = currentStep >= trainingExercises.length;

  if (allCompleted) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CompleteIcon sx={{ fontSize: 64, color: '#4caf50' }} />
        <Typography variant="h4" sx={{ mt: 2 }}>¡Training Completado!</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
        {trainingExercises.map((te, i) => (
          <Step key={te.id} completed={i < currentStep}>
            <StepLabel>{te.exercise?.title || `Ejercicio ${i + 1}`}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip
              icon={<TimerIcon />}
              label={`${t('training.exercises', lang)} ${currentStep + 1}/${trainingExercises.length}`}
              color="primary"
            />
            <Chip
              label={currentExercise?.type === 'prompt' ? t('exercise.prompt', lang) : t('exercise.trivia', lang)}
              variant="outlined"
            />
          </Box>

          <Typography variant="h5" sx={{ mb: 1 }}>{currentExercise?.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{currentExercise?.description}</Typography>

          {currentExercise?.type === 'prompt' ? (
            <>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {content?.prompt}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
                sx={{ mb: 2 }}
              />
            </>
          ) : (
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel>{content?.question}</FormLabel>
              <RadioGroup value={answer} onChange={(e) => setAnswer(e.target.value)}>
                {content?.options?.map((opt: { id: string; text: string }) => (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.id}
                    control={<Radio />}
                    label={opt.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          <LinearProgress variant="determinate" value={(timeSpent / 60000) * 100} sx={{ mb: 2 }} />

          {result && (
            <Alert severity={result === 'correct' ? 'success' : 'error'} sx={{ mb: 2 }}>
              {result === 'correct' ? t('exercise.correct', lang) : t('exercise.incorrect', lang)}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<StartIcon />}
            onClick={handleSubmit}
            disabled={!answer || !!result}
            sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' } }}
          >
            {t('exercise.submit', lang)}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function TrainingDetailPage() {
  return <ProtectedRoute><TrainingDetailContent /></ProtectedRoute>;
}
