import { useState, useEffect } from 'react';
import useVcmd from '../hooks/useVoiceCommand';

function EditorView() {
  const [ul, set_ul] = useState('');
  const [inpTxt, setInTxt] = useState('');
  const [sp_txt, setSp_txt] = useState('');
  const [o_sp_txt, setO_sp_txt] = useState('');
  const [ai_rv_txt, setAi_rv_txt] = useState('');
  const [curr_v_id, setCurr_v_id] = useState(null);
  const [fdb_sent, setFdb_sent] = useState(false);
  const [edt, setEdt] = useState(false);

  const apiHost = import.meta.env.VITE_URL;

  useVcmd(
  (cmd) => {
    // usefull for voice end 
    if (!sp_txt) return;
    if (cmd === 'accepted' || cmd === 'rejected' || cmd === 'edited') {
      pFeed(cmd);
    }
  }
);


  // Load from localStorage 
  useEffect(() => {
    const keys = ['content', 'spun', 'reviewed', 'versionId'];
    keys.forEach((key) => {
      const saved = localStorage.getItem(key);
      
      if (saved) {
        if (key === 'content') setInTxt(saved);
        if (key === 'spun') {
          setSp_txt(saved);
          setO_sp_txt(saved);
        }
        if (key === 'reviewed') setAi_rv_txt(saved);
        if (key === 'versionId') setCurr_v_id(saved);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('content', inpTxt);
  }, [inpTxt]);

  useEffect(() => {
    localStorage.setItem('spun', sp_txt);
  }, [sp_txt]);

  useEffect(() => {
    localStorage.setItem('reviewed', ai_rv_txt);
  }, [ai_rv_txt]);

  useEffect(() => {
    localStorage.setItem('versionId', curr_v_id);
  }, [curr_v_id]);

  const scrapeTextFromUrl = async () => {
    const newul=apiHost+'/scrape';
    const val = await fetch(`${newul}`, {


      method: 'POST',

   // making in json formatting
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ul}),
    });
    const ans = await val.json();
    setInTxt(ans.content || '');
  };

  const tsp = async () => {
    
    const nul=apiHost+'/spin';
    const ans = await fetch(`${nul}`, {
      method: 'POST',
 // making in json formatting
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ t: inpTxt }),
    });
    const val = await ans.json();
    setSp_txt(val.sp_txt);

    setO_sp_txt(val.sp_txt);

    setCurr_v_id(val.version_id);


    setFdb_sent(false);

    setEdt(false);
    setAi_rv_txt('');
  };



  const pFeed = async (type) => {
    if (!curr_v_id) {
      alert('Please generate spin content before submitting feedback.');
      return;
    }

    if (type === 'edited') {
      const newul=apiHost+'/review';
      // calling fetch fun for getting answer
      const val = await fetch(`${newul}`, {
        method: 'POST',
        // making in json formatting
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: sp_txt }),
      });
      
      const ans = await val.json();
      setAi_rv_txt(ans.reviewed_text);
      setEdt(true);
      alert('AI Review loaded. You can now edit the spinned content.');
      return;
    }
      await fetch(`${apiHost}/feedback`, {
      method: 'POST',
   // making in json formatting
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: curr_v_id, feedback: type }),
      });

    setFdb_sent(true);
    alert(`Feedback submitted: ${type}`);
  };

  const storeEdtVs = async () => {
    const arr=apiHost+'/save_version';
    await fetch(`${arr}`, {
      method: 'POST',
   // making in json formatting
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: sp_txt, version_id: curr_v_id }),
    });

    const ans=apiHost+'/feedback';
    await fetch(`${ans}`, {
      method: 'POST',
   // making in json formatting
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: curr_v_id, feedback: 'edited' }),
    });

    setFdb_sent(true);
    setEdt(false);
    alert('Changes saved and feedback updated as edited.');
  };


  // all things are resetted
  const clear_ses = () => {
    localStorage.clear();
    set_ul('');
    setInTxt('');

    setSp_txt('');

    setO_sp_txt('');


    setAi_rv_txt('');
    setCurr_v_id(null);

    setFdb_sent(false);
    setEdt(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Paste URL here"
        value={ul}
        onChange={(e) => set_ul(e.target.value)}
        className="w-full p-2 border"
      />
      <button onClick={scrapeTextFromUrl} className="bg-blue-600 text-white px-4 py-2 rounded">
        Fetch Content
      </button>

      <textarea
        className="w-full border p-2 h-60"
        value={inpTxt}
        onChange={(e) => setInTxt(e.target.value)}
        placeholder="Scraped or manually entered text"
      />

      <button onClick={tsp} className="bg-green-600 text-white px-4 py-2 rounded">
        Spin Text
      </button>

      {sp_txt && (
        <div>
          <h3 className="font-bold mt-4 mb-2">
            Spin Output {edt ? '(Editable)' : '(Locked)'}
          </h3>
          <textarea
            className="w-full border p-2 h-60"
            value={sp_txt}
            onChange={(e) => setSp_txt(e.target.value)}
            readOnly={!edt}
          />

          <p className="text-sm text-gray-500 mb-2">Voice Comand Supported: "accepted", "rejected", "edited"</p>

          <div className="flex gap-2 mt-2">
            {!edt ? (
              <>
                <button
                  onClick={() => pFeed('accepted')}
                  disabled={fdb_sent}
                  className="bg-green-700  px-3 py-1 rounded text-white disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => pFeed('rejected')}
                  disabled={fdb_sent}
                  className="bg-red-700 px-3 py-1 rounded disabled:opacity-50  text-white "
                >
                  Reject
                </button>
                <button
                  onClick={() => pFeed('edited')}
                  disabled={fdb_sent}
                  className="bg-yellow-500 px-3 py-1 rounded disabled:opacity-50  text-white "
                >
                  Edit with AI Notes
                </button>
              </>
            ) : (
              <button
                onClick={storeEdtVs}
                className="bg-blue-700 px-3 py-1   text-white  rounded"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {edt && ai_rv_txt && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">AI Suggestions</h4>
          <textarea
            className="w-full border  bg-gray-100 p-2 h-60 text-gray-700"
            value={ai_rv_txt}
            readOnly
          />
        </div>
      )}

      <button onClick={clear_ses} className="bg-red-600 px-4 py-2 rounded mt-6  text-white">
        Clear Everything
      </button>
    </div>
  );
}

export default EditorView;
