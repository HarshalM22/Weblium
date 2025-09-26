import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

import { Builder } from './pages/Builder';
import { PageProvider } from './context/PageProvider';

function App() {
  return (
    <PageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </BrowserRouter>
    </PageProvider>
  );
}

export default App;