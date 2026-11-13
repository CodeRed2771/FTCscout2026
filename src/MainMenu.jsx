import { useState } from 'react'
import { Link } from 'react-router-dom';
import logo from './assets/logo.jpeg'
import './css/App.css'
import useLocalStorage from './utils/useLocalStorage';
import send from './assets/icons/send.svg';
import leaderboard from './assets/icons/leaderboard.svg';
import searchIcon from './assets/icons/search.svg';

function MainMenu({uploadData, matches, hpMatches, pullTBA, pitTeams, setTablet, tablet}) {

  return (
    <div className="main-menu tuff-load">
        <img className="logo-main" src={logo}></img>

        <nav className="nav-btns tuff-load">
            <Link to="/match" className="nav-btn">Match Scout</Link>
            <Link to="/pit" className="nav-btn">Pit Scout</Link>
            <div className="nav-btn-container">
              <button className="nav-btn" id="send" onClick={() => uploadData(matches, hpMatches, pitTeams)}><img src={send}></img></button>
              <Link to="/teamlookup" className="nav-btn"><img src={searchIcon} /></Link>
              {
                //<button className="nav-btn" onClick={() => pullTBA("2026miken")}>Pull TBA matches</button>
              }
              <Link to="/leaderboard" className="nav-btn"><img src={leaderboard} /></Link>
            </div>
        </nav>
    </div>
  )
}

export default MainMenu;