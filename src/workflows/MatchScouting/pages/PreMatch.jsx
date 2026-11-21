import { useState } from 'react'
import '../../../css/App.css'
import TextInput from '../../../components/inputs/Text.jsx'
import NumberInput from '../../../components/inputs/Num.jsx'
import SelectButtons from '../../../components/inputs/SelectButton.jsx'
import Counter from '../../../components/inputs/Counter.jsx'
import StartPos from '../../../assets/startpos.jpg'

function PreMatch({pit, formData, setFormData, alliance, robot, TBAdata}) {
  return (
    <div className="input-page">
        <h1>Pre-Match</h1>

        <NumberInput label="Match Number" value={formData.matchNum} onChange={(val) => setFormData({...formData, matchNum: val, teamNum: TBAdata[val - 1] ? TBAdata[val - 1]["teams"].find((team) => team.alliance === alliance && team.allianceRole === (robot === "1" ? "Captain" : "FirstPick"))?.teamNumber || "" : ""})} />
        <TextInput label="Scouter Name" value={formData.scouter} onChange={(val) => setFormData({...formData, scouter: val})} />
        <div className="input-group">
          <label>Team Number:</label>
          <h1 style={{color: alliance === "Red" ? "rgb(255, 120, 120)" : "rgb(120, 120, 255)", fontWeight: 600, border: "1px solid white", borderRadius: "5px", textAlign: "center", backgroundColor: "#2a2a2b"}}>{formData.teamNum || "---"}</h1>
        </div>

        {
          pit.length > 0 && (
            <>
              <label>Team Photo:</label>
              <img className="robotpic" src={JSON.parse(pit.find((i) => String(i["Team Number"]) == String(formData.teamNum))?.Image || "{}")?.image} alt="Team Does Not Have a Photo" />
            </>
          )
        }
      </div>
  )
}

export default PreMatch