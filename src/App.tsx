import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import DataExplorer from './pages/DataExplorer';
import AlgorithmConfig from './pages/AlgorithmConfig';
import RunAlgorithm from './pages/RunAlgorithm';
import ResultsDashboard from './pages/ResultsDashboard';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="article" element={<Article />} />
            <Route path="data" element={<DataExplorer />} />
            <Route path="config" element={<AlgorithmConfig />} />
            <Route path="run" element={<RunAlgorithm />} />
            <Route path="results" element={<ResultsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
