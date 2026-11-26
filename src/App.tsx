import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TransferListPage from './pages/TransferListPage';
import TransferPage from './pages/TransferPage';

function Layout() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Outlet />
      </div>
    </>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La ruta que buscas no existe.</p>
      <Link to="/" className="btn mt-4 inline-flex h-10 items-center px-4">
        Volver al inicio
      </Link>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/transfers" element={<TransferListPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
