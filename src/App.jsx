import { useState, useEffect } from 'react'
import MatchScoutingForm from './workflows/MatchScouting/form.jsx'
import Leaderboard from './workflows/Leaderboard/main.jsx'
import { Routes, Route } from 'react-router-dom';
import PitScoutingForm from './workflows/PitScouting/form.jsx';
import MainMenu from './MainMenu';
import './css/App.css'
import useLocalStorage from './utils/useLocalStorage';

function App() {
  const [matches, setMatches] = useLocalStorage('matches', []);
  const [pitTeams, setPitTeams] = useLocalStorage('pitTeams', []);
  const [TBAdata, setTBAdata] = useLocalStorage('tbadata', []);
  const [TBAteams, setTBAteams] = useLocalStorage('tbateams', []);
  const [tablet, setTablet] = useLocalStorage('tablet', "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let sending = false;

  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      // Vibrate for 200ms
      navigator.vibrate(200);
    } else {
      console.log("Haptics not supported on this device/browser.");
    }
  };

  const pullTBA = async (eventKey) => {
    const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches/simple`, {
      headers: {
        "X-TBA-Auth-Key": "3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7"
      }
    });

    const data = await res.json();

    console.log(data.filter((item) => {return item.comp_level === "qm"}));
    return data.filter((item) => {return item.comp_level === "qm"});
  }

  const pullTBAteams = async (eventKey) => {
    const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/teams/simple`, {
      headers: {
        "X-TBA-Auth-Key": "3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7"
      }
    });

    const data = await res.json();

    return data;
  }

  useEffect(() => {
      // 1. Create the async wrapper
      const executeFetch = async () => {
      try {
          setLoading(true);
          setError(null);
          
          // 2. Call the function passed via props
          const result = await pullTBA("2026miken");
          setTBAdata(result.sort((a, b) => Number(a.match_number) - Number(b.match_number)));
      } catch (err) {
          setError(err.message || 'Something went wrong');
      } finally {
          setLoading(false);
      }
      };

      executeFetch();

      // 3. Add fetchRemoteData to the dependency array
  }, []);

  useEffect(() => {
      // 1. Create the async wrapper
      const executeFetch = async () => {
      try {
          setLoading(true);
          setError(null);
          
          // 2. Call the function passed via props
          const result = await pullTBAteams("2026miken");
          setTBAteams(result.sort((a, b) => Number(a.team_number) - Number(b.team_number)));
      } catch (err) {
          setError(err.message || 'Something went wrong');
      } finally {
          setLoading(false);
      }
      };

      executeFetch();

      // 3. Add fetchRemoteData to the dependency array
  }, []);

  const uploadData = async (data, hpdata, pitdata) => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyy4wmiicy637FwQKAycjlo7wBnMfVPvyzCjdpl1SUnh1tGhcyBYSKPwees1qGO0scy/exec";
    const payload = {
      matchData: data,
      pitData: pitdata
    };

    console.log(data)
    
    if(sending != true) {
      sending = true;
      if((data != [] && data != "") || (pitdata != [] && pitdata != "")) {
        try {
          const response = await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors", // Required for Google Apps Script redirects
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          
          setMatches([]);
          setPitTeams([]);

          alert("Data successfully sent!");

          sending = false;
        } catch (error) {
          alert("Upload failed:", error);
          sending = false;
        }
      } else {
        alert("Dearest twin, it is apparent that there is a paucity of data!")
        sending = false;
      }
    } else {
      alert("Finest of twinnys, please hold thy horses, as a request has already been sent!")
    }
  }

  const fetchData = async () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyy4wmiicy637FwQKAycjlo7wBnMfVPvyzCjdpl1SUnh1tGhcyBYSKPwees1qGO0scy/exec";

    try {
      const response = await fetch(WEB_APP_URL);
      const data = await response.json();

      // Pulling them into their own arrays
      const allMatches = data.matchData;
      const allHPData = data.hpData;
      const allPitData = data.pitData;

      return {
        match: allMatches,
        hp: allHPData,
        pit: allPitData
      }
    } catch (error) {
      return "Error fetching leaderboard:" + error
    }
  }

  return (
    <div className="app tuff-load">
      <Routes>
        <Route path="/" element={<MainMenu tablet={tablet} setTablet={setTablet} uploadData={uploadData} matches={matches} pullTBA={pullTBA} pitTeams={pitTeams}/>} />
        <Route path="/pit" element={<PitScoutingForm triggerHaptic={triggerHaptic} setPitTeams={setPitTeams}/>} />
        <Route path="/match" element={<MatchScoutingForm tablet={tablet} triggerHaptic={triggerHaptic} matches={matches} setMatches={setMatches} TBAdata={TBAdata}/>} />
        <Route path="/leaderboard" element={<Leaderboard day1Ct={50} fetchData={fetchData} compData={TBAdata} teamData={TBAteams}/>} />
      </Routes>
    </div>
  )
}

export default App
