import { Routes, Route, Navigate } from 'react-router-dom';
import ProdutosPage from '../components/ProdutosPage';
import ProdutoForm from '../components/ProdutoForm';
import ProdutoDetalhes from '../components/ProdutoDetalhes';
import { ProtectedRoute } from '../../auth/context/AuthContext';

const ProdutosRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProdutosPage />} />
      <Route path="/novo" element={
        <ProtectedRoute requiredPermission="operador">
          <ProdutoForm />
        </ProtectedRoute>
      } />
      <Route path="/editar/:id" element={
        <ProtectedRoute requiredPermission="operador">
          <ProdutoForm />
        </ProtectedRoute>
      } />
      <Route path="/:id" element={<ProdutoDetalhes />} />
      <Route path="*" element={<Navigate to="/produtos" replace />} />
    </Routes>
  );
};

export default ProdutosRoutes;
