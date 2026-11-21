import { useState, useEffect, useRef } from 'react';
import { get, del } from 'idb-keyval';
import MatchScoutingForm from './workflows/MatchScouting/form.jsx';
import Leaderboard from './workflows/Leaderboard/main.jsx';
import { Routes, Route } from 'react-router-dom';
import PitScoutingForm from './workflows/PitScouting/form.jsx';
import MainMenu from './MainMenu';
import './css/App.css';
import useLocalStorage from './utils/useLocalStorage';
import TeamLookup from './workflows/TeamLookup/main.jsx';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/wwmjk9yo/image/upload';
const CLOUDINARY_PRESET = 'a6zkymrx';

function App() {
  const [matches, setMatches] = useLocalStorage('matches', []);
  const [pitTeams, setPitTeams] = useLocalStorage('pitTeams', []);
  const [TBAdata, setTBAdata] = useLocalStorage('tbadata', []);
  const [TBAteams, setTBAteams] = useLocalStorage('tbateams', []);
  const [tablet, setTablet] = useLocalStorage('tablet', 'Red 1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pit, setPit] = useState([]);
  const [competition, setCompetition] = useLocalStorage('competition', 'Kentwood');

  // Using useRef so 'sending' survives component re-renders while uploading
  const sendingRef = useRef(false);

  async function prepareTeamPayload(teamData) {
    const finalTeam = { ...teamData };

    // If image is a local IndexedDB key (not empty and not already uploaded)
    if (finalTeam.image && !finalTeam.image.startsWith('http')) {
      const blob = await get(finalTeam.image);
      if (blob) {
        const fd = new FormData();
        fd.append('file', blob, `${finalTeam.teamNum || 'robot'}.jpg`);
        fd.append('upload_preset', CLOUDINARY_PRESET);

        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const { secure_url } = await res.json();
        const oldKey = finalTeam.image;
        finalTeam.image = secure_url; // Swap ID for the permanent URL!

        // Clean up the local Blob from IndexedDB once uploaded
        await del(oldKey);
      } else {
        // Blob missing in IndexedDB; clear broken key so upload isn't blocked
        finalTeam.image = '';
      }
    }

    return finalTeam;
  }

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    } else {
      console.log('Haptics not supported on this device/browser.');
    }
  };

  useEffect(() => {
    let active = true;

    const executeFetch = async () => {
      try {
        setError(null);

        const result = await fetchData();
        console.log(result);

        if (!active) return;

        const filtered =
          result?.pit?.filter((i) => i.Location === competition) ?? [];
        setPit(filtered);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setPit([]);
      }
    };

    executeFetch();

    return () => {
      active = false;
    };
  }, [competition]);

  const pullTBA = async (eventKey) => {
    if (competition === 'Practice') {
      return [
        {
          teams: [
            { alliance: 'Red', allianceRole: 'Captain', teamNumber: 5383 },
            { alliance: 'Red', allianceRole: 'FirstPick', teamNumber: 5383 },
            { alliance: 'Blue', allianceRole: 'Captain', teamNumber: 5384 },
            { alliance: 'Blue', allianceRole: 'FirstPick', teamNumber: 5384 },
          ],
        },
      ];
    } else {
      const res = await fetch(
        `https://api.ftcscout.org/rest/v1/events/2026/${eventKey}/matches/`,
        {
          headers: {
            'X-TBA-Auth-Key':
              '3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7',
          },
        }
      );

      const data = await res.json();
      return data.filter((item) => item.tournamentLevel === 'Quals');
    }
  };

  const pullTBAteams = async (eventKey) => {
    if (competition === 'Practice') {
      return [
        {
          team_number: 5383,
          nickname: 'Team 5383',
          city: 'City A',
          state_prov: 'State A',
          country: 'Country A',
        },
        {
          team_number: 5384,
          nickname: 'Team 5384',
          city: 'City B',
          state_prov: 'State B',
          country: 'Country B',
        },
      ];
    } else {
      const res = await fetch(
        `https://api.ftcscout.org/rest/v1/events/2026/${eventKey}/teams/`,
        {
          headers: {
            'X-TBA-Auth-Key':
              '3rTF5gxmIdJSYKqhKohNTzEKl7D9x04ivAFGYzOumRgHdqIA6acFssENXYNkfCK7',
          },
        }
      );

      const data = await res.json();
      return data;
    }
  };

  useEffect(() => {
    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const event =
          competition === 'Kentwood'
            ? 'USMIKEQ'
            : competition === 'Fruitport'
            ? 'USMIFRQ2'
            : competition === 'States'
            ? 'USMINWCMP'
            : 'practice';
        const result = await pullTBA(event);
        setTBAdata(result.sort((a, b) => Number(a.id) - Number(b.id)));
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    executeFetch();
  }, [competition]);

  useEffect(() => {
    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const event =
          competition === 'Kentwood'
            ? 'USMIKEQ'
            : competition === 'Fruitport'
            ? 'USMIFRQ2'
            : competition === 'States'
            ? 'USMINWCMP'
            : 'practice';
        const result = await pullTBAteams(event);
        setTBAteams(
          result.sort((a, b) => Number(a.team_number) - Number(b.team_number))
        );
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    executeFetch();
  }, [competition]);

  const uploadData = async (data = [], hpdata = [], pitdata = []) => {
    const WEB_APP_URL =
      'https://script.google.com/macros/s/AKfycbz7v9lNrdfuX_FgXC87IFTj2e2BdLC6R5xpOOz2rwdyZSB_34N2IhdfJRYFmkdyQnfK/exec';

    if (sendingRef.current) {
      alert(
        'Finest of twinnys, please hold thy horses, as a request has already been sent!'
      );
      return;
    }

    const hasMatches = Array.isArray(data) && data.length > 0;
    const hasPit = Array.isArray(pitdata) && pitdata.length > 0;

    if (!hasMatches && !hasPit) {
      alert('Dearest twin, it is apparent that there is a paucity of data!');
      return;
    }

    sendingRef.current = true;

    try {
      // 1. Convert any local IndexedDB photo IDs in pitdata into Cloudinary URLs
      const resolvedPitData = [];
      for (let i = 0; i < pitdata.length; i++) {
        try {
          const readyTeam = await prepareTeamPayload(pitdata[i]);
          resolvedPitData.push(readyTeam);
        } catch (imgErr) {
          // Save partial progress so already-uploaded photos keep their URLs
          const updatedQueue = [...resolvedPitData, ...pitdata.slice(i)];
          setPitTeams(updatedQueue);
          throw imgErr;
        }
      }

      // Persist resolved URLs to pitTeams just in case the Google Sheets POST fails below
      if (hasPit) {
        setPitTeams(resolvedPitData);
      }

      // 2. Send matches + resolved pit data to Google Apps Script
      const payload = {
        matchData: data,
        pitData: resolvedPitData,
      };

      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script redirects
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setMatches([]);
      setPitTeams([]);

      alert('Data successfully sent!');
    } catch (error) {
      alert(`Upload failed: ${error.message || error}`);
    } finally {
      sendingRef.current = false;
    }
  };

  const fetchData = async () => {
    const WEB_APP_URL =
      'https://script.google.com/macros/s/AKfycbz7v9lNrdfuX_FgXC87IFTj2e2BdLC6R5xpOOz2rwdyZSB_34N2IhdfJRYFmkdyQnfK/exec';

    try {
      const response = await fetch(WEB_APP_URL);
      const data = await response.json();

      const allMatches = data.matchData;
      const allHPData = data.hpData;
      const allPitData = data.pitData;

      return {
        match: allMatches,
        hp: allHPData,
        pit: allPitData,
      };
    } catch (error) {
      return 'Error fetching leaderboard:' + error;
    }
  };

  return (
    <div className="app tuff-load">
      <Routes>
        <Route
          path="/"
          element={
            <MainMenu
              competition={competition}
              setCompetition={setCompetition}
              tablet={tablet}
              setTablet={setTablet}
              uploadData={uploadData}
              matches={matches}
              pullTBA={pullTBA}
              pitTeams={pitTeams}
            />
          }
        />
        <Route
          path="/pit"
          element={
            <PitScoutingForm
              prepareTeamPayload={prepareTeamPayload}
              competition={competition}
              triggerHaptic={triggerHaptic}
              setPitTeams={setPitTeams}
            />
          }
        />
        <Route
          path="/match"
          element={
            <MatchScoutingForm
              pit={pit}
              fetchData={fetchData}
              competition={competition}
              tablet={tablet}
              triggerHaptic={triggerHaptic}
              matches={matches}
              setMatches={setMatches}
              TBAdata={TBAdata}
            />
          }
        />
        <Route
          path="/leaderboard"
          element={
            <Leaderboard
              day1Ct={50}
              fetchData={fetchData}
              compData={TBAdata}
              teamData={TBAteams}
            />
          }
        />
        <Route
          path="/teamlookup"
          element={
            <TeamLookup
              competition={competition}
              fetchData={fetchData}
              compData={TBAdata}
              teamData={TBAteams}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;