import { useState, useEffect, useMemo } from 'react'
import '../../css/App.css'
import useLocalStorage from '../../utils/useLocalStorage';
import PageNav from '../../components/PageNav'
import check from '../../assets/icons/check.svg';
import close from '../../assets/icons/close.svg';

function Leaderboard({fetchData, compData, teamData}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comp, setComp] = useState("Kentwood");
    const [currentPage, setCurrentPage] = useLocalStorage('statscurrentPage', "Leaderboard");
    const [backText, setBackText] = useLocalStorage('backText',"Back To Main");
    
    function getDayOneMatchCount(matchData) {
        if (!matchData || matchData.length === 0) return 0;

        // 1. Sort matches by time to ensure we find the true start
        const sortedMatches = [...matchData].sort((a, b) => a.time - b.time);

        // 2. Get the start time of the very first match
        const firstMatchTime = sortedMatches[0].time;

        // 3. Define the threshold for "Day 1" 
        // (14 hours is a safe buffer to cover a full day of play without hitting Day 2)
        const fourteenHoursInSeconds = 14 * 60 * 60;
        const dayOneEndThreshold = firstMatchTime + fourteenHoursInSeconds;

        // 4. Filter and count
        const dayOneMatches = sortedMatches.filter(match => match.time < dayOneEndThreshold);

        return dayOneMatches.length;
    }

    const day1Ct = getDayOneMatchCount(compData);

    const backToMain = () => {
        window.location = "/"
    }

    const handleNext = () => {
        if(currentPage != pages.length - 1) {
        setCurrentPage(currentPage + 1);
        setBackText("Back")
        } if(currentPage === pages.length - 2) {
        setDisabled({...disabled, nextBtn: true})
        }
    }

    const handleBack = () => {
        backToMain();
    };

    useEffect(() => {
        // 1. Create the async wrapper
        const executeFetch = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 2. Call the function passed via props
            const result = await fetchData();
            setData(result);
            console.log(result);
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
        };

        executeFetch();

        // 3. Add fetchRemoteData to the dependency array
    }, [fetchData]);

    const processedData = useMemo(() => {
        if (!data) return { compSorted: [], scoutedKeys: new Set() };

        // 1. Combine data once
        const allEntries = [...(data.match || []), ...(data.hp || [])];

        // 2. Filter by competition once
        const compSorted = comp === "Overall" 
            ? allEntries 
            : allEntries.filter(item => item["Location"] === comp);

        // 3. Create a Lookup Set (The Secret Sauce)
        // We store strings like "12-254" (Match-Team) for O(1) instant lookup
        const scoutedKeys = new Set();
        compSorted.forEach(entry => {
            const matchNum = entry["Match #"] || entry["Match Number"];
            const teamNum = entry["Team #"];
            const alliance = entry["Alliance"];

            if (matchNum && teamNum) scoutedKeys.add(`team-${matchNum}-${teamNum}`);
            if (matchNum && alliance) scoutedKeys.add(`hp-${matchNum}-${alliance}`);
        });

        return { compSorted, scoutedKeys };
    }, [data, comp]);

    const { compSorted, scoutedKeys } = processedData;

    const lead = (compdata, compparam) => {
        let compSorted = [];
        let dat = []

        compdata.match.forEach((item) => {dat.push(item)})
        compdata.pit.forEach((item) => {dat.push(item)})

        if(compparam === "Overall") {
            compSorted = dat;
        } else {
            dat.forEach((item) => {
                if(item["Location"] === compparam) compSorted.push(item)
            });
        }

        let scouterSorted = {};

        compSorted.forEach((item) => {
            if(scouterSorted[item.Scouter]) {
                scouterSorted[item.Scouter] += 1;
            } else {
                scouterSorted[item.Scouter] = 1;
            }
        })

        let place = 0;

        if (!compSorted[0]) return "There is no data for this competition yet..."
    
        return (
            <div className="stat-page"><h1>Leaderboard</h1>
            <div className="input-group">
                <label>Competition:</label>
                <select onChange={(e) => setComp(e.target.value)}>
                    <option value="Kentwood">Kentwood</option>
                    <option value="Muskegon">Fruitport</option>
                    <option value="Overall">Overall</option>
                </select>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Scouter</th>
                    <th>Matches Scouted</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(scouterSorted)
                    .sort(([, a], [, b]) => b - a) // Sorts by count, descending
                    .map(([name, count], index) => (
                    <tr key={name}>
                        <td style={{fontWeight: 800}}>{index + 1}</td>
                        <td>{name}</td>
                        <td style={{fontWeight: 600}}>{count}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>
            );
    }

    const progress = (compdata, compparam) => {
        let compSorted = [];
        let pitSorted = [];
        let dat = [];
        let pitdat = []

        let truncatedCompData = compData.slice(0, -12);

        compdata.match.forEach((item) => {dat.push(item)})
        compdata.hp.forEach((item) => {dat.push(item)})
        compdata.pit.forEach((item) => {pitdat.push(item)})

        if(compparam === "Overall") {
            compSorted = dat;
            pitSorted = pitdat;
        } else {
            pitdat.forEach((item) => {
                if(item["Location"] === compparam) pitSorted.push(item)
            });
            dat.forEach((item) => {
                if(item["Location"] === compparam) compSorted.push(item)
            });
        }

        if (!teamData[0]) return "There is no data for this competition yet..."
    
        let matchCt = truncatedCompData.length

        let scoutedCt = compSorted.length

        let totalProgress = Math.round(scoutedCt / (matchCt * 8) * 100) 
        let day1Progress = Math.round(scoutedCt / (day1Ct * 8) * 100)

        let pitCt = teamData.length
        let pitScoutedCt = pitSorted.length;

        let totalPitProgress = Math.round((pitScoutedCt / pitCt) * 100)

        console.log(teamData)

        return (
            <div className="stat-page" style={{marginBottom: "50px"}}>
                <h1>Scouting Progress</h1>
                <div className="prog-page" style={{height: "60px"}} onClick={(e) => 
                    {
                        if(e.currentTarget.style.height === "60px") {
                            e.currentTarget.style.height = "auto"
                        } else {
                            e.currentTarget.style.height = "60px"
                        }
                    }
                }>
                <h2>Match Scouting Progress</h2>
                <div className="progBar">
                    <p>Total progress:</p> 
                    <input type="range" onChange={(e)=>{}} min="0" max="100" style={{pointerEvents: "none"}} value={totalProgress}></input>
                    <p>{totalProgress}%</p>
                </div>
                
                <div className="progBar">
                    <p>Day 1 progress:</p> 
                    <input type="range" onChange={(e)=>{}} min="0" max="100" style={{pointerEvents: "none"}} value={day1Progress}></input>
                    <p>{day1Progress}%</p>
                </div>

                <table className="progressTable">
                    <thead>
                    <tr>
                        <th>Match</th>
                        <th>Red</th>
                        <th>Blue</th>
                    </tr>
                    </thead>
                    <tbody>
                    {truncatedCompData
                    .map((match, index) => (
                        <tr key={index}>
                            <td>{match.match_number}</td>
                            <td style={{color: "#ff8686"}}>
                            <div 
                            style={{display: 'flex',flexDirection: "row",fontSize: "0"}}
                            onClick={(e) => { 
                                if(e.currentTarget.style.flexDirection === "column") {
                                    e.currentTarget.style.flexDirection = "row";
                                    e.currentTarget.style.fontSize = "0";
                                } else {
                                    e.currentTarget.style.flexDirection = "column";
                                    e.currentTarget.style.fontSize = "18px";
                                }

                            }} className="cells">{
                            match.alliances.red.team_keys.map((item) => (
                                <div key={item} className="team-card">
                                    <img 
                                        style={{display: compSorted.some(entry => entry["Match #"] === Number(match.match_number) && entry["Team #"] === Number(item.substring(3))) ? "flex" : "none"}}
                                        src={check}
                                    ></img>
                                    <img 
                                        style={{display: compSorted.some(entry => entry["Match #"] === Number(match.match_number) && entry["Team #"] === Number(item.substring(3))) ? "none" : "flex"}}
                                        src={close}
                                    ></img>
                                    {item.substring(3)}
                                </div>
                            ))}
                            <div style={{backgroundColor: "#5f4b4b"}} className="team-card">
                                <img 
                                    style={{display: compSorted.some(entry => entry["Match Number"] === Number(match.match_number) && entry["Alliance"] === "Red") ? "flex" : "none"}}
                                    src={check}
                                ></img>
                                <img 
                                    style={{display: compSorted.some(entry => entry["Match Number"] === Number(match.match_number) && entry["Alliance"] === "Red") ? "none" : "flex"}}
                                    src={close}
                                ></img>
                                H. Player
                            </div></div>
                            </td>
                            <td style={{color: "#90acff"}}>
                            <div 
                            style={{display: 'flex',flexDirection: "row",fontSize: "0"}}
                            onClick={(e) => { 
                                if(e.currentTarget.style.flexDirection === "column") {
                                    e.currentTarget.style.flexDirection = "row";
                                    e.currentTarget.style.fontSize = "0";
                                } else {
                                    e.currentTarget.style.flexDirection = "column";
                                    e.currentTarget.style.fontSize = "18px";
                                }

                            }} className="cells">{
                            match.alliances.blue.team_keys.map((item) => (
                                <div key={item} className="team-card">
                                    <img 
                                        style={{display: compSorted.some(entry => entry["Match #"] === Number(match.match_number) && entry["Team #"] === Number(item.substring(3))) ? "flex" : "none"}}
                                        src={check}
                                    ></img>
                                    <img 
                                        style={{display: compSorted.some(entry => entry["Match #"] === Number(match.match_number) && entry["Team #"] === Number(item.substring(3))) ? "none" : "flex"}}
                                        src={close}
                                    ></img>
                                    {item.substring(3)}
                                </div>
                            ))}
                            <div style={{backgroundColor: "#4b505f"}} className="team-card">
                                <img 
                                    style={{display: compSorted.some(entry => entry["Match Number"] === Number(match.match_number) && entry["Alliance"] === "Blue") ? "flex" : "none"}}
                                    src={check}
                                ></img>
                                <img 
                                    style={{display: compSorted.some(entry => entry["Match Number"] === Number(match.match_number) && entry["Alliance"] === "Blue") ? "none" : "flex"}}
                                    src={close}
                                ></img>
                                H. Player
                            </div></div>
                            </td>
                        </tr>
                        ))
                    }
                    </tbody>
                </table>
                </div>
                <div className="prog-page" style={{height: "60px"}} onClick={(e) => 
                    {
                        if(e.currentTarget.style.height === "60px") {
                            e.currentTarget.style.height = "auto"
                        } else {
                            e.currentTarget.style.height = "60px"
                        }
                    }
                }>
                    <h2>Pit Scouting Progress</h2>
                    <div className="progBar">
                        <p>Total progress:</p> 
                        <input type="range" onChange={(e)=>{}} min="0" max="100" style={{pointerEvents: "none"}} value={totalPitProgress}></input>
                        <p>{totalPitProgress}%</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Team Number</th>
                                <th>Scouted</th>
                            </tr>
                            </thead>
                            <tbody>
                            {teamData
                                .map((team) => (
                                <tr key={team.team_number}>
                                    <td style={{fontWeight: 800}}>{team.nickname}</td>
                                    <td>{team.team_number}</td>
                                    <td style={{fontWeight: 600}}>
                                        <img 
                                            style={{display: pitSorted.some(entry => entry["Team Number"] === Number(team.team_number)) ? "flex" : "none"}}
                                            src={check}
                                        ></img>
                                        <img 
                                            style={{display: pitSorted.some(entry => entry["Team Number"] === Number(team.team_number)) ? "none" : "flex"}}
                                            src={close}
                                        ></img>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                </div>
            </div>
            );
    }

    const schedule = (compData) => {
        if (!compData[0]) return "There is no data for this competition yet..."
    
        let filteredMatchData = compData.filter((match) => {return match.alliances.red.team_keys.includes("frc2771") || match.alliances.blue.team_keys.includes("frc2771")});

        return (
            <div className="stat-page"><h1>
                Match Schedule
            </h1>
            <table className="schedule-table">
                <thead>
                <tr>
                    <th>Match</th>
                    <th>Red</th>
                    <th>Blue</th>
                </tr>
                </thead>
                <tbody>
                {
                    filteredMatchData.map((match, index) => (
                    <tr key={match.match_number} style={{borderTop: match.match_number > day1Ct && filteredMatchData[index - 1].match_number < day1Ct ? "2px dashed #ff8080" : "0"}}>
                        <td>{match.match_number}</td>
                        <td style={{color: "#ff8686"}}>
                            <div 
                            style={{display: 'flex',flexDirection: "row"}} className="cells">{match.alliances.red.team_keys.map((team) => (
                            <div key={team} style={{backgroundColor: "#5f4b4b", fontWeight: team == "frc2771" ? 900 : 400, textDecoration: team == "frc2771" ? "underline" : "none"}} className="team-card">
                                {team.substring(3)}
                            </div>
                        ))}</div></td>
                        <td style={{color: "#90acff"}}>
                            <div 
                            style={{display: 'flex',flexDirection: "row"}} className="cells">{match.alliances.blue.team_keys.map((team) => (
                            <div key={team} style={{backgroundColor: "#4b505f", fontWeight: team == "frc2771" ? 900 : 400, textDecoration: team == "frc2771" ? "underline" : "none"}} className="team-card">
                                {team.substring(3)}
                            </div>
                        ))}</div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>
            );
    }

    return (
        <>
        <div className="leaderboard-page tuff-load">
            <h1 style={{letterSpacing: "5px"}}>Stats</h1>
            <div className="input-group selectButtons">
                <div className="select-buttons stats-nav">
                    {["Leaderboard", "Progress", "Match Schedule"].map((value) => {
                        return (
                        <button className={(value === currentPage ? "buttonSelected stat-nav-btn" : "stat-nav-btn")} key={value} onClick={(e) => setCurrentPage(value)}>{value}</button>
                        )
                    })}
                </div>
            </div>
            <div className="content-container">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <>
                        {currentPage === "Leaderboard" && lead(data, comp)}
                        {currentPage === "Progress" && "ngl i didn't have time to make this one"}
                        {currentPage === "Match Schedule" && "this one either"}
                    </>
                )}
            </div>
        </div>

       <PageNav disabled={{nextBtn: true}} nextButton={true} handleBack={handleBack} backText={backText} handleNext={handleNext}/>
        </>
    );
}

export default Leaderboard