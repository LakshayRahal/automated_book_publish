function VersionCard({ version, text, submittedType, onFeedback }) {
  const baseURL = import.meta.env.VITE_API_URL;

  const handleFeedback = async (type) => {
    await fetch(`${baseURL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: version, feedback: type }),
    });

    onFeedback(version, type);
    alert(`✅ Feedback submitted: ${type}`);
  };

  return (
    <div className="border border-gray-300 rounded p-4 shadow">
      <h2 className="font-bold mb-2">📄 Version: {version}</h2>
      <p className="mb-4 whitespace-pre-wrap">{text}</p>

      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback("accepted")}
          disabled={!!submittedType}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => handleFeedback("rejected")}
          disabled={!!submittedType}
          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handleFeedback("edited")}
          disabled={!!submittedType}
          className="bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Edited
        </button>
      </div>

      {submittedType && (
        <div className="mt-2 text-sm text-green-600">
           Feedback submitted: <span className="font-medium">{submittedType}</span>
        </div>
      )}
    </div>
  );
}

export default VersionCard;
