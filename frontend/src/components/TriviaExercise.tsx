'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import { PlayArrow as StartIcon } from '@mui/icons-material';

interface TriviaContent {
  question: string;
  options: { id: string; text: string; correct: boolean }[];
}

export default function TriviaExercise({
  content,
  timeLimitSeconds = 15,
  onSubmit,
}: {
  content: TriviaContent;
  timeLimitSeconds?: number;
  onSubmit: (correct: boolean, score: number) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [isCorrect, setIsCorrect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = content.options.find((o) => o.id === answer)?.correct ?? false;
    setIsCorrect(correct);
    const timeBonus = Math.round((timeLeft / timeLimitSeconds) * 30);
    const score = correct ? 70 + timeBonus : 0;
    setSubmitted(true);
    setTimeout(() => onSubmitRef.current(correct, score), 2000);
  }, [content.options, answer, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitted(true);
      setIsCorrect(false);
      setTimeout(() => onSubmitRef.current(false, 0), 2000);
    }
  }, [timeLeft, submitted]);

  const progress = timeLimitSeconds > 0 ? (timeLeft / timeLimitSeconds) * 100 : 0;
  const isTimeout = timeLeft === 0 && !submitted;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {isTimeout ? '¡Tiempo agotado!' : `Tiempo: ${timeLeft}s`}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: timeLeft <= 5 ? 'error.main' : 'text.secondary' }}>
          {timeLeft <= 5 && !submitted ? '⏰ ¡Date prisa!' : ''}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mb: 3,
          height: 8,
          borderRadius: 4,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            bgcolor: timeLeft <= 5 ? '#e94560' : '#4ECDC4',
            transition: 'width 1s linear',
          },
        }}
      />

      <Card
        sx={{
          borderRadius: 3,
          bgcolor: isTimeout ? '#fff5f5' : '#fff',
          border: isTimeout ? '2px solid #e94560' : '2px solid transparent',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {content.question}
          </Typography>

          <FormControl component="fieldset" disabled={submitted || isTimeout}>
            <RadioGroup value={answer} onChange={(e) => setAnswer(e.target.value)}>
              {content.options.map((opt, i) => {
                let bg = 'transparent';
                let border = '#e0e0e0';

                if (submitted || isTimeout) {
                  if (opt.correct) {
                    bg = '#e8f5e9';
                    border = '#4caf50';
                  } else if (opt.id === answer && !opt.correct) {
                    bg = '#ffebee';
                    border = '#e94560';
                  }
                }

                return (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.id}
                    control={<Radio />}
                    label={opt.text}
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: bg,
                      border: `2px solid ${border}`,
                      transition: 'all 0.3s',
                      '&:hover': !submitted && !isTimeout ? { borderColor: '#1a1a2e', bgcolor: '#f5f5f5' } : {},
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {isTimeout && !submitted && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          ¡Se acabó el tiempo! La respuesta correcta se muestra en verde.
        </Alert>
      )}

      {submitted && (
        <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 2 }}>
          {isCorrect
            ? `¡Correcto! +${70 + Math.round((timeLeft / timeLimitSeconds) * 30)} puntos`
            : 'Incorrecto. Revisa la respuesta correcta marcada en verde.'}
        </Alert>
      )}

      {!submitted && !isTimeout && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<StartIcon />}
          onClick={handleSubmit}
          disabled={!answer}
          sx={{ mt: 3, bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' } }}
        >
          Responder
        </Button>
      )}

      {(submitted || isTimeout) && (
        <Button
          variant="outlined"
          size="large"
          fullWidth
          disabled
          sx={{ mt: 2 }}
        >
          {submitted ? 'Continuando...' : 'Tiempo agotado'}
        </Button>
      )}
    </Box>
  );
}
