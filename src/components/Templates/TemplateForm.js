import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function TemplateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  
  // Стан для форми шаблону
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    position: '',
  });
  
  // Стан для списку питань в шаблоні
  const [templateQuestions, setTemplateQuestions] = useState([]);
  
  // Стан для банку питань
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  // Стан для фільтрів
  const [units, setUnits] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Стан для модального вікна додавання питань
  const [openQuestionsDialog, setOpenQuestionsDialog] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  // Стан для фільтрації питань
  const [questionFilters, setQuestionFilters] = useState({
    unit_id: '',
    difficulty_id: '',
    level_id: '',
    group_id: '',
    text_search: '',
  });
  
  // Стан для індикатора завантаження
  const [loading, setLoading] = useState(false);
  
  // Отримання даних шаблону при завантаженні компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Отримання даних для фільтрів
        await fetchFilters();
        
        // Отримання всіх питань
        const questionsResponse = await api.get('/api/questions');
        setAllQuestions(questionsResponse.data);
        setFilteredQuestions(questionsResponse.data);
        
        // Якщо редагуємо існуючий шаблон
        if (isEditing) {
          const templateResponse = await api.get(`/api/templates/${id}`);
          setTemplate({
            name: templateResponse.data.name,
            description: templateResponse.data.description,
            position: templateResponse.data.position,
          });
          
          // Отримання питань шаблону
          const templateQuestionsIds = templateResponse.data.questions;
          const templateQuestionsData = questionsResponse.data.filter(q => 
            templateQuestionsIds.includes(q.id)
          );
          setTemplateQuestions(templateQuestionsData);
        }
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
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
  
  // Обробка зміни значень форми
  const handleTemplateChange = (event) => {
    const { name, value } = event.target;
    setTemplate({
      ...template,
      [name]: value,
    });
  };
  
  // Обробка збереження шаблону
  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      
      let templateId;
      
      // Створення або оновлення шаблону
      if (isEditing) {
        await api.put(`/api/templates/${id}`, template);
        templateId = id;
      } else {
        const response = await api.post('/api/templates', template);
        templateId = response.data.id;
      }
      
      // Додавання питань до шаблону
      const questionIds = templateQuestions.map(q => q.id);
      await api.post(`/api/templates/${templateId}/questions`, {
        template_id: templateId,
        questions: questionIds,
      });
      
      navigate('/templates');
    } catch (error) {
      console.error('Помилка при збереженні шаблону:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка видалення питання з шаблону
  const handleRemoveQuestion = (questionId) => {
    setTemplateQuestions(templateQuestions.filter(q => q.id !== questionId));
  };
  
  // Обробка відкриття модального вікна додавання питань
  const handleOpenAddQuestions = () => {
    // Скидання вибраних питань
    setSelectedQuestions([]);
    setOpenQuestionsDialog(true);
  };
  
  // Обробка зміни вибраних питань
  const handleToggleQuestion = (question) => {
    const currentIndex = selectedQuestions.findIndex(q => q.id === question.id);
    const newSelected = [...selectedQuestions];
    
    if (currentIndex === -1) {
      newSelected.push(question);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    
    setSelectedQuestions(newSelected);
  };
  
  // Обробка додавання вибраних питань до шаблону
  const handleAddSelectedQuestions = () => {
    // Додаємо питання, які ще не додані до шаблону
    const existingIds = templateQuestions.map(q => q.id);
    const newQuestions = selectedQuestions.filter(q => !existingIds.includes(q.id));
    
    setTemplateQuestions([...templateQuestions, ...newQuestions]);
    setOpenQuestionsDialog(false);
  };
  
  // Обробка зміни фільтрів для питань
  const handleQuestionFilterChange = (event) => {
    const { name, value } = event.target;
    setQuestionFilters({
      ...questionFilters,
      [name]: value,
    });
  };
  
  // Обробка застосування фільтрів для питань
  const handleApplyQuestionFilters = () => {
    const filtered = allQuestions.filter(question => {
      // Перевіряємо кожний фільтр
      if (questionFilters.unit_id && question.unit_id !== parseInt(questionFilters.unit_id)) {
        return false;
      }
      if (questionFilters.difficulty_id && question.difficulty_id !== parseInt(questionFilters.difficulty_id)) {
        return false;
      }
      if (questionFilters.level_id && question.level_id !== parseInt(questionFilters.level_id)) {
        return false;
      }
      if (questionFilters.group_id && question.group_id !== parseInt(questionFilters.group_id)) {
        return false;
      }
      if (questionFilters.text_search && !question.text.toLowerCase().includes(questionFilters.text_search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    setFilteredQuestions(filtered);
  };
  
  // Обробка скидання фільтрів для питань
  const handleResetQuestionFilters = () => {
    setQuestionFilters({
      unit_id: '',
      difficulty_id: '',
      level_id: '',
      group_id: '',
      text_search: '',
    });
    setFilteredQuestions(allQuestions);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/templates')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Редагування шаблону' : 'Створення нового шаблону'}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Форма з основними даними шаблону */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Основна інформація
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Назва шаблону"
                  name="name"
                  value={template.name}
                  onChange={handleTemplateChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Позиція"
                  name="position"
                  value={template.position}
                  onChange={handleTemplateChange}
                  fullWidth
                  required
                  helperText="Наприклад: Senior React Engineer"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Опис шаблону"
                  name="description"
                  value={template.description}
                  onChange={handleTemplateChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Список питань в шаблоні */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Питання в шаблоні ({templateQuestions.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddQuestions}
              >
                Додати питання
              </Button>
            </Box>
            
            {templateQuestions.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ my: 3, textAlign: 'center' }}>
                У цьому шаблоні ще немає питань. Додайте питання для початку роботи.
              </Typography>
            ) : (
              <List>
                {templateQuestions.map((question) => (
                  <React.Fragment key={question.id}>
                    <ListItem>
                      <ListItemText
                        primary={question.text}
                        secondary={
                          <>
                            <Chip
                              label={difficulties.find(d => d.id === question.difficulty_id)?.name || 'Невідома складність'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={levels.find(l => l.id === question.level_id)?.name || 'Невідомий рівень'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={`Вага: ${question.weight}`}
                              size="small"
                            />
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
          
          {/* Кнопка збереження */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveTemplate}
              disabled={!template.name || !template.position}
            >
              Зберегти шаблон
            </Button>
          </Box>
          
          {/* Модальне вікно для додавання питань */}
          <Dialog
            open={openQuestionsDialog}
            onClose={() => setOpenQuestionsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Додати питання до шаблону</DialogTitle>
            <DialogContent>
              {/* Фільтри для питань */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Фільтри
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Підрозділ/Проект</InputLabel>
                      <Select
                        name="unit_id"
                        value={questionFilters.unit_id}
                        onChange={handleQuestionFilterChange}
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
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Складність</InputLabel>
                      <Select
                        name="difficulty_id"
                        value={questionFilters.difficulty_id}
                        onChange={handleQuestionFilterChange}
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
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Рівень</InputLabel>
                      <Select
                        name="level_id"
                        value={questionFilters.level_id}
                        onChange={handleQuestionFilterChange}
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
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="text_search"
                      label="Пошук за текстом"
                      value={questionFilters.text_search}
                      onChange={handleQuestionFilterChange}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={8}>
                    <Button
                      variant="outlined"
                      startIcon={<SearchIcon />}
                      onClick={handleApplyQuestionFilters}
                      sx={{ mr: 1 }}
                    >
                      Застосувати
                    </Button>
                    <Button variant="text" onClick={handleResetQuestionFilters}>
                      Скинути
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Список питань для вибору */}
              <Typography variant="subtitle1" gutterBottom>
                Виберіть питання для додавання ({selectedQuestions.length} вибрано)
              </Typography>
              <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {filteredQuestions.map((question) => {
                  const isSelected = selectedQuestions.some(q => q.id === question.id);
                  const isAlreadyInTemplate = templateQuestions.some(q => q.id === question.id);
                  
                  return (
                    <React.Fragment key={question.id}>
                      <ListItem
                        button
                        onClick={() => !isAlreadyInTemplate && handleToggleQuestion(question)}
                        selected={isSelected}
                        disabled={isAlreadyInTemplate}
                        sx={{
                          opacity: isAlreadyInTemplate ? 0.5 : 1,
                          bgcolor: isAlreadyInTemplate ? 'rgba(0, 0, 0, 0.05)' : 'inherit',
                        }}
                      >
                        <ListItemText
                          primary={question.text}
                          secondary={
                            <>
                              <Chip
                                label={difficulties.find(d => d.id === question.difficulty_id)?.name || 'Невідома складність'}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={levels.find(l => l.id === question.level_id)?.name || 'Невідомий рівень'}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={`Вага: ${question.weight}`}
                                size="small"
                              />
                              {isAlreadyInTemplate && (
                                <Chip
                                  label="Вже в шаблоні"
                                  color="primary"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                    Не знайдено жодного питання за вказаними критеріями
                  </Typography>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenQuestionsDialog(false)}>Скасувати</Button>
              <Button
                onClick={handleAddSelectedQuestions}
                variant="contained"
                color="primary"
                disabled={selectedQuestions.length === 0}
              >
                Додати вибрані ({selectedQuestions.length})
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default TemplateForm;
