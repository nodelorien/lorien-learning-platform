'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  Alert,
  Chip,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome as TokenIcon,
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { tokenize, estimateTokens, TOKEN_COLORS } from '@/lib/tokenizer';

interface TokensContent {
  prompt: string;
  optimalPrompt: string;
  expectedTokensLow: number;
  expectedTokensHigh: number;
}

export default function TokensExercise({
  content,
  timeLimitSeconds = 120,
  onSubmit,
}: {
  content: TokensContent;
  timeLimitSeconds?: number;
  onSubmit: (correct: boolean) => void;
}) {
  const [mode, setMode] = useState<'estimate' | 'colorize'>('estimate');
  const [estimate, setEstimate] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
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

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitted(true);
      setTimeout(() => onSubmitRef.current(false), 2000);
    }
  }, [timeLeft, submitted]);

  const actualTokens = useMemo(() => estimateTokens(content.prompt), [content.prompt]);
  const tokenSpans = useMemo(() => tokenize(content.prompt), [content.prompt]);
  const optimalTokens = useMemo(() => estimateTokens(content.optimalPrompt), [content.optimalPrompt]);

  const isClose = Math.abs(estimate - actualTokens) <= Math.round(actualTokens * 0.3);
  const isVeryClose = Math.abs(estimate - actualTokens) <= Math.round(actualTokens * 0.1);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onSubmit(isClose), 4000);
  };

  const handleReset = () => {
    setEstimate(30);
    setSubmitted(false);
    setMode('estimate');
  };

  const uniqueColors = useMemo(() => {
    const colors = tokenSpans.filter((t) => t.isToken).map((t) => t.color);
    return [...new Set(colors)];
  }, [tokenSpans]);

  const timerProgress = timeLimitSeconds > 0 ? (timeLeft / timeLimitSeconds) * 100 : 100;
  const isTimeout = timeLeft === 0 && !submitted;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {isTimeout ? '¡Tiempo agotado!' : `Tiempo: ${timeLeft}s`}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: timeLeft <= 10 ? 'error.main' : 'text.secondary' }}>
          {timeLeft <= 10 && !submitted ? '⏰ ¡Date prisa!' : ''}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={timerProgress}
        sx={{
          mb: 3, height: 6, borderRadius: 3,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            bgcolor: timeLeft <= 10 ? '#e94560' : '#45B7D1',
            transition: 'width 1s linear',
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          size="small"
        >
          <ToggleButton value="estimate">Estimar tokens</ToggleButton>
          <ToggleButton value="colorize">Ver tokens</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#fafafa' }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
          Prompt a analizar:
        </Typography>

        {mode === 'colorize' ? (
          <Box sx={{ lineHeight: 2.2 }}>
            {tokenSpans.map((span, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: span.isToken ? span.color : 'transparent',
                  padding: span.isToken ? '2px 4px' : '0',
                  borderRadius: '3px',
                  color: span.isToken ? '#000' : 'inherit',
                  fontWeight: span.isToken ? 500 : 400,
                  fontSize: '0.95rem',
                }}
              >
                {span.text}
              </span>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
            {content.prompt}
          </Typography>
        )}

        {mode === 'colorize' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {tokenSpans.filter((t) => t.isToken).length} tokens
            </Typography>
          </Box>
        )}
      </Paper>

      {mode === 'estimate' && !submitted && (
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            ¿Cuántos tokens crees que tiene este prompt? Ajusta el deslizador:
          </Typography>
          <Box sx={{ px: 1 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, color: '#1a1a2e' }}>
              {estimate} tokens
            </Typography>
            <Slider
              value={estimate}
              onChange={(_, v) => setEstimate(v as number)}
              min={5}
              max={300}
              step={1}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">5</Typography>
              <Typography variant="caption">300</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {submitted && (
        <Box>
          <Alert severity={isVeryClose ? 'success' : isClose ? 'warning' : 'info'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {isVeryClose
                ? '¡Increíble! Casi le atinas perfectamente.'
                : isClose
                ? '¡Bien! Estuviste cerca.'
                : `El prompt tiene ${actualTokens} tokens.`}
            </Typography>
            <Typography variant="body2">
              Tu estimación: <strong>{estimate} tokens</strong> | Tokens reales:{' '}
              <strong>{actualTokens} tokens</strong>
            </Typography>
          </Alert>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Prompt optimizado ({optimalTokens} tokens):
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {content.optimalPrompt}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={`Ahorro: ${actualTokens - optimalTokens} tokens (${Math.round(((actualTokens - optimalTokens) / actualTokens) * 100)}%)`}
                color="success"
                icon={<LightbulbIcon />}
              />
            </Box>
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Leyenda de colores por token:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {uniqueColors.map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Cada recuadro representa un token. Los prompts verbosos gastan más tokens
              innecesariamente.
            </Typography>
          </Paper>
        </Box>
      )}

      {!submitted && mode === 'estimate' && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#d63851' } }}
        >
          Verificar estimación
        </Button>
      )}

      {submitted && (
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleReset}
          sx={{ mt: 2 }}
        >
          Reintentar
        </Button>
      )}
    </Box>
  );
}
