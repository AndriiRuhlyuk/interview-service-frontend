import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';

function Dashboard() {
  const navigate = useNavigate();
  
  // Стани для даних дашборду
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    passedInterviews: 0,
    failedInterviews: 0,
    averageScore: 0,
    totalCandidates: 0,
    totalQuestions: 0,
    totalTemplates: 0,
    positionStats: [],
    recentInterviews: [],
  });
  
  // Кольори для графіків
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Отримання даних при завантаженні компонента
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Симуляція отримання даних для дашборду
  // В реальному проекті тут був би запит до API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Тут мав би бути запит до API для отримання статистики
      // Для демонстрації використовуємо тестові дані
      
      const testData = {
        totalInterviews: 45,
        passedInterviews: 28,
        failedInterviews: 17,
        averageScore: 72.5,
        totalCandidates: 42,
        totalQuestions: 250,
        totalTemplates: 15,
        positionStats: [
          { position: 'React Engineer', count: 15, passRate: 75 },
          { position: 'Node.js Developer', count: 12, passRate: 66 },
          { position: 'Full Stack Developer', count: 8, passRate: 62 },
          { position: 'UI/UX Designer', count: 5, passRate: 80 },
          { position: 'QA Engineer', count: 5, passRate: 40 },
        ],
        recentInterviews: [
          { id: 101, candidate_name: 'Олег Петренко', position: 'Senior React Engineer', status: 'passed', score: 85, date: '2023-09-25T14:30:00Z' },
          { id: 102, candidate_name: 'Марія Іваненко', position: 'Middle Node.js Developer', status: 'failed', score: 55, date: '2023-09-24T10:00:00Z' },
          { id: 103, candidate_name: 'Ігор Сидоренко', position: 'Senior Full Stack Developer', status: 'passed', score: 92, date: '2023-09-23T15:45:00Z' },
          { id: 104, candidate_name: 'Тетяна Коваленко', position: 'Middle QA Engineer', status: 'passed', score: 78, date: '2023-09-22T11:15:00Z' },
          { id: 105, candidate_name: 'Андрій Мельник', position: 'Junior React Engineer', status: 'failed', score: 48, date: '2023-09-21T13:30:00Z' },
        ],
      };
      
      // В реальному проекті тут був би запит до API
      // const response = await api.get('/api/dashboard/stats');
      // setStats(response.data);
      
      setStats(testData);
    } catch (error) {
      console.error('Помилка при отриманні даних для дашборду:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Підготовка даних для кругової діаграми статусів співбесід
  const prepareStatusData = () => {
    return [
      { name: 'Пройшли', value: stats.passedInterviews },
      { name: 'Не пройшли', value: stats.failedInterviews },
    ];
  };
  
  // Підготовка даних для стовпчикової діаграми позицій
  const preparePositionData = () => {
    return stats.positionStats.map(item => ({
      position: item.position,
      count: item.count,
      passRate: item.passRate,
    }));
  };
  
  // Форматування дати
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const statusData = prepareStatusData();
  const positionData = preparePositionData();
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Дашборд
      </Typography>
      
      {/* Основні показники */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Всього співбесід
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats.totalInterviews}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Середній бал
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats.averageScore}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Кандидатів
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats.totalCandidates}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Банк питань
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestionIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats.totalQuestions}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Графіки */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Результати співбесід
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4caf50' : '#f44336'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статистика за позиціями
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={positionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Кількість співбесід" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="passRate" name="% пройшли" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Останні співбесіди */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Останні співбесіди
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/interviews')}
          >
            Всі співбесіди
          </Button>
        </Box>
        <List>
          {stats.recentInterviews.map((interview, index) => (
            <React.Fragment key={interview.id}>
              <ListItem button onClick={() => navigate(`/interviews/${interview.id}`)}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {interview.candidate_name} - {interview.position}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {formatDate(interview.date)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            color: interview.status === 'passed' ? 'success.main' : 'error.main',
                            fontWeight: 'bold',
                            mr: 2,
                          }}
                        >
                          {interview.status === 'passed' ? 'Пройшов' : 'Не пройшов'}
                        </Typography>
                        <Typography variant="body2" component="span">
                          Оцінка: {interview.score}%
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </ListItem>
              {index < stats.recentInterviews.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      {/* Швидкі посилання */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }} onClick={() => navigate('/interviews/new')} style={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Нова співбесіда
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Створити нову форму співбесіди для кандидата
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }} onClick={() => navigate('/templates/new')} style={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Новий шаблон
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Створити новий шаблон форми для співбесіди
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }} onClick={() => navigate('/questions')} style={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Банк питань
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Переглянути та редагувати банк питань для співбесід
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }} onClick={() => navigate('/templates')} style={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Шаблони
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Переглянути всі доступні шаблони для співбесід
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
