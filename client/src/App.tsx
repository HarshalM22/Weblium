
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Builder from './pages/Builder';
import { BuildProvider } from './contexts/BuildContext';

function App() {
  return (
    <BuildProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </Router>
     </BuildProvider>
  );
}

export default App;