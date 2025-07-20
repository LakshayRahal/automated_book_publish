import { useState } from 'react';
import Feedc from '../components/VisionCard';

function SearchPage() {
  // User ke input ka text
  const [ser_txt, setser_txt] = useState('');

  // matching res
  const [mtch_res, setmtch_res] = useState([]);

  // Jab searching
  const [serc, set_serc] = useState(false);

  const [f_error, setf_error] = useState(null);

  // Har version ke feedback status ko track karne ke liye
  const [feed_st, setfeed_st] = useState({});

  const host = import.meta.env.VITE_URL;

  // Search button press hone pe yeh function API call karta hai
  const run_ser = async () => {
    if (!ser_txt.trim()) return;

    set_serc(true);
    setf_error(null);

    try {
      const resp = await fetch(`${host}/ranked_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quer: ser_txt }),
      });

      const { res } = await resp.json();

      // Result ko sahi format mein convert kar rahe hain
      const struct_res = res.map((entry, idx) => ({
        version: entry.version_id || `ver-${idx + 1}`,
        text: entry.text || '',
      }));

      setmtch_res(struct_res);

      // Pehle se diye gaye feedback preserve
     const updFeed = { ...feed_st };

    for (const { version } of struct_res) {
      if (!(version in updFeed)) {
      updFeed[version] = null;
     }
}

      setfeed_st(updFeed);
    } catch (err) {
      console.error('Search API failed:', err);
      setf_error('Unable to retrieve results.');
    } finally {
      set_serc(false);
    }
  };

  //  feedback answer will be updated to all state
  const recdFeed = (verId, feedbackType) => {
    setfeed_st((prevMap) => ({
      // previois me add karne ke liye
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
        value={ser_txt}
        //  pointer just like
        onChange={(e) => setser_txt(e.target.value)}
        className="w-full border border-gray-400 p-2 rounded"
      />

      <button
        onClick={run_ser}
        disabled={!ser_txt.trim()}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>

      {serc && <p className="text-blue-500">Searching...</p>}
      {f_error && <p className="text-red-600">{f_error}</p>}

      <div className="grid gap-4 mt-4">
        {mtch_res.length > 0 ? (
          mtch_res.map((item, idx) => (
            <Feedc
              key={idx}
              vs={item.version}
              text={item.text}
              but_St={feed_st[item.version]}
              onFeedback={recdFeed}
            />
          ))
        ) : (
          !serc && <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
