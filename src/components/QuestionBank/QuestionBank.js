import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function QuestionBank() {
  // Стан для списку питань
  const [questions, setQuestions] = useState([]);
  
  // Стан для фільтрів
  const [units, setUnits] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Стан для вибраних фільтрів
  const [filters, setFilters] = useState({
    unit_id: '',
    difficulty_id: '',
    level_id: '',
    group_id: '',
    text_search: '',
  });
  
  // Стан для модального вікна додавання/редагування питання
  const [openDialog, setOpenDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Стан для пагінації
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Отримання списку питань при завантаженні компонента
  useEffect(() => {
    fetchQuestions();
    fetchFilters();
  }, []);
  
  // Отримання питань
  const fetchQuestions = async () => {
    try {
      // Формування параметрів запиту з фільтрами
      const params = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
      );
      
      const response = await api.get('/api/questions', { params });
      setQuestions(response.data);
    } catch (error) {
      console.error('Помилка при отриманні списку питань:', error);
    }
  };
  
  // Отримання даних для фільтрів
  const fetchFilters = async () => {
    try {
      const [unitsResponse, difficultiesResponse, levelsResponse, groupsResponse] = await Promise.all([
        api.get('/api/questions/units'),
        api.get('/api/questions/difficulties'),
        api.get('/api/questions/seniority-levels'),
        api.get('/api/questions/groups'),
      ]);
      
      setUnits(unitsResponse.data);
      setDifficulties(difficultiesResponse.data);
      setLevels(levelsResponse.data);
      setGroups(groupsResponse.data);
    } catch (error) {
      console.error('Помилка при отриманні фільтрів:', error);
    }
  };
  
  // Обробка зміни значення фільтра
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  // Обробка кнопки застосування фільтрів
  const handleApplyFilters = () => {
    fetchQuestions();
  };
  
  // Обробка кнопки скидання фільтрів
  const handleResetFilters = () => {
    setFilters({
      unit_id: '',
      difficulty_id: '',
      level_id: '',
      group_id: '',
      text_search: '',
    });
  };
  
  // Обробка відкриття модального вікна для створення нового питання
  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setOpenDialog(true);
  };
  
  // Обробка відкриття модального вікна для редагування питання
  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setOpenDialog(true);
  };
  
  // Обробка видалення питання
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Ви впевнені, що хочете видалити це питання?')) {
      try {
        await api.delete(`/api/questions/${questionId}`);
        fetchQuestions();
      } catch (error) {
        console.error('Помилка при видаленні питання:', error);
      }
    }
  };
  
  // Обробка збереження питання
  const handleSaveQuestion = async (formData) => {
    try {
      if (currentQuestion) {
        // Редагування існуючого питання
        await api.put(`/api/questions/${currentQuestion.id}`, formData);
      } else {
        // Створення нового питання
        await api.post('/api/questions', formData);
      }
      setOpenDialog(false);
      fetchQuestions();
    } catch (error) {
      console.error('Помилка при збереженні питання:', error);
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
  
  // Форма для модального вікна
  const QuestionForm = () => {
    const [formData, setFormData] = useState({
      text: currentQuestion?.text || '',
      weight: currentQuestion?.weight || 1.0,
      docs_reference: currentQuestion?.docs_reference || '',
      priority: currentQuestion?.priority || 1,
      unit_id: currentQuestion?.unit_id || '',
      difficulty_id: currentQuestion?.difficulty_id || '',
      level_id: currentQuestion?.level_id || '',
      group_id: currentQuestion?.group_id || '',
    });
    
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
    
    const handleSubmit = (event) => {
      event.preventDefault();
      handleSaveQuestion(formData);
    };
    
    return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Текст питання"
              name="text"
              value={formData.text}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Вага питання"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: 0.1, min: 0.1, max: 10 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Пріоритет"
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Посилання на документацію"
              name="docs_reference"
              value={formData.docs_reference}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Підрозділ/Проект</InputLabel>
              <Select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChange}
                label="Підрозділ/Проект"
              >
                <MenuItem value="">Не вибрано</MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Складність</InputLabel>
              <Select
                name="difficulty_id"
                value={formData.difficulty_id}
                onChange={handleChange}
                label="Складність"
              >
                <MenuItem value="">Не вибрано</MenuItem>
                {difficulties.map((difficulty) => (
                  <MenuItem key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Рівень</InputLabel>
              <Select
                name="level_id"
                value={formData.level_id}
                onChange={handleChange}
                label="Рівень"
              >
                <MenuItem value="">Не вибрано</MenuItem>
                {levels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Група</InputLabel>
              <Select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                label="Група"
              >
                <MenuItem value="">Не вибрано</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name} ({group.subject})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Скасувати</Button>
          <Button type="submit" variant="contained" color="primary">
            Зберегти
          </Button>
        </DialogActions>
      </form>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Банк питань для співбесід
      </Typography>
      
      {/* Фільтри */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Фільтри
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Підрозділ/Проект</InputLabel>
              <Select
                name="unit_id"
                value={filters.unit_id}
                onChange={handleFilterChange}
                label="Підрозділ/Проект"
              >
                <MenuItem value="">Всі</MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Складність</InputLabel>
              <Select
                name="difficulty_id"
                value={filters.difficulty_id}
                onChange={handleFilterChange}
                label="Складність"
              >
                <MenuItem value="">Всі</MenuItem>
                {difficulties.map((difficulty) => (
                  <MenuItem key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Рівень</InputLabel>
              <Select
                name="level_id"
                value={filters.level_id}
                onChange={handleFilterChange}
                label="Рівень"
              >
                <MenuItem value="">Всі</MenuItem>
                {levels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Група</InputLabel>
              <Select
                name="group_id"
                value={filters.group_id}
                onChange={handleFilterChange}
                label="Група"
              >
                <MenuItem value="">Всі</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="text_search"
              label="Пошук за текстом"
              value={filters.text_search}
              onChange={handleFilterChange}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleApplyFilters} size="small">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
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
      
      {/* Кнопка додавання нового питання */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
        >
          Додати питання
        </Button>
      </Box>
      
      {/* Таблиця з питаннями */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Текст питання</TableCell>
                <TableCell>Складність</TableCell>
                <TableCell>Рівень</TableCell>
                <TableCell>Вага</TableCell>
                <TableCell>Група</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.text}</TableCell>
                    <TableCell>
                      {difficulties.find((d) => d.id === question.difficulty_id)?.name || ''}
                    </TableCell>
                    <TableCell>
                      {levels.find((l) => l.id === question.level_id)?.name || ''}
                    </TableCell>
                    <TableCell>{question.weight}</TableCell>
                    <TableCell>
                      {groups.find((g) => g.id === question.group_id)?.name || ''}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Редагувати">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Не знайдено жодного питання
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={questions.length}
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
      
      {/* Модальне вікно для створення/редагування питання */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentQuestion ? 'Редагувати питання' : 'Додати нове питання'}
        </DialogTitle>
        <DialogContent>
          <QuestionForm />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default QuestionBank;
