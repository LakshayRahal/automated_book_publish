import { useState } from 'react';
import VersionCard from '../components/VisionCard';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store feedback per version_id
  const [feedbackMap, setFeedbackMap] = useState({});

  const baseURL = import.meta.env.VITE_API_URL;

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/ranked_results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const formatted = data.results.map((item, index) => ({
        version: item.version_id || `v${index + 1}`,
        text: item.text || '',
      }));

      setResults(formatted);
      // Keep previous feedbacks for already given ones
      const newMap = { ...feedbackMap };
      formatted.forEach(({ version }) => {
        if (!(version in newMap)) newMap[version] = null;
      });
      setFeedbackMap(newMap);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ranked results.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (versionId, type) => {
    setFeedbackMap((prev) => ({ ...prev, [versionId]: type }));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📚 Search Relevant Versions</h1>

      <input
        type="text"
        placeholder="Enter query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-400 p-2 rounded"
      />

      <button
        onClick={handleSearch}
        disabled={!query.trim()}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>

      {loading && <p className="text-blue-500">🔄 Searching...</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      <div className="grid gap-4 mt-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <VersionCard
              key={index}
              version={result.version}
              text={result.text}
              submittedType={feedbackMap[result.version]}
              onFeedback={handleFeedback}
            />
          ))
        ) : (
          !loading && <p className="text-gray-500">No results yet.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
