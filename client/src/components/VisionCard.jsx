function Feedc({ vs, text, but_St, onFeedback }) {
  const host = import.meta.env.VITE_URL;

  const sub_fed = async (val) => {
    try {
      await fetch(`${host}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_id: vs,
          feedback: val,
        }),
      });
      onFeedback(vs, val);
      alert(`You chose: ${val}`);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 shadow-sm">
      <h3 className="font-semibold mb-2">Version ID: {vs}</h3>

      <div className="whitespace-pre-wrap mb-4 text-sm text-gray-800">
        {text}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => sub_fed('accepted')}
          disabled={!!but_St}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => sub_fed('rejected')}
          disabled={!!but_St}
          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => sub_fed('edited')}
          disabled={!!but_St}
          className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          show as Edited
        </button>
      </div>

      {but_St && (
        <p className="mt-2 text-sm text-green-700">
          Feedback: <strong>{but_St}</strong>
        </p>
      )}
    </div>
  );
}

export default Feedc;
