import React from 'react';

function FeedbackCard({ version, text, buttonState, onFeedback }) {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Handle button clicks for feedback
  const submitFeedback = async (feedbackType) => {
    try {
      await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_id: version,
          feedback: feedbackType,
        }),
      });

      onFeedback(version, feedbackType);
      alert(`You chose: ${feedbackType}`);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 shadow-sm">
      <h3 className="font-semibold mb-2">📝 Version ID: {version}</h3>

      <div className="whitespace-pre-wrap mb-4 text-sm text-gray-800">
        {text}
      </div>
    {/* three option button  */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => submitFeedback('accepted')}
          disabled={!!buttonState}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => submitFeedback('rejected')}
          disabled={!!buttonState}
          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => submitFeedback('edited')}
          disabled={!!buttonState}
          className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Mark as Edited
        </button>
      </div>

      {buttonState && (
        <p className="mt-2 text-sm text-green-700">
          Feedback: <strong>{buttonState}</strong>
        </p>
      )}
    </div>
  );
}

export default FeedbackCard;
