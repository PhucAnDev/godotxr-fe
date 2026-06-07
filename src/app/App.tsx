import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
