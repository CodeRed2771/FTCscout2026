import { useState } from 'react'
import '../../../css/App.css'
import TextInput from '../../../components/inputs/Text.jsx'
import NumberInput from '../../../components/inputs/Num.jsx'
import SelectButtons from '../../../components/inputs/SelectButton.jsx'
import Counter from '../../../components/inputs/Counter.jsx'
import Button from '../../../components/inputs/Button.jsx'
import OBSSI from '../../../components/inputs/OBSSI.jsx'

import nectar from '../../../assets/nectar.png'
import pollen from '../../../assets/pollen.png'

function Auto({disabled, setDisabled, formData, setFormData, isActive, matchTimer}) {
  return (
    <div className="input-page auto-page">
        <h1>Auto</h1>
        <div className={"input-row " + (isActive && matchTimer <= 30 ? "" : "disabled")}>
          
        <div className="input-column">
            <div className="input-column-header">
              <img src={nectar} alt="Nectar"/>
            </div>

            <OBSSI 
              label={"Nectar Scored in Hive"}
              count={formData.auto.hiveNectar}
              increment={() => setFormData({...formData, auto: {...formData.auto, hiveNectar: formData.auto.hiveNectar + 1, cycles: {...formData.auto.cycles, hiveNectar: [...formData.auto.cycles.hiveNectar, matchTimer]}}})}
              decrement={() => setFormData({...formData, auto: {...formData.auto, hiveNectar: Math.max(formData.auto.hiveNectar - 1, 0), cycles: {...formData.auto.cycles, hiveNectar: formData.auto.cycles.hiveNectar.slice(0, -1)}}})}
            />
          </div>

          {/* Column 2: All Pollen Scoring */}
          <div className="input-column">
            <div className="input-column-header">
              <img src={pollen} alt="Pollen"/>        
            </div>

            <OBSSI
              label={"Pollen Scored in Hive"}
              count={formData.auto.hivePollen}
              increment={() => setFormData({...formData, auto: {...formData.auto, hivePollen: formData.auto.hivePollen + 1, cycles: {...formData.auto.cycles, hivePollen: [...formData.auto.cycles.hivePollen, matchTimer]}}})}
              decrement={() => setFormData({...formData, auto: {...formData.auto, hivePollen: Math.max(formData.auto.hivePollen - 1, 0), cycles: {...formData.auto.cycles, hivePollen: formData.auto.cycles.hivePollen.slice(0, -1)}}})}
            />
          </div>
        </div>  

        <div className="input-row">
          <button onClick={() => setFormData({...formData, auto: {...formData.auto, leave: -1}})} className={(!isActive || matchTimer > 30) || formData.auto.leave === -1 ? "disabled undo" : "undo"}>
            Undo Leave
          </button>
          <Button label="Leave" onClick={() => setFormData({...formData, auto: {...formData.auto, leave: matchTimer}})} disabled={(!isActive || matchTimer > 30) || formData.auto.leave !== -1}/>
          
        </div>
        <div className="input-row">
          <button onClick={() => setFormData({...formData, auto: {...formData.auto, park: -1}})} className={(!isActive || matchTimer > 30) || formData.auto.park === -1 ? "disabled undo" : "undo"}>
            Undo Park
          </button>
          <Button label="Park" onClick={() => setFormData({...formData, auto: {...formData.auto, park: matchTimer}})} disabled={(!isActive || matchTimer > 30) || formData.auto.park !== -1}/>
        </div>
      </div>
  )
}

export default Auto