import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  AssessmentOutlined as AssessmentIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import api from '../../services/api';

function InterviewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Стани для даних співбесіди
  const [interview, setInterview] = useState(null);
  const [template, setTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  
  // Стан для оцінювання
  const [evaluation, setEvaluation] = useState({
    total_score: 0,
    passed: false,
    minimal_rate: 60,
  });
  
  // Стан для відгуку
  const [feedback, setFeedback] = useState({
    text: '',
    predefined_phrase_ids: [],
  });
  
  // Стан для списку заготовлених фраз
  const [predefinedPhrases, setPredefinedPhrases] = useState([]);
  
  // Стани для індикаторів завантаження
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Отримання даних співбесіди при завантаженні компонента
  useEffect(() => {
    fetchInterviewData();
  }, [id]);
  
  // Підрахунок загальної оцінки при зміні оцінок
  useEffect(() => {
    calculateTotalScore();
  }, [scores, questions]);
  
  // Отримання даних співбесіди
  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      
      // Отримання даних співбесіди
      const interviewResponse = await api.get(`/api/interviews/${id}`);
      setInterview(interviewResponse.data);
      
      // Отримання шаблону
      const templateId = interviewResponse.data.template_id;
      const templateResponse = await api.get(`/api/templates/${templateId}`);
      setTemplate(templateResponse.data);
      
      // Отримання питань
      const questionsPromises = templateResponse.data.questions.map(questionId => 
        api.get(`/api/questions/${questionId}`)
      );
      
      const questionsResponses = await Promise.all(questionsPromises);
      const questionsData = questionsResponses.map(response => response.data);
      setQuestions(questionsData);
      
      // Отримання оцінок
      const scoresResponse = await api.get(`/api/interviews/${id}/scores`);
      setScores(scoresResponse.data);
      
      // Отримання списку заготовлених фраз
      const phrasesResponse = await api.get('/api/interviews/phrases');
      setPredefinedPhrases(phrasesResponse.data);
      
      // Якщо вже є оцінювання, завантажуємо його
      if (interviewResponse.data.evaluations && interviewResponse.data.evaluations.length > 0) {
        const currentEvaluation = interviewResponse.data.evaluations[0];
        setEvaluation({
          total_score: currentEvaluation.total_score,
          passed: currentEvaluation.passed,
          minimal_rate: currentEvaluation.minimal_rate,
        });
      }
      
      // Якщо вже є відгук, завантажуємо його
      if (interviewResponse.data.feedback) {
        const currentFeedback = interviewResponse.data.feedback;
        setFeedback({
          text: currentFeedback.text,
          predefined_phrase_ids: currentFeedback.phrases?.map(phrase => phrase.id) || [],
        });
      }
    } catch (error) {
      console.error('Помилка при отриманні даних співбесіди:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Підрахунок загальної оцінки
  const calculateTotalScore = () => {
    if (scores.length === 0 || questions.length === 0) return;
    
    // Загальна оцінка розраховується як сума (оцінка * вага) / сума всіх ваг * 100
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    scores.forEach(score => {
      const question = questions.find(q => q.id === score.question_id);
      if (question) {
        totalWeightedScore += score.value * question.weight;
        totalWeight += question.weight;
      }
    });
    
    // Якщо немає оцінок або ваг, повертаємо 0
    if (totalWeight === 0) return;
    
    const calculatedScore = (totalWeightedScore / (totalWeight * 5)) * 100;
    
    setEvaluation(prev => ({
      ...prev,
      total_score: Math.round(calculatedScore * 10) / 10, // Округлення до 1 знаку після коми
      passed: calculatedScore >= prev.minimal_rate,
    }));
  };
  
  // Обробка зміни оцінювання
  const handleEvaluationChange = (name, value) => {
    setEvaluation({
      ...evaluation,
      [name]: value,
    });
    
    // Якщо змінюється мінімальний бал, то перераховуємо чи пройшов кандидат
    if (name === 'minimal_rate') {
      setEvaluation(prev => ({
        ...prev,
        [name]: value,
        passed: prev.total_score >= value,
      }));
    }
  };
  
  // Обробка зміни відгуку
  const handleFeedbackChange = (event) => {
    setFeedback({
      ...feedback,
      text: event.target.value,
    });
  };
  
  // Обробка зміни вибраних заготовлених фраз
  const handlePredefinedPhrasesChange = (event, newValues) => {
    setFeedback({
      ...feedback,
      predefined_phrase_ids: newValues.map(phrase => phrase.id),
    });
  };
  
  // Обробка збереження оцінювання
  const handleSaveEvaluation = async () => {
    try {
      setSaving(true);
      
      // Збереження оцінювання
      await api.post(`/api/interviews/${id}/evaluations`, {
        total_score: evaluation.total_score,
        passed: evaluation.passed,
        minimal_rate: evaluation.minimal_rate,
      });
      
      // Збереження відгуку, якщо він заповнений
      if (feedback.text) {
        await api.post(`/api/interviews/${id}/feedback`, feedback);
      }
      
      alert('Оцінювання збережено успішно');
      navigate('/interviews');
    } catch (error) {
      console.error('Помилка при збереженні оцінювання:', error);
      alert('Помилка при збереженні оцінювання');
    } finally {
      setSaving(false);
    }
  };
  
  // Підготовка даних для графіка
  const prepareChartData = () => {
    const totalPercentage = evaluation.total_score;
    const remainingPercentage = 100 - totalPercentage;
    
    return [
      { name: 'Оцінка', value: totalPercentage },
      { name: 'Залишок', value: remainingPercentage },
    ];
  };
  
  // Кольори для графіка залежно від проходження мінімального балу
  const getChartColors = () => {
    return evaluation.passed
      ? ['#4caf50', '#f5f5f5'] // зелений для проходження
      : ['#f44336', '#f5f5f5']; // червоний для непроходження
  };
  
  // Форматування дати
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Якщо дані ще завантажуються
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Якщо дані співбесіди не знайдено
  if (!interview || !template) {
    return (
      <Box>
        <Typography variant="h5" color="error" gutterBottom>
          Помилка: Форму співбесіди не знайдено
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/interviews')}
        >
          Повернутися до списку співбесід
        </Button>
      </Box>
    );
  }
  
  // Перевірка на наявність оцінок
  const hasAllScores = questions.every(question => 
    scores.some(score => score.question_id === question.id)
  );
  
  const chartData = prepareChartData();
  const chartColors = getChartColors();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/interviews/${id}`)}
          sx={{ mr: 2 }}
        >
          Назад до співбесіди
        </Button>
        <Typography variant="h4" component="h1">
          Оцінювання співбесіди
        </Typography>
      </Box>
      
      {/* Інформація про співбесіду */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Інформація про кандидата
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Кандидат:</strong> {interview.candidate_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Позиція:</strong> {interview.position}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Дата співбесіди:</strong> {formatDate(interview.interview_date)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Загальна інформація
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Кількість питань:</strong> {questions.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Оцінено питань:</strong> {scores.length} з {questions.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Шаблон:</strong> {template.name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {!hasAllScores && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Увага! Ще не всі питання оцінені. Для коректного оцінювання необхідно оцінити всі питання.
        </Alert>
      )}
      
      {/* Загальне оцінювання */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Загальна оцінка
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="h4" align="center" gutterBottom>
                {evaluation.total_score}%
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chip
                  label={evaluation.passed ? 'Пройшов' : 'Не пройшов'}
                  color={evaluation.passed ? 'success' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Налаштування оцінювання
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Мінімальний бал для проходження (%)"
                    type="number"
                    value={evaluation.minimal_rate}
                    onChange={(e) => handleEvaluationChange('minimal_rate', parseFloat(e.target.value))}
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={evaluation.passed}
                        onChange={(e) => handleEvaluationChange('passed', e.target.checked)}
                        color={evaluation.passed ? 'success' : 'error'}
                      />
                    }
                    label={`Результат: ${evaluation.passed ? 'Пройшов' : 'Не пройшов'}`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    За замовчуванням статус проходження визначається на основі мінімального балу,
                    але ви можете змінити його вручну, якщо вважаєте за потрібне.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Список оцінок */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Детальні оцінки
        </Typography>
        <List>
          {questions.map((question) => {
            const score = scores.find(s => s.question_id === question.id);
            const hasScore = !!score;
            
            return (
              <React.Fragment key={question.id}>
                <ListItem>
                  <ListItemText
                    primary={question.text}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          <strong>Вага:</strong> {question.weight}
                        </Typography>
                        {score && (
                          <>
                            <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                              <strong>Оцінка:</strong> {score.value} з 5
                            </Typography>
                            {score.comment && (
                              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                <strong>Коментар:</strong> {score.comment}
                              </Typography>
                            )}
                          </>
                        )}
                      </>
                    }
                  />
                  {!hasScore && (
                    <Chip label="Не оцінено" color="warning" />
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
      
      {/* Відгук */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Відгук про кандидата
        </Typography>
        <TextField
          label="Відгук"
          multiline
          rows={6}
          value={feedback.text}
          onChange={handleFeedbackChange}
          fullWidth
          sx={{ mb: 3 }}
          placeholder="Напишіть загальний відгук про кандидата та його знання..."
        />
        
        <Typography variant="subtitle1" gutterBottom>
          Заготовлені фрази
        </Typography>
        <Autocomplete
          multiple
          options={predefinedPhrases}
          getOptionLabel={(option) => option.text}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={predefinedPhrases.filter(phrase => feedback.predefined_phrase_ids.includes(phrase.id))}
          onChange={handlePredefinedPhrasesChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Виберіть заготовлені фрази"
              placeholder="Фрази"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.text}
                {...getTagProps({ index })}
                color={option.category === 'positive' ? 'success' : option.category === 'negative' ? 'error' : 'default'}
              />
            ))
          }
        />
      </Paper>
      
      {/* Кнопка збереження */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveEvaluation}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти оцінювання'}
        </Button>
      </Box>
    </Box>
  );
}

export default InterviewEvaluation;
