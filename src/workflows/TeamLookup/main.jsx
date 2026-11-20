import { useState, useEffect, useMemo } from 'react';
import '../../css/App.css';
import useLocalStorage from '../../utils/useLocalStorage';
import PageNav from '../../components/PageNav';
import check from '../../assets/icons/check.svg';
import close from '../../assets/icons/close.svg';
import TextInput from '../../components/inputs/Text';
import { useNavigate } from 'react-router-dom';
import { buildPickList } from '../../utils/biobuzzAnalytics';

function Leaderboard({ fetchData, compData, teamData }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [comp, setComp] = useState("Kentwood");
    const [currentPage, setCurrentPage] = useLocalStorage('statpage', "TeamLookup");
    const [backText, setBackText] = useLocalStorage('backText', "Back To Main");

    // State to track the entered team number
    const [searchTeam, setSearchTeam] = useState("");

    // Picklist controls
    const [sortMetric, setSortMetric] = useState("estimatedPoints");
    const [excludedTeams, setExcludedTeams] = useLocalStorage('excludedTeams', []);
    const [hideExcluded, setHideExcluded] = useState(false);

    const backToMain = () => {
        navigate("/");
    };

    const handleBack = () => {
        backToMain();
    };

    const handleNext = () => {};

    useEffect(() => {
        const executeFetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchData();
                setData(result);
            } catch (err) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        executeFetch();
    }, [fetchData]);

    const rankedTeams = useMemo(() => {
        if (!data) return [];
        return buildPickList(data, comp, { alpha: 0.35, sortBy: sortMetric });
    }, [data, comp, sortMetric]);

    const toggleExcludeTeam = (teamNum) => {
        setExcludedTeams((prev) =>
            prev.includes(teamNum) ? prev.filter((t) => t !== teamNum) : [...prev, teamNum]
        );
    };

    const lookup = (data, comp) => {
        const pitList = data?.pit || [];
        const matchedTeam = pitList.find(
            (entry) =>
                String(entry["Team Number"]).trim() === String(searchTeam).trim() &&
                entry["Location"] === comp
        );

        const renderStatValue = (val) => {
            if (val === "Yes") return <img src={check} alt="Yes" className="stat-icon" />;
            if (val === "No") return <img src={close} alt="No" className="stat-icon" />;
            return val !== "" && val !== null && val !== undefined ? val : "N/A";
        };

        return (
            <div className="team-lookup-container">
                <div className="input-group">
                    <div className="search-bar" style={{ marginBottom: "20px" }}>
                        <input
                            type="number"
                            placeholder="Enter Team Number..."
                            value={searchTeam}
                            onChange={(e) => setSearchTeam(e.target.value)}
                            className="team-search-input"
                            style={{ width: "400px" }}
                        />
                    </div>
                </div>

                {!searchTeam.trim() ? (
                    <p>Enter a team number above to view pit stats for {comp}.</p>
                ) : !matchedTeam ? (
                    <p>No pit scouting data found for Team {searchTeam} at {comp}.</p>
                ) : (
                    <div className="pit-stats-card">
                        <h2>Team {matchedTeam["Team Number"]} — Pit Stats</h2>
                        <div className="stats-grid">
                            {Object.entries(matchedTeam).map(([key, value]) => {
                                if (key === "Team Number") return null;

                                return (
                                    <div
                                        key={key}
                                        className="stat-row"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                                        }}
                                    >
                                        <strong>{key}:</strong>
                                        <span>{renderStatValue(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const picklist = (data, comp) => {
        const displayedTeams = hideExcluded
            ? rankedTeams.filter((t) => !excludedTeams.includes(t.team))
            : rankedTeams;

        if (!displayedTeams.length) {
            return <p>No match or pit scouting data found for {comp}.</p>;
        }

        return (
            <div className="picklist-container" style={{ width: "100%", maxWidth: "850px", margin: "0 auto" }}>
                {/* Category Sort & Draft Filter Controls */}
                <div
                    className="picklist-controls"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "18px",
                    }}
                >
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                            { key: "estimatedPoints", label: "Total EPC" },
                            { key: "autoPoints", label: "Auto" },
                            { key: "hivePoints", label: "Hive" },
                            { key: "flowerPoints", label: "Flower" },
                            { key: "gardenPoints", label: "Garden" },
                            { key: "mobilityPoints", label: "Park / Leave" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSortMetric(tab.key)}
                                className={sortMetric === tab.key ? "active" : ""}
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={hideExcluded}
                            onChange={(e) => setHideExcluded(e.target.checked)}
                        />
                        Hide Picked ({excludedTeams.length})
                    </label>
                </div>

                {/* Ranked Team Cards */}
                <div className="picklist-rows" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {displayedTeams.map((entry, idx) => {
                        const isPicked = excludedTeams.includes(entry.team);

                        return (
                            <div
                                key={entry.team}
                                className="pit-stats-card"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    padding: "14px 18px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: "8px",
                                    opacity: isPicked ? 0.45 : 1,
                                    transition: "opacity 0.2s ease",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                                        <span style={{ fontSize: "1.2rem", fontWeight: "bold", opacity: 0.7 }}>
                                            #{idx + 1}
                                        </span>
                                        <span
                                            onClick={() => {
                                                setSearchTeam(entry.team);
                                                setCurrentPage("TeamLookup");
                                            }}
                                            style={{
                                                fontSize: "1.3rem",
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                            }}
                                            title="Click to view Pit Stats"
                                        >
                                            Team {entry.team}
                                        </span>
                                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                                            ({entry.matchesPlayed} {entry.matchesPlayed === 1 ? "match" : "matches"})
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                                {entry.estimatedPoints} pts
                                            </div>
                                            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                                Avg {entry.avgPoints} | Max {entry.maxPoints}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleExcludeTeam(entry.team)}
                                            style={{
                                                padding: "5px 10px",
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {isPicked ? "Restore" : "Cross Off"}
                                        </button>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(5, 1fr)",
                                        gap: "8px",
                                        paddingTop: "8px",
                                        borderTop: "1px solid rgba(255,255,255,0.1)",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    <div>
                                        <span style={{ opacity: 0.65 }}>AUTO: </span>
                                        <strong>{entry.autoPoints}</strong>
                                    </div>
                                    <div>
                                        <span style={{ opacity: 0.65 }}>HIVE: </span>
                                        <strong>{entry.hivePoints}</strong>
                                        <span style={{ opacity: 0.6, fontSize: "0.75rem" }}> ({entry.avgTips} tips)</span>
                                    </div>
                                    <div>
                                        <span style={{ opacity: 0.65 }}>FLOWER: </span>
                                        <strong>{entry.flowerPoints}</strong>
                                    </div>
                                    <div>
                                        <span style={{ opacity: 0.65 }}>GARDEN: </span>
                                        <strong>{entry.gardenPoints}</strong>
                                    </div>
                                    <div>
                                        <span style={{ opacity: 0.65 }}>MOBILITY: </span>
                                        <strong>{entry.mobilityPoints}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="leaderboard-page tuff-load">
                <h1 style={{ letterSpacing: "5px" }}>Stats</h1>
                <div style={{ flex: "0" }} className="selectButtons select-buttons">
                    <button onClick={() => setCurrentPage("TeamLookup")} className={currentPage === "TeamLookup" ? "active" : ""}>
                        Team Lookup
                    </button>
                    <button onClick={() => {
                        if(prompt("Enter the pick list password:") === "ftc8384") {
                            setCurrentPage("PickList")
                        } else {
                            alert("Incorrect password, twin. Access denied.");
                        }
                    }} className={currentPage === "PickList" ? "active" : ""}>
                        Pick List
                    </button>
                </div>
                <div className="content-container">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : (
                        <>
                            {currentPage === "TeamLookup" && lookup(data, comp)}
                            {currentPage === "PickList" && picklist(data, comp)}
                        </>
                    )}
                </div>
            </div>

            <PageNav disabled={{ nextBtn: true }} nextButton={true} handleBack={handleBack} backText={backText} handleNext={handleNext} />
        </>
    );
}

export default Leaderboard;