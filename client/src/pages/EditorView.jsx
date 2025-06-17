import { useState, useEffect } from 'react';

function EditorView() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [spun, setSpun] = useState('');
  const [originalSpun, setOriginalSpun] = useState('');
  const [reviewed, setReviewed] = useState('');
  const [versionId, setVersionId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const baseURL = import.meta.env.VITE_API_URL;

  // Load session
  useEffect(() => {
    const saved = ['content', 'spun', 'reviewed', 'versionId'].reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {});
    if (saved.content) setContent(saved.content);
    if (saved.spun) {
      setSpun(saved.spun);
      setOriginalSpun(saved.spun);
    }
    if (saved.reviewed) setReviewed(saved.reviewed);
    if (saved.versionId) setVersionId(saved.versionId);
  }, []);

  // Save session
  useEffect(() => localStorage.setItem('content', content), [content]);
  useEffect(() => localStorage.setItem('spun', spun), [spun]);
  useEffect(() => localStorage.setItem('reviewed', reviewed), [reviewed]);
  useEffect(() => localStorage.setItem('versionId', versionId), [versionId]);

  const handleScrape = async () => {
    const res = await fetch(`${baseURL}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setContent(data.content || '');
  };

  const handleSpin = async () => {
    const res = await fetch(`${baseURL}/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content }),
    });
    const data = await res.json();
    setSpun(data.spun_text);
    setOriginalSpun(data.spun_text);
    setVersionId(data.version_id);
    setFeedbackGiven(false);
    setIsEditing(false);
    setReviewed('');
  };

  const handleFeedback = async (type) => {
    if (!versionId) return alert('Spin content before submitting feedback.');

    if (type === 'edited') {
      const res = await fetch(`${baseURL}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spun }),
      });
      const data = await res.json();
      setReviewed(data.reviewed_text);
      setIsEditing(true);
      alert("Spun text is now editable. Refer to the AI review suggestions below.");
      return;
    }

    await fetch(`${baseURL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: versionId, feedback: type }),
    });

    setFeedbackGiven(true);
    alert(`Feedback submitted: ${type}`);
  };

  const handleSaveEditedVersion = async () => {
    await fetch(`${baseURL}/save_version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spun, version_id: versionId }),
    });

    await fetch(`${baseURL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: versionId, feedback: 'edited' }),
    });

    setFeedbackGiven(true);
    setIsEditing(false);
    alert('Edited version saved with feedback = 0.5');
  };

  const handleClearSession = () => {
    localStorage.clear();
    setUrl('');
    setContent('');
    setSpun('');
    setOriginalSpun('');
    setReviewed('');
    setVersionId(null);
    setFeedbackGiven(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter chapter URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border"
      />
      <button onClick={handleScrape} className="bg-blue-600 text-white px-4 py-2 rounded">
        Scrape
      </button>

      <textarea
        className="w-full border p-2 h-70"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scraped content will appear here..."
      />

      <div className="flex gap-4">
        <button onClick={handleSpin} className="bg-green-600 text-white px-4 py-2 rounded">
          Spin
        </button>
      </div>

      {spun && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">🔄 Spun Text {isEditing ? "(Editable)" : "(Read-only)"}:</h2>
          <textarea
            className="w-full border p-2 h-70"
            value={spun}
            onChange={(e) => setSpun(e.target.value)}
            readOnly={!isEditing}
          />
  

          <div className="flex gap-2 mt-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => handleFeedback("accepted")}
                  disabled={feedbackGiven}
                  className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleFeedback("rejected")}
                  disabled={feedbackGiven}
                  className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleFeedback("edited")}
                  disabled={feedbackGiven}
                  className="bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  ✏️ Ai review & Edit
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={handleSaveEditedVersion}
                className="bg-blue-700 text-white px-3 py-1 rounded"
              >
                💾 Save Edited Version
              </button>
            )}
          </div>
        </div>
      )}

      {isEditing && reviewed && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">🧠 AI Review Suggestions:</h2>
          <textarea
            className="w-full border p-2 h-70 bg-gray-100 text-gray-800"
            value={reviewed}
            readOnly
          />
        </div>
      )}

      <button
        onClick={handleClearSession}
        className="bg-red-600 text-white px-4 py-2 rounded mt-4"
      >
        Clear Session
      </button>
    </div>
  );
}

export default EditorView;
