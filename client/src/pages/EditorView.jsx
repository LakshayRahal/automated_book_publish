import { useState, useEffect } from 'react';

function EditorView() {
  // Define all local states
  const [url, setUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [spunText, setSpunText] = useState('');
  const [originalSpunText, setOriginalSpunText] = useState('');
  const [aiReviewNotes, setAiReviewNotes] = useState('');
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [editable, setEditable] = useState(false);

  const apiHost = import.meta.env.VITE_API_URL;

  // Load stored session data on mount
  useEffect(() => {
    const storedKeys = ['content', 'spun', 'reviewed', 'versionId'];
    storedKeys.forEach((key) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        switch (key) {
          case 'content':
            setInputText(saved);
            break;
          case 'spun':
            setSpunText(saved);
            setOriginalSpunText(saved);
            break;
          case 'reviewed':
            setAiReviewNotes(saved);
            break;
          case 'versionId':
            setCurrentVersionId(saved);
            break;
        }
      }
    });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('content', inputText);
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('spun', spunText);
  }, [spunText]);

  useEffect(() => {
    localStorage.setItem('reviewed', aiReviewNotes);
  }, [aiReviewNotes]);

  useEffect(() => {
    localStorage.setItem('versionId', currentVersionId);
  }, [currentVersionId]);

  const scrapeTextFromUrl = async () => {
    const response = await fetch(`${apiHost}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const result = await response.json();
    setInputText(result.content || '');
  };



  // whenever spin takes place 
  const triggerSpin = async () => {
    const response = await fetch(`${apiHost}/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText }),
    });
    const result = await response.json();
    setSpunText(result.spun_text);
    setOriginalSpunText(result.spun_text);
    setCurrentVersionId(result.version_id);
    setFeedbackSent(false);
    setEditable(false);
    setAiReviewNotes('');
  };


  // feedback take karne ke luye 
  const provideFeedback = async (type) => {
    if (!currentVersionId) {
      alert('Please generate spin content before submitting feedback.');
      return;
    }

    if (type === 'edited') {
      const response = await fetch(`${apiHost}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spunText }),
      });
      const result = await response.json();
      setAiReviewNotes(result.reviewed_text);
      setEditable(true);
      alert('AI Review loaded. You can now edit the spun content.');
      return;
    }

    await fetch(`${apiHost}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: currentVersionId, feedback: type }),
    });

    setFeedbackSent(true);
    alert(`Thanks! Feedback submitted: ${type}`);
  };



  // storing editing version 
  const storeEditedVersion = async () => {
    await fetch(`${apiHost}/save_version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spunText, version_id: currentVersionId }),
    });

    await fetch(`${apiHost}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: currentVersionId, feedback: 'edited' }),
    });

    setFeedbackSent(true);
    setEditable(false);
    alert('Changes saved and feedback updated as edited.');
  };


  // clear all data in the session 
  const resetSession = () => {
    localStorage.clear();
    setUrl('');
    setInputText('');
    setSpunText('');
    setOriginalSpunText('');
    setAiReviewNotes('');
    setCurrentVersionId(null);
    setFeedbackSent(false);
    setEditable(false);
  };

  return (
    //  all ui simple
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Paste URL here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border"
      />
      <button onClick={scrapeTextFromUrl} className="bg-blue-600 text-white px-4 py-2 rounded">
        Fetch Content
      </button>

      <textarea
        className="w-full border p-2 h-60"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Scraped or manually entered text"
      />

      <button onClick={triggerSpin} className="bg-green-600 text-white px-4 py-2 rounded">
        Spin Text
      </button>

      {spunText && (
        <div>
          <h3 className="font-bold mt-4 mb-2">
            Spun Output {editable ? '(Editable)' : '(Locked)'}
          </h3>
          <textarea
            className="w-full border p-2 h-60"
            value={spunText}
            onChange={(e) => setSpunText(e.target.value)}
            readOnly={!editable}
          />

          <div className="flex gap-2 mt-2">
            {!editable ? (
              <>
                <button
                  onClick={() => provideFeedback('accepted')}
                  disabled={feedbackSent}
                  className="bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => provideFeedback('rejected')}
                  disabled={feedbackSent}
                  className="bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => provideFeedback('edited')}
                  disabled={feedbackSent}
                  className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Edit with AI Notes
                </button>
              </>
            ) : (
              <button
                onClick={storeEditedVersion}
                className="bg-blue-700 text-white px-3 py-1 rounded"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {editable && aiReviewNotes && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">AI Suggestions</h4>
          <textarea
            className="w-full border p-2 h-60 bg-gray-100 text-gray-700"
            value={aiReviewNotes}
            readOnly
          />
        </div>
      )}

      <button
        onClick={resetSession}
        className="bg-red-600 text-white px-4 py-2 rounded mt-6"
      >
        Clear Everything
      </button>
    </div>
  );
}

export default EditorView;
