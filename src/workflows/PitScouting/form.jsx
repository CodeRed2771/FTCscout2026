import { useState, useEffect } from 'react'
import '../../css/App.css'
import useLocalStorage from '../../utils/useLocalStorage';
import Form from './pages/Form';
import PageNav from '../../components/PageNav'
import MatchClock from '../../components/MatchClock'
import { useNavigate } from 'react-router-dom';

function PitScoutingForm({setPitTeams, triggerHaptic}) {
  const submitMatch = async () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyy4wmiicy637FwQKAycjlo7wBnMfVPvyzCjdpl1SUnh1tGhcyBYSKPwees1qGO0scy/exec";
    const payload = {
      matchData: [],
      hpData: [],
      pitData: [formData]
    };

    triggerHaptic();
    setFormData({
      scouter: formData.scouter,
      teamNum: "",
      driveTrain: "Other",
      capacity: 0,
      flower: "No",
      hive: "No",
      autoLeave: "No",
      autoPark: "No"
    });
    setCurrentPage(0);
    setMatchTimer(0);
    setIsActive(false);
    setIsPaused(false);
    
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script redirects
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Data successfully sent!");
    } catch (error) {
      setPitTeams(prevMatches => [...prevMatches, formData]);

      console.log("Upload failed:", error);
    }


  }

  const [formData, setFormData] = useLocalStorage('pitformData',
    {
      scouter: "",
      teamNum: "",
      driveTrain: "Other",
      capacity: 0,
      autoFuel: 0,
      turret: "",
      climb: "None"
    }
  );

  const togglePause = () => {
    // Only allow pausing if the match has actually started
    if (isActive) {
      setIsPaused(!isPaused);
    }
  };

  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 0);
  const [backText, setBackText] = useLocalStorage('backText',"Back To Main");
  const [matchTimer, setMatchTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // New state to handle the pause
  const [disabled, setDisabled] = useLocalStorage('hpdisabled', {
    shots: true
  });

  useEffect(() => {
    let interval = null;

    if (isActive && !isPaused) {
      setDisabled({...disabled, shots: false});

      interval = setInterval(() => {
        setMatchTimer((prev) => {
          // 1. Handle the 20-second pause
          if (prev === 19) { // We check at 19 so the '20' renders and then stays
            setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
            }, 3000);
            return 20;
          }

          // 2. Check if we've reached the final limit
          if (prev >= 160) {
            setIsActive(false);
            return prev;
          }

          return prev + 1;
        });
      }, 1000);
    } else {
      setDisabled({...disabled, shots: true});

      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  let pages = [
    <Form disabled={disabled} submitMatch={submitMatch} matchTimer={matchTimer} formData={formData} setFormData={setFormData}/>,
  ]

  const backToMain = () => {
    navigate('/');
  }

  const renderPage = () => {
    return pages[currentPage];
  };

  const handleNext = () => {
    if(currentPage != pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setBackText("Back")
    } if(currentPage === pages.length - 2) {
      setDisabled({...disabled, nextBtn: true})
    }
  }

  const handleBack = () => {
    // If we are on the first page, go home
    if (currentPage === 0) {
      backToMain();
    } else {
      // Otherwise, just go to the previous page
      if(currentPage === 1) {
        setBackText("Back To Main")
      }

      setCurrentPage(currentPage - 1);
      setDisabled({...disabled, nextBtn: false})
    }
  };

  const resetMatch = () => {
    if (window.confirm("Are you sure you want to reset the match? All current data will be lost.")) {
      setFormData({
        scouter: formData.scouter,
        teamNum: "",
        driveTrain: "Other",
        capacity: 0,
        flower: "No",
        hive: "No",
        autoLeave: "No",
        autoPark: "No"
      });
      setCurrentPage(0);
      setMatchTimer(0);
      setIsActive(false);
      setIsPaused(false);
    }
  };

  return (
    <>
      <div className="form tuff-load">
        {renderPage()}
      </div>

      <PageNav disabled={{nextBtn: true}} handleBack={handleBack} backText={backText} handleNext={handleNext}/>
    </>
  )
}

export default PitScoutingForm;