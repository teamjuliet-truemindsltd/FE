import Router from './lib/router';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}

