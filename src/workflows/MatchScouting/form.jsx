import { useState, useEffect } from 'react'
import PageNav from '../../components/PageNav'
import MatchClock from '../../components/MatchClock'
import PreMatch from './pages/PreMatch'
import Auto from './pages/Auto'
import Teleop from './pages/Teleop'
import PostMatch from './pages/PostMatch'
import '../../css/App.css'
import useLocalStorage from '../../utils/useLocalStorage';
import { useNavigate } from 'react-router-dom';

function MatchScoutingForm({pit, fetchData, matches, setMatches, TBAdata, triggerHaptic, tablet, competition}) {  
  let alliance = tablet.substring(0, 4).replaceAll(' ', '') || "";
  let robot = tablet.substring(4,6).replaceAll(' ', '') || "";
  const navigate = useNavigate();
  const [error, setError] = useState(null);



  const submitMatch = async () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxqsBJcoAQnt5eVNcR9wtEqkTosnWKIh9DD6X7wT7KNDX8astZBHS1GBEV8CMvz8y0N/exec";
    const payload = {
      matchData: [formData],
      hpData: [],
      pitData: []
    };
    
    setFormData({
      scouter: formData.scouter,
      teamNum: TBAdata[formData.matchNum]?.teams.find((team) => team.alliance === alliance && team.allianceRole === (robot === "1" ? "Captain" : "FirstPick"))?.teamNumber || "",
      alliance: alliance,
      matchNum: Number(formData.matchNum) + 1,
      auto: {
        hiveNectar: 0,
        hivePollen: 0,
        cycles: {
          hiveNectar: [],
          hivePollen: [],
        },
        leave: -1,
        park: -1,
      },
      teleop: {
        hiveNectar: 0,
        flowerNectar: 0,
        hivePollen: 0,
        flowerPollen: 0,
        gardenNectar: 0,
        gardenPollen: 0,
        cycles: {
          hiveNectar: [],
          flowerNectar: [],
          hivePollen: [],
          flowerPollen: [],
          gardenNectar: [],
          gardenPollen: [],
        },
        park: -1,
      },
      comments:"",
      location: competition,
    });
    
    setDisabled({
      autoFuel: false,
      autoCycle: true,
      autoClimb: false,
      nextBtn: false,
      autoClimbDetails: true,
      teleFuel: false,
      teleCycle: true,
      teleClimb: false,
      teleClimbDetails: true,
      defenseRating: true
    });
    
    setCurrentPage(0);
    setMatchTimer(0);
    setIsActive(false);
    setIsPaused(false);
    setBackText("Back To Main")

    triggerHaptic();
    
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
      setMatches(prevMatches => [...prevMatches, formData]);

      console.log("Upload failed:", error);
    }
  }

  const [formData, setFormData] = useLocalStorage('matchformData',
    {
      scouter: "",
      teamNum: TBAdata[0]?.teams.find((team) => team.alliance === alliance && team.allianceRole === (robot === "1" ? "Captain" : "FirstPick"))?.teamNumber || "",
      alliance: alliance,
      matchNum: 1,
      auto: {
        hiveNectar: 0,
        hivePollen: 0,
        cycles: {
          hiveNectar: [],
          hivePollen: [],
        },
        leave: -1,
        park: -1,
      },
      teleop: {
        hiveNectar: 0,
        flowerNectar: 0,
        hivePollen: 0,
        flowerPollen: 0,
        gardenNectar: 0,
        gardenPollen: 0,
        cycles: {
          hiveNectar: [],
          flowerNectar: [],
          hivePollen: [],
          flowerPollen: [],
          gardenNectar: [],
          gardenPollen: [],
        },
        park: -1,
      },
      comments:"",
      location: competition,
    }
  );

  useEffect(() => {
    setFormData({
      scouter: formData.scouter || "",
      teamNum: TBAdata[0]?.teams.find((team) => team.alliance === alliance && team.allianceRole === (robot === "1" ? "Captain" : "FirstPick"))?.teamNumber || "",
      alliance: alliance || "",
      matchNum: 1,
      auto: {
        hiveNectar: 0,
        hivePollen: 0,
        cycles: {
          hiveNectar: [],
          hivePollen: [],
        },
        leave: -1,
        park: -1,
      },
      teleop: {
        hiveNectar: 0,
        flowerNectar: 0,
        hivePollen: 0,
        flowerPollen: 0,
        gardenNectar: 0,
        gardenPollen: 0,
        cycles: {
          hiveNectar: [],
          flowerNectar: [],
          hivePollen: [],
          flowerPollen: [],
          gardenNectar: [],
          gardenPollen: [],
        },
        park: -1,
      },
      comments:"",
      location: competition,
    }); 
  }, [TBAdata] ); 

  const [disabled, setDisabled] = useLocalStorage('disabled', {
    hiveNectar: false,
    hivePollen: false,
    flowerNectar: false,
    flowerPollen: false,
  });

  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 0);
  const [backText, setBackText] = useLocalStorage('backText',"Back To Main");
  const [matchTimer, setMatchTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // New state to track if the match has completed
  const [isPaused, setIsPaused] = useState(false); // New state to handle the pause

  let pages = [
    <PreMatch pit={pit} alliance={alliance} robot={robot} isActive={isActive} disabled={disabled} setDisabled={setDisabled} formData={formData} setFormData={setFormData} TBAdata={TBAdata}/>,
    <Auto matchTimer={matchTimer} isActive={isActive} disabled={disabled} setDisabled={setDisabled} formData={formData} setFormData={setFormData}/>,
    <Teleop isCompleted={isCompleted} matchTimer={matchTimer} isActive={isActive} disabled={disabled} setDisabled={setDisabled} formData={formData} setFormData={setFormData}/>,
    <PostMatch isCompleted={isCompleted} submitMatch={submitMatch} isActive={isActive} disabled={disabled} setDisabled={setDisabled} formData={formData} setFormData={setFormData}/>
  ]

  const backToMain = () => {
    navigate('/');
  } // Track if timer is running

  useEffect(() => {
    let interval = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setMatchTimer((prev) => {
          // 1. Handle the 20-second pause
          if (prev === 29) { // We check at 29 so the '30' renders and then stays
            setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
              setCurrentPage(2);
            }, 8000);
            return 30;
          }

          // 2. Check if we've reached the final limit
          if (prev >= 150) {
            setIsActive(false);
            setIsCompleted(true);
            return prev;
          }

          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Logic to decide which "page" object to render
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

  // Toggles the pause state on and off
  const togglePause = () => {
    // Only allow pausing if the match has actually started
    if (isActive) {
      setIsPaused(!isPaused);
    }
  };

  // Resets the entire match to its initial state without incrementing the match number
  const resetMatch = () => {
    if (window.confirm("Are you sure you want to reset the match? All current data will be lost.")) {
      setFormData({
        scouter: formData.scouter,
        teamNum: TBAdata[formData.matchNum - 1]?.teams.find((team) => team.alliance === alliance && team.allianceRole === (robot === "1" ? "Captain" : "FirstPick"))?.teamNumber || "",
        alliance: alliance,
        matchNum: Number(formData.matchNum),
        auto: {
          hiveNectar: 0,
          hivePollen: 0,
          cycles: {
            hiveNectar: [],
            hivePollen: [],
          },
          leave: -1,
          park: -1,
        },
        teleop: {
          hiveNectar: 0,
          flowerNectar: 0,
          hivePollen: 0,
          flowerPollen: 0,
          gardenNectar: 0,
          gardenPollen: 0,
          cycles: {
            hiveNectar: [],
            flowerNectar: [],
            hivePollen: [],
            flowerPollen: [],
            gardenNectar: [],
            gardenPollen: [],
          },
          park: -1,
        },
        comments:"",
        location: competition,
      });
      setDisabled({
        autoFuel: false,
        autoCycle: true,
        autoClimb: false,
        nextBtn: false,
        autoClimbDetails: true,
        teleFuel: false,
        teleCycle: true,
        teleClimb: false,
        teleClimbDetails: true,
        defenseRating: true
      });
      setCurrentPage(0);
      setMatchTimer(0);
      setIsActive(false);
      setIsCompleted(false);
      setIsPaused(false);
      setBackText("Back To Main");
    }
  };

return (
    <>
      <div className="form tuff-load">
        {
          TBAdata.length > 0 ? (
            <>
              <MatchClock isCompleted={isCompleted} setIsCompleted={setIsCompleted} disabled={(currentPage == 0)} timer={matchTimer} isActive={isActive} setIsActive={setIsActive} togglePause={togglePause} resetMatch={resetMatch} isPaused={isPaused}/>

              {renderPage()}
            </>
          ) : "There's no FTCscout data for this competition yet!"
        }

      </div>

      <PageNav disabled={disabled} handleBack={handleBack} backText={backText} handleNext={handleNext}/>
    </>
  )
}

export default MatchScoutingForm