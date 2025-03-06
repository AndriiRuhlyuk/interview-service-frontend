import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import api from '../../services/api';

function InterviewsList() {
  const navigate = useNavigate();
  
  // Стан для списку форм співбесід
  const [interviews, setInterviews] = useState([]);
  
  // Стан для фільтрів
  const [filters, setFilters] = useState({
    candidate_id: '',
    position: '',
    start_date: null,
    end_date: null,
  });
  
  // Стан для модального вікна створення нової форми
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  
  // Стан для форми нової співбесіди
  const [newInterview, setNewInterview] = useState({
    candidate_id: '',
    candidate_name: '',
    position: '',
    interview_date: new Date(),
    template_id: '',
    interviewer_ids: [],
  });
  
  // Стан для пагінації
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Стан для індикатора завантаження
  const [loading, setLoading] = useState(false);
  
  // Отримання списку форм співбесід при завантаженні компонента
  useEffect(() => {
    fetchInterviews();
  }, []);
  
  // Отримання списку форм співбесід
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      // Формування параметрів запиту з фільтрами
      const params = {};
      if (filters.candidate_id) params.candidate_id = filters.candidate_id;
      if (filters.position) params.position = filters.position;
      if (filters.start_date) params.start_date = filters.start_date.toISOString();
      if (filters.end_date) params.end_date = filters.end_date.toISOString();
      
      const response = await api.get('/api/interviews', { params });
      setInterviews(response.data);
    } catch (error) {
      console.error('Помилка при отриманні списку співбесід:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Отримання даних для створення нової форми
  const fetchFormData = async () => {
    try {
      setLoading(true);
      
      // Отримання списку шаблонів, кандидатів та інтерв'юерів
      const [templatesResponse, candidatesResponse, interviewersResponse] = await Promise.all([
        api.get('/api/templates'),
        api.get('/api/integrations/peopleforce/candidates'),
        api.get('/api/interviews/interviewers'),
      ]);
      
      setTemplates(templatesResponse.data);
      setCandidates(candidatesResponse.data);
      setInterviewers(interviewersResponse.data);
    } catch (error) {
      console.error('Помилка при отриманні даних для форми:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка зміни значення фільтра
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  // Обробка кнопки застосування фільтрів
  const handleApplyFilters = () => {
    fetchInterviews();
  };
  
  // Обробка кнопки скидання фільтрів
  const handleResetFilters = () => {
    setFilters({
      candidate_id: '',
      position: '',
      start_date: null,
      end_date: null,
    });
  };
  
  // Обробка кнопки створення нової форми
  const handleNewInterview = async () => {
    await fetchFormData();
    setOpenNewDialog(true);
  };
  
  // Обробка зміни значень форми нової співбесіди
  const handleNewInterviewChange = (name, value) => {
    setNewInterview({
      ...newInterview,
      [name]: value,
    });
    
    // Якщо змінився кандидат, оновлюємо його ім'я
    if (name === 'candidate_id') {
      const selectedCandidate = candidates.find(c => c.id === value);
      if (selectedCandidate) {
        setNewInterview({
          ...newInterview,
          candidate_id: value,
          candidate_name: selectedCandidate.full_name,
        });
      }
    }
    
    // Якщо змінився шаблон, оновлюємо позицію
    if (name === 'template_id') {
      const selectedTemplate = templates.find(t => t.id === value);
      if (selectedTemplate) {
        setNewInterview({
          ...newInterview,
          template_id: value,
          position: selectedTemplate.position,
        });
      }
    }
  };
  
  // Обробка створення нової форми співбесіди
  const handleCreateInterview = async () => {
    try {
      setLoading(true);
      
      // Створення нової форми співбесіди
      await api.post('/api/interviews', newInterview);
      
      // Скидання форми та закриття модального вікна
      setNewInterview({
        candidate_id: '',
        candidate_name: '',
        position: '',
        interview_date: new Date(),
        template_id: '',
        interviewer_ids: [],
      });
      setOpenNewDialog(false);
      
      // Оновлення списку співбесід
      fetchInterviews();
    } catch (error) {
      console.error('Помилка при створенні нової співбесіди:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка кнопки переходу до форми співбесіди
  const handleGoToInterview = (interviewId) => {
    navigate(`/interviews/${interviewId}`);
  };
  
  // Обробка кнопки переходу до форми оцінювання
  const handleGoToEvaluation = (interviewId) => {
    navigate(`/interviews/${interviewId}/evaluate`);
  };
  
  // Обробка видалення форми співбесіди
  const handleDeleteInterview = async (interviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю форму співбесіди?')) {
      try {
        await api.delete(`/api/interviews/${interviewId}`);
        fetchInterviews();
      } catch (error) {
        console.error('Помилка при видаленні форми співбесіди:', error);
      }
    }
  };
  
  // Обробка синхронізації з PeopleForce
  const handleSyncWithPeopleForce = async (interviewId) => {
    try {
      setLoading(true);
      await api.post(`/api/integrations/peopleforce/${interviewId}/sync`);
      alert('Дані успішно синхронізовано з PeopleForce');
    } catch (error) {
      console.error('Помилка при синхронізації з PeopleForce:', error);
      alert('Помилка при синхронізації з PeopleForce');
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка зміни сторінки
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Обробка зміни кількості рядків на сторінці
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Форми співбесід
      </Typography>
      
      {/* Фільтри */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Фільтри
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Позиція"
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата початку"
                value={filters.start_date}
                onChange={(date) => handleFilterChange('start_date', date)}
                renderInput={(params) => <TextField size="small" fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата кінця"
                value={filters.end_date}
                onChange={(date) => handleFilterChange('end_date', date)}
                renderInput={(params) => <TextField size="small" fullWidth {...params} />}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleApplyFilters}
              sx={{ mr: 1 }}
            >
              Застосувати
            </Button>
            <Button variant="text" onClick={handleResetFilters}>
              Скинути
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Кнопка додавання нової форми */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewInterview}
        >
          Нова співбесіда
        </Button>
      </Box>
      
      {/* Таблиця з формами співбесід */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Кандидат</TableCell>
                <TableCell>Позиція</TableCell>
                <TableCell>Дата співбесіди</TableCell>
                <TableCell>Інтерв'юери</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>{interview.candidate_name}</TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{formatDate(interview.interview_date)}</TableCell>
                    <TableCell>
                      {interview.interviewers.length > 0
                        ? interview.interviewers.map((interviewer) => (
                            <Chip
                              key={interviewer.id}
                              label={interviewer.name}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))
                        : "Не призначено"}
                    </TableCell>
                    <TableCell>
                      {interview.evaluations && interview.evaluations.length > 0 ? (
                        <Chip
                          label={interview.evaluations[0].passed ? "Пройшов" : "Не пройшов"}
                          color={interview.evaluations[0].passed ? "success" : "error"}
                          size="small"
                        />
                      ) : (
                        <Chip label="Не оцінено" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Провести співбесіду">
                        <IconButton
                          color="primary"
                          onClick={() => handleGoToInterview(interview.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Оцінити">
                        <IconButton
                          color="secondary"
                          onClick={() => handleGoToEvaluation(interview.id)}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Синхронізувати з PeopleForce">
                        <IconButton
                          color="info"
                          onClick={() => handleSyncWithPeopleForce(interview.id)}
                        >
                          <SyncIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {interviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Не знайдено жодної форми співбесіди
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={interviews.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Рядків на сторінці:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} з ${count}`
          }
        />
      </Paper>
      
      {/* Модальне вікно для створення нової форми співбесіди */}
      <Dialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Нова форма співбесіди</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Кандидат</InputLabel>
                <Select
                  value={newInterview.candidate_id}
                  onChange={(e) => handleNewInterviewChange('candidate_id', e.target.value)}
                  label="Кандидат"
                >
                  <MenuItem value="">Виберіть кандидата</MenuItem>
                  {candidates.map((candidate) => (
                    <MenuItem key={candidate.id} value={candidate.id}>
                      {candidate.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Шаблон</InputLabel>
                <Select
                  value={newInterview.template_id}
                  onChange={(e) => handleNewInterviewChange('template_id', e.target.value)}
                  label="Шаблон"
                >
                  <MenuItem value="">Виберіть шаблон</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.position})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Позиція"
                value={newInterview.position}
                onChange={(e) => handleNewInterviewChange('position', e.target.value)}
                fullWidth
                disabled={!!newInterview.template_id}
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Дата співбесіди"
                  value={newInterview.interview_date}
                  onChange={(date) => handleNewInterviewChange('interview_date', date)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Інтерв'юери</InputLabel>
                <Select
                  multiple
                  value={newInterview.interviewer_ids}
                  onChange={(e) => handleNewInterviewChange('interviewer_ids', e.target.value)}
                  label="Інтерв'юери"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const interviewer = interviewers.find(i => i.id === value);
                        return interviewer ? (
                          <Chip key={value} label={interviewer.name} />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {interviewers.map((interviewer) => (
                    <MenuItem key={interviewer.id} value={interviewer.id}>
                      {interviewer.name} ({interviewer.position})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Скасувати</Button>
          <Button
            onClick={handleCreateInterview}
            variant="contained"
            color="primary"
            disabled={
              !newInterview.candidate_id ||
              !newInterview.template_id ||
              !newInterview.position ||
              !newInterview.interview_date ||
              newInterview.interviewer_ids.length === 0
            }
          >
            Створити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InterviewsList;
