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
  Rating,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Comment as CommentIcon,
  AssessmentOutlined as AssessmentIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interview-tabpanel-${index}`}
      aria-labelledby={`interview-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function InterviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Стани для даних співбесіди
  const [interview, setInterview] = useState(null);
  const [template, setTemplate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  
  // Стан для вкладок
  const [tabValue, setTabValue] = useState(0);
  
  // Стан для збереження
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Отримання даних співбесіди при завантаженні компонента
  useEffect(() => {
    fetchInterviewData();
  }, [id]);
  
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
      
      // Отримання оцінок (якщо вони є)
      const scoresResponse = await api.get(`/api/interviews/${id}/scores`);
      const scoresData = {};
      const commentsData = {};
      
      scoresResponse.data.forEach(score => {
        scoresData[score.question_id] = score.value;
        commentsData[score.question_id] = score.comment || '';
      });
      
      setScores(scoresData);
      setComments(commentsData);
    } catch (error) {
      console.error('Помилка при отриманні даних співбесіди:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка зміни значення оцінки
  const handleScoreChange = (questionId, value) => {
    setScores({
      ...scores,
      [questionId]: value,
    });
  };
  
  // Обробка зміни коментаря
  const handleCommentChange = (questionId, value) => {
    setComments({
      ...comments,
      [questionId]: value,
    });
  };
  
  // Обробка зміни вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Обробка збереження оцінок
  const handleSaveScores = async () => {
    try {
      setSaving(true);
      
      // Отримання ID інтерв'юера (припускаємо, що перший в списку)
      const interviewerId = interview.interviewers[0]?.id;
      
      if (!interviewerId) {
        alert('Помилка: не знайдено інтервюера для збереження оцінок');
        return;
      }
      
      // Створення оцінок для кожного питання
      const scorePromises = Object.entries(scores).map(([questionId, value]) => {
        const scoreData = {
          question_id: parseInt(questionId),
          value: parseFloat(value),
          comment: comments[questionId] || '',
          interviewer_id: interviewerId,
        };
        
        return api.post(`/api/interviews/${id}/scores`, scoreData);
      });
      
      await Promise.all(scorePromises);
      
      alert('Оцінки збережено успішно');
    } catch (error) {
      console.error('Помилка при збереженні оцінок:', error);
      alert('Помилка при збереженні оцінок');
    } finally {
      setSaving(false);
    }
  };
  
  // Обробка переходу до оцінювання
  const handleGoToEvaluation = () => {
    navigate(`/interviews/${id}/evaluate`);
  };
  
  // Групування питань за категоріями
  const groupQuestionsByCategory = () => {
    const groups = {};
    
    questions.forEach(question => {
      const groupName = question.group_id ? `Група ${question.group_id}` : 'Загальні питання';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(question);
    });
    
    return groups;
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
  
  // Рендеринг списку інтерв'юерів
  const renderInterviewers = (interviewers) => {
    return interviewers.map(interviewer => (
      <Chip
        key={interviewer.id}
        label={interviewer.name}
        sx={{ mr: 1, mb: 1 }}
      />
    ));
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
  
  const questionGroups = groupQuestionsByCategory();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/interviews')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          Проведення співбесіди
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
              Інтерв'юери
            </Typography>
            <Box>
              {renderInterviewers(interview.interviewers)}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Шаблон:</strong> {template.name}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Вкладки з питаннями */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="interview question tabs"
        >
          {Object.keys(questionGroups).map((group, index) => (
            <Tab key={index} label={group} />
          ))}
        </Tabs>
        
        {Object.entries(questionGroups).map(([group, groupQuestions], index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Typography variant="h6" gutterBottom>
              {group} ({groupQuestions.length} питань)
            </Typography>
            <List>
              {groupQuestions.map((question) => (
                <React.Fragment key={question.id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}>
                            {question.text}
                          </Typography>
                          <Chip
                            label={`Вага: ${question.weight}`}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        question.docs_reference && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Документація:</strong> {question.docs_reference}
                          </Typography>
                        )
                      }
                    />
                    
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Typography component="legend">Оцінка (від 1 до 5)</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          name={`rating-${question.id}`}
                          value={parseFloat(scores[question.id]) || 0}
                          onChange={(event, newValue) => {
                            handleScoreChange(question.id, newValue);
                          }}
                          precision={0.5}
                          max={5}
                        />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          {scores[question.id] ? `${scores[question.id]} з 5` : 'Не оцінено'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        label="Коментар"
                        value={comments[question.id] || ''}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        multiline
                        rows={2}
                        fullWidth
                        variant="outlined"
                        placeholder="Напишіть коментар до відповіді кандидата..."
                      />
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        ))}
      </Paper>
      
      {/* Кнопки дій */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={handleGoToEvaluation}
        >
          Перейти до оцінювання
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveScores}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти оцінки'}
        </Button>
      </Box>
    </Box>
  );
}

export default InterviewForm;
