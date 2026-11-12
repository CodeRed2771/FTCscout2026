import { useState } from 'react'
import '../../../css/App.css'
import TextInput from '../../../components/inputs/Text.jsx'
import NumberInput from '../../../components/inputs/Num.jsx'
import SelectButtons from '../../../components/inputs/SelectButton.jsx'
import Counter from '../../../components/inputs/Counter.jsx'
import Button from '../../../components/inputs/Button.jsx'
import StartPos from '../../../assets/startpos.jpg'

function Form({formData: formData, setFormData: setFormData, submitMatch, disabled, matchTimer}) {
  return (
    <div className="input-page">
        <h1>Pit Scouting</h1>
        <TextInput 
            label="Scouter" 
            value={formData.scouter} 
            onChange={(val) => setFormData({...formData, scouter: val})} 
        />
        <NumberInput 
            label="Team Number" 
            value={formData.teamNum} 
            onChange={(val) => setFormData({...formData, teamNum: val})} 
        />

        <SelectButtons
          label="Drive Train"
          values={["Mecanum", "Tank", "Other"]}
          selected={formData.driveTrain}
          onClick={(val) => {setFormData({...formData, driveTrain: val})}}
        />

        <NumberInput 
            label="Max Game Piece Capacity" 
            value={formData.capacity} 
            onChange={(val) => setFormData({...formData, capacity: val})} 
        />

        <SelectButtons
          label="Can They Score in the Hive?"
          values={["No", "Yes"]}
          selected={formData.hive}
          onClick={(val) => {setFormData({...formData, hive: val})}}
        />

        <SelectButtons
          label="Can They Score in the Flower?"
          values={["No", "Yes"]}
          selected={formData.flower}
          onClick={(val) => {setFormData({...formData, flower: val})}}
        />

        <SelectButtons
          label="Can They Leave In Auto?"
          values={["No", "Yes"]}
          selected={formData.autoLeave}
          onClick={(val) => {setFormData({...formData, autoLeave: val})}}
        />

        <SelectButtons
          label="Can They Park In Auto?"
          values={["No", "Yes"]}
          selected={formData.autoPark}
          onClick={(val) => {setFormData({...formData, autoPark: val})}}
        />
        

        <Button
            label="Submit Match"
            onClick={submitMatch}
            type="submit"
        />
    </div>
  )
}

export default Form