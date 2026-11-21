import { useState } from 'react'
import { Link } from 'react-router-dom';
import logo from './assets/logo.jpeg'
import './css/App.css'
import useLocalStorage from './utils/useLocalStorage';
import send from './assets/icons/send.svg';
import leaderboard from './assets/icons/leaderboard.svg';
import searchIcon from './assets/icons/search.svg';

function MainMenu({competition, setCompetition, uploadData, matches, hpMatches, pullTBA, pitTeams, setTablet, tablet}) {

  return (
    <div className="main-menu tuff-load">
        <img className="logo-main" src={logo}></img>

        <nav className="nav-btns tuff-load">
            <Link to="/match" className="nav-btn">Match Scout</Link>
            <Link to="/pit" className="nav-btn">Pit Scout</Link>
            <div className="nav-btn-container">
              <button className="nav-btn" id="send" onClick={() => uploadData(matches, hpMatches, pitTeams)}><img src={send}></img></button>
              <Link to="/teamlookup" className="nav-btn"><img src={searchIcon} /></Link>
              <Link to="/leaderboard" className="nav-btn"><img src={leaderboard} /></Link>
            </div>
            <div className="nav-btn-container">
              <select value={tablet} onChange={(e) => setTablet(e.target.value)}>
                <option value="Red 1">Red 1</option>
                <option value="Red 2">Red 2</option>
                <option value="Blue 1">Blue 1</option>
                <option value="Blue 2">Blue 2</option>
              </select>
              <select value={competition} onChange={(e) => setCompetition(e.target.value)}>
                <option value="Kentwood">Kentwood</option>
                <option value="Fruitport">Fruitport</option>
                <option value="States">States</option>
                <option value="Practice">Practice</option>
              </select>
            </div>
        </nav>
    </div>
  )
}

export default MainMenu;