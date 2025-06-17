import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EditorView from './pages/EditorView';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Automated Book Publisher</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-blue-600 hover:underline">Editor</Link>
            <Link to="/search" className="text-blue-600 hover:underline">Search</Link>
          </nav>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<EditorView />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
