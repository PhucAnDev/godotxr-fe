import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

if (!window.location.hash && window.location.pathname !== '/') {
  const target = `/#${window.location.pathname}${window.location.search}`;
  window.location.replace(target);
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
