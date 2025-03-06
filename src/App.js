import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import QuestionBank from './components/QuestionBank/QuestionBank';
import TemplatesList from './components/Templates/TemplatesList';
import TemplateForm from './components/Templates/TemplateForm';
import InterviewsList from './components/InterviewForm/InterviewsList';
import InterviewForm from './components/InterviewForm/InterviewForm';
import InterviewEvaluation from './components/InterviewForm/InterviewEvaluation';

// Створення теми
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout>
          <Routes>
            {/* Головна сторінка / Дашборд */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Банк питань */}
            <Route path="/questions" element={<QuestionBank />} />
            
            {/* Шаблони */}
            <Route path="/templates" element={<TemplatesList />} />
            <Route path="/templates/new" element={<TemplateForm />} />
            <Route path="/templates/:id" element={<TemplateForm />} />
            
            {/* Форми інтерв'ю */}
            <Route path="/interviews" element={<InterviewsList />} />
            <Route path="/interviews/new" element={<InterviewForm />} />
            <Route path="/interviews/:id" element={<InterviewForm />} />
            <Route path="/interviews/:id/evaluate" element={<InterviewEvaluation />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
