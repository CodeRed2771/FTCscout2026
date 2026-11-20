import { useState, useEffect } from 'react'
import MatchScoutingForm from './workflows/MatchScouting/form.jsx'
import Leaderboard from './workflows/Leaderboard/main.jsx'
import { Routes, Route } from 'react-router-dom';
import PitScoutingForm from './workflows/PitScouting/form.jsx';
import MainMenu from './MainMenu';
import './css/App.css'
import useLocalStorage from './utils/useLocalStorage';
import TeamLookup from './workflows/TeamLookup/main.jsx'

function App() {
  const [matches, setMatches] = useLocalStorage('matches', []);
  const [pitTeams, setPitTeams] = useLocalStorage('pitTeams', []);
  const [TBAdata, setTBAdata] = useLocalStorage('tbadata', []);
  const [TBAteams, setTBAteams] = useLocalStorage('tbateams', []);
  const [tablet, setTablet] = useLocalStorage('tablet', "Red 1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competition, setCompetition] = useLocalStorage('competition', "Kentwood");
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
    if(competition === "Practice") {
      return [{teams: [{alliance: "Red", allianceRole: "Captain", teamNumber: 5383}, {alliance: "Red", allianceRole: "FirstPick", teamNumber: 5383}, {alliance: "Blue", allianceRole: "Captain", teamNumber: 5384}, {alliance: "Blue", allianceRole: "FirstPick", teamNumber: 5384}]}];
    } else {
      const res = await fetch(`https://api.ftcscout.org/rest/v1/events/2026/${eventKey}/matches/`, {
        headers: {
          "X-TBA-Auth-Key": "3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7"
        }
      });

      const data = await res.json();

      console.log(data.filter((item) => {return item.tournamentLevel === "Quals"}));
      return data.filter((item) => {return item.tournamentLevel === "Quals"});
    }

  }

  const pullTBAteams = async (eventKey) => {
    if(competition === "Practice") {
      return [{team_number: 5383, nickname: "Team 5383", city: "City A", state_prov: "State A", country: "Country A"}, {team_number: 5384, nickname: "Team 5384", city: "City B", state_prov: "State B", country: "Country B"}];
    } else {
      const res = await fetch(`https://api.ftcscout.org/rest/v1/events/2026/${eventKey}/teams/`, {
        headers: {
          "X-TBA-Auth-Key": "3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7"
        }
      });

      const data = await res.json();
      
      console.log(data);
      return data;
    }
  }

  useEffect(() => {
      // 1. Create the async wrapper
      const executeFetch = async () => {
      try {
          setLoading(true);
          setError(null);
          
          // 2. Call the function passed via props
          
          const event = competition === "Kentwood" ? "USMIKEQ" : competition === "Fruitport" ? "USMIFRQ2" : competition === "States" ? "USMINWCMP" : "practice";
          const result = await pullTBA(event);
          setTBAdata(result.sort((a, b) => Number(a.id) - Number(b.id)));
      } catch (err) {
          setError(err.message || 'Something went wrong');
      } finally {
          setLoading(false);
      }
      };

      executeFetch();

      // 3. Add fetchRemoteData to the dependency array
  }, [competition]);

  useEffect(() => {
      // 1. Create the async wrapper
      const executeFetch = async () => {
      try {
          setLoading(true);
          setError(null);
          
          const event = competition === "Kentwood" ? "USMIKEQ" : competition === "Fruitport" ? "USMIFRQ2" : competition === "States" ? "USMINWCMP" : "practice";
          const result = await pullTBAteams(event);
          setTBAteams(result.sort((a, b) => Number(a.team_number) - Number(b.team_number)));
      } catch (err) {
          setError(err.message || 'Something went wrong');
      } finally {
          setLoading(false);
      }
      };

      executeFetch();

      // 3. Add fetchRemoteData to the dependency array
  }, [competition]);

  const uploadData = async (data, hpdata, pitdata) => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxqsBJcoAQnt5eVNcR9wtEqkTosnWKIh9DD6X7wT7KNDX8astZBHS1GBEV8CMvz8y0N/exec";
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
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxqsBJcoAQnt5eVNcR9wtEqkTosnWKIh9DD6X7wT7KNDX8astZBHS1GBEV8CMvz8y0N/exec";

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
        <Route path="/" element={<MainMenu competition={competition} setCompetition={setCompetition} tablet={tablet} setTablet={setTablet} uploadData={uploadData} matches={matches} pullTBA={pullTBA} pitTeams={pitTeams}/>} />
        <Route path="/pit" element={<PitScoutingForm competition={competition} triggerHaptic={triggerHaptic} setPitTeams={setPitTeams}/>} />
        <Route path="/match" element={<MatchScoutingForm fetchData={fetchData} competition={competition} tablet={tablet} triggerHaptic={triggerHaptic} matches={matches} setMatches={setMatches} TBAdata={TBAdata}/>} />
        <Route path="/leaderboard" element={<Leaderboard day1Ct={50} fetchData={fetchData} compData={TBAdata} teamData={TBAteams}/>} />
        <Route path="/teamlookup" element={<TeamLookup fetchData={fetchData} compData={TBAdata} teamData={TBAteams}/>} />
      </Routes>
    </div>
  )
}

export default App
