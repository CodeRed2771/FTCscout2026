import { useState } from 'react'
import '../css/App.css'
import play from "../assets/icons/play.svg"
import restart from "../assets/icons/restart.svg"
import pause from "../assets/icons/pause.svg"

function MatchClock({ timer, disabled, isActive, setIsActive, resetMatch, togglePause, isPaused }) {
    let minutes;
    let seconds;

    if (timer < 30) {
        minutes = 0;
        seconds = 30 - timer;
    } else {
        const cdtime = 150 - timer;
        seconds = cdtime % 60;
        minutes = (cdtime - seconds) / 60;
    }

    const giveZeroes = (num) => {
        if (String(num).length === 1) {
            return "0" + num;
        } else {
            return num;
        }
    }

    return (
        <div className={"clockContainer"} style={{ display: disabled ? "none" : "flex" }}>
            <div className={"clock-controls" + " clock-" + isActive}>
                <button
                    type="button"
                    onClick={togglePause}
                    disabled={!isActive} // Disabled if the timer hasn't started yet
                    className="clock-button"
                >
                    {isPaused ? <img src={play}></img> : <img src={pause}></img>}
                </button>
                <div className="clock">
                    {minutes}:{giveZeroes(seconds)}
                </div>
                <button
                    type="button"
                    onClick={resetMatch}
                    className="clock-button"
                >
                    <img src={restart}></img>
                </button>
            </div>
            <button className="startbutton" style={{ display: isActive ? "none" : "flex" }} onClick={() => { setIsActive(true) }}>Start Match</button>
        </div>
    )
}

export default MatchClock;