import { useState, useEffect } from 'react';
import '../../css/App.css';
import useLocalStorage from '../../utils/useLocalStorage';
import PageNav from '../../components/PageNav';
import check from '../../assets/icons/check.svg';
import close from '../../assets/icons/close.svg';
import TextInput from '../../components/inputs/Text';
import { useNavigate } from 'react-router-dom';

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

    const lookup = (data, comp) => {
        // Find matching team in the pit array for the current competition location
        const pitList = data?.pit || [];
        const matchedTeam = pitList.find(
            (entry) =>
                String(entry["Team Number"]).trim() === String(searchTeam).trim() &&
                entry["Location"] === comp
        );

        // Helper to render "Yes"/"No" as your imported icons, or fallback to plain text
        const renderStatValue = (val) => {
            if (val === "Yes") return <img src={check} alt="Yes" className="stat-icon" />;
            if (val === "No") return <img src={close} alt="No" className="stat-icon" />;
            return val !== "" && val !== null && val !== undefined ? val : "N/A";
        };

        return (
            <div className="team-lookup-container">
                <div className="input-group">
                <div className="search-bar" style={{ marginBottom: "20px" }}>
                    {/* Standard input used here; swap props if your custom TextInput uses different prop names */}
                    <input
                        type="number"
                        placeholder="Enter Team Number..."
                        value={searchTeam}
                        onChange={(e) => setSearchTeam(e.target.value)}
                        className="team-search-input"
                        style={{width: "400px"}}
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
                                // Skip Team Number in the list since it's already in the header
                                if (key === "Team Number") return null;

                                return (
                                    <div key={key} className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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

    return (
        <>
            <div className="leaderboard-page tuff-load">
                <h1 style={{ letterSpacing: "5px" }}>Stats</h1>
                <div className="input-group selectButtons"></div>
                <div className="content-container">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : (
                        <>
                            {currentPage === "TeamLookup" && lookup(data, comp)}
                        </>
                    )}
                </div>
            </div>

            <PageNav disabled={{ nextBtn: true }} nextButton={true} handleBack={handleBack} backText={backText} handleNext={handleNext} />
        </>
    );
}

export default Leaderboard;