import { useState } from 'react'
import { Link } from 'react-router-dom';
import logo from './assets/logo.jpeg'
import './css/App.css'
import useLocalStorage from './utils/useLocalStorage';
import send from './assets/icons/send.svg';
import leaderboard from './assets/icons/leaderboard.svg';

function MainMenu({uploadData, matches, hpMatches, pullTBA, pitTeams, setTablet, tablet}) {

  return (
    <div className="main-menu tuff-load">
        <img className="logo-main" src={logo}></img>

        <nav className="nav-btns tuff-load">
            <Link to="/match" className="nav-btn">Match Scout</Link>
            <Link to="/pit" className="nav-btn">Pit Scout</Link>
            <div className="nav-btn-container">
              <button className="nav-btn" id="send" onClick={() => uploadData(matches, hpMatches, pitTeams)}><img src={send}></img></button>
              {
                //<button className="nav-btn" onClick={() => pullTBA("2026miken")}>Pull TBA matches</button>
              }
              <select value={tablet} onChange={(e) => { setTablet(e.target.value); }} className="tabID"> 
                <option value="Red 1">Red 1</option>
                <option value="Red 2">Red 2</option>
                <option value="Blue 1">Blue 1</option>
                <option value="Blue 2">Blue 2</option>
                <option value="Red Human Player">Red Human Player</option>
                <option value="Blue Human Player">Blue Human Player</option>
              </select>
            </div>
        </nav>
    </div>
  )
}

export default MainMenu;