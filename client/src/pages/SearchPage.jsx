import { useState } from 'react';
import FeedbackCard from '../components/VisionCard';

function SearchPage() {
  // User ke input ka text
  const [searchText, setSearchText] = useState('');

  // Matched results
  const [matchedResults, setMatchedResults] = useState([]);

  // Jab searching
  const [isSearching, setIsSearching] = useState(false);

  //  for fetching
  const [fetchError, setFetchError] = useState(null);

  // Har version ke feedback status ko track karne ke liye
  const [givenFeedback, setGivenFeedback] = useState({});

  const apiUrl = import.meta.env.VITE_API_URL;

  // Search button press hone pe yeh function API call karta hai
  const runSearch = async () => {
    if (!searchText.trim()) return;

    setIsSearching(true);
    setFetchError(null);

    try {
      const response = await fetch(`${apiUrl}/ranked_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchText }),
      });

      const { results } = await response.json();

      // Result ko sahi format mein convert kar rahe hain
      const structuredResults = results.map((entry, idx) => ({
        version: entry.version_id || `ver-${idx + 1}`,
        text: entry.text || '',
      }));

      setMatchedResults(structuredResults);

      // Pehle se diye gaye feedback preserve
      const updatedFeedback = { ...givenFeedback };
      structuredResults.forEach(({ version }) => {
        if (!updatedFeedback.hasOwnProperty(version)) {
          updatedFeedback[version] = null;
        }
      });

      setGivenFeedback(updatedFeedback);
    } catch (err) {
      console.error('Search API failed:', err);
      setFetchError('Unable to retrieve results.');
    } finally {
      setIsSearching(false);
    }
  };

  //  feedback answer will be updated to all state
  const recordFeedback = (verId, feedbackType) => {
    setGivenFeedback((prevMap) => ({
      ...prevMap,
      [verId]: feedbackType,
    }));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Find Relevant Versions</h2>

      <input
        type="text"
        placeholder="Type your query here..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full border border-gray-400 p-2 rounded"
      />

      <button
        onClick={runSearch}
        disabled={!searchText.trim()}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>

      {isSearching && <p className="text-blue-500">Searching...</p>}
      {fetchError && <p className="text-red-600">{fetchError}</p>}

      <div className="grid gap-4 mt-4">
        {matchedResults.length > 0 ? (
          matchedResults.map((item, idx) => (
            <FeedbackCard
              key={idx}
              version={item.version}
              text={item.text}
              buttonState={givenFeedback[item.version]}
              onFeedback={recordFeedback}
            />
          ))
        ) : (
          !isSearching && <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
