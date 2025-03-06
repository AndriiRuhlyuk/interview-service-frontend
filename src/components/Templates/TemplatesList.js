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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function TemplatesList() {
  const navigate = useNavigate();
  
  // Стан для списку шаблонів
  const [templates, setTemplates] = useState([]);
  
  // Стан для пошуку
  const [searchQuery, setSearchQuery] = useState('');
  
  // Стан для модального вікна клонування шаблону
  const [openCloneDialog, setOpenCloneDialog] = useState(false);
  const [templateToClone, setTemplateToClone] = useState(null);
  const [cloneData, setCloneData] = useState({ name: '', position: '' });
  
  // Стан для пагінації
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Отримання списку шаблонів при завантаженні компонента
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Отримання шаблонів
  const fetchTemplates = async () => {
    try {
      const params = {};
      if (searchQuery) {
        params.position = searchQuery;
      }
      
      const response = await api.get('/api/templates', { params });
      setTemplates(response.data);
    } catch (error) {
      console.error('Помилка при отриманні списку шаблонів:', error);
    }
  };
  
  // Обробка зміни значення пошуку
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Обробка кнопки пошуку
  const handleSearch = () => {
    fetchTemplates();
  };
  
  // Обробка кнопки перехід до редагування шаблону
  const handleEditTemplate = (templateId) => {
    navigate(`/templates/${templateId}`);
  };
  
  // Обробка кнопки створення нового шаблону
  const handleAddTemplate = () => {
    navigate('/templates/new');
  };
  
  // Обробка кнопки клонування шаблону
  const handleCloneButton = (template) => {
    setTemplateToClone(template);
    setCloneData({
      name: `Копія ${template.name}`,
      position: template.position,
    });
    setOpenCloneDialog(true);
  };
  
  // Обробка клонування шаблону
  const handleCloneTemplate = async () => {
    try {
      await api.post(`/api/templates/${templateToClone.id}/clone`, cloneData);
      setOpenCloneDialog(false);
      fetchTemplates();
    } catch (error) {
      console.error('Помилка при клонуванні шаблону:', error);
    }
  };
  
  // Обробка видалення шаблону
  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей шаблон?')) {
      try {
        await api.delete(`/api/templates/${templateId}`);
        fetchTemplates();
      } catch (error) {
        console.error('Помилка при видаленні шаблону:', error);
      }
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
  
  // Обробка зміни даних для клонування
  const handleCloneDataChange = (event) => {
    const { name, value } = event.target;
    setCloneData({
      ...cloneData,
      [name]: value,
    });
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Шаблони форм для співбесід
      </Typography>
      
      {/* Панель пошуку та додавання */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Пошук за позицією"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch} size="small">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTemplate}
            >
              Створити шаблон
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Таблиця з шаблонами */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Назва шаблону</TableCell>
                <TableCell>Позиція</TableCell>
                <TableCell>Опис</TableCell>
                <TableCell>Створено</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.position}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Редагувати">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditTemplate(template.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Клонувати">
                        <IconButton
                          color="secondary"
                          onClick={() => handleCloneButton(template)}
                        >
                          <CloneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Не знайдено жодного шаблону
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={templates.length}
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
      
      {/* Модальне вікно для клонування шаблону */}
      <Dialog
        open={openCloneDialog}
        onClose={() => setOpenCloneDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Клонувати шаблон</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Назва нового шаблону"
                name="name"
                value={cloneData.name}
                onChange={handleCloneDataChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Позиція"
                name="position"
                value={cloneData.position}
                onChange={handleCloneDataChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloneDialog(false)}>Скасувати</Button>
          <Button
            onClick={handleCloneTemplate}
            variant="contained"
            color="primary"
            disabled={!cloneData.name || !cloneData.position}
          >
            Клонувати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TemplatesList;
