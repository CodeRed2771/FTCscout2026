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

function Teleop({disabled, setDisabled, formData, setFormData, isActive, matchTimer}) {
  return (
    <div className="input-page">
      <h1>Teleop</h1>

      <div className={"input-row " + (isActive && matchTimer >= 30 ? "" : "disabled")}>
        <div className="input-column">
            <div className="input-column-header">
              <img src={nectar} alt="Nectar"/>
            </div>

            <OBSSI 
              label={"Nectar Scored in Hive"}
              count={formData.teleop.hiveNectar}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, hiveNectar: formData.teleop.hiveNectar + 1, cycles: {...formData.teleop.cycles, hiveNectar: [...formData.teleop.cycles.hiveNectar, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, hiveNectar: Math.max(formData.teleop.hiveNectar - 1, 0), cycles: {...formData.teleop.cycles, hiveNectar: formData.teleop.cycles.hiveNectar.slice(0, -1)}}})}
            />

            <OBSSI 
              label={"Nectar Scored in Flower"}
              count={formData.teleop.flowerNectar}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, flowerNectar: formData.teleop.flowerNectar + 1, cycles: {...formData.teleop.cycles, flowerNectar: [...formData.teleop.cycles.flowerNectar, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, flowerNectar: Math.max(formData.teleop.flowerNectar - 1, 0), cycles: {...formData.teleop.cycles, flowerNectar: formData.teleop.cycles.flowerNectar.slice(0, -1)}}})}
            />

            <OBSSI 
              label={"Nectar Scored in Garden"}
              count={formData.teleop.gardenNectar}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, gardenNectar: formData.teleop.gardenNectar + 1, cycles: {...formData.teleop.cycles, gardenNectar: [...formData.teleop.cycles.gardenNectar, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, gardenNectar: Math.max(formData.teleop.gardenNectar - 1, 0), cycles: {...formData.teleop.cycles, gardenNectar: formData.teleop.cycles.gardenNectar.slice(0, -1)}}})}
              disabled={disabled.gardenNectar}
            />
          </div>

          {/* Column 2: All Pollen Scoring */}
          <div className="input-column">
            <div className="input-column-header">
              <img src={pollen} alt="Pollen"/>        
            </div>

            <OBSSI
              label={"Pollen Scored in Hive"}
              count={formData.teleop.hivePollen}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, hivePollen: formData.teleop.hivePollen + 1, cycles: {...formData.teleop.cycles, hivePollen: [...formData.teleop.cycles.hivePollen, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, hivePollen: Math.max(formData.teleop.hivePollen - 1, 0), cycles: {...formData.teleop.cycles, hivePollen: formData.teleop.cycles.hivePollen.slice(0, -1)}}})}
            />

            <OBSSI
              label={"Pollen Scored in Flower"}
              count={formData.teleop.flowerPollen}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, flowerPollen: formData.teleop.flowerPollen + 1, cycles: {...formData.teleop.cycles, flowerPollen: [...formData.teleop.cycles.flowerPollen, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, flowerPollen: Math.max(formData.teleop.flowerPollen - 1, 0), cycles: {...formData.teleop.cycles, flowerPollen: formData.teleop.cycles.flowerPollen.slice(0, -1)}}})}
            />

            <OBSSI
              label={"Pollen Scored in Garden"}
              count={formData.teleop.gardenPollen}
              increment={() => setFormData({...formData, teleop: {...formData.teleop, gardenPollen: formData.teleop.gardenPollen + 1, cycles: {...formData.teleop.cycles, gardenPollen: [...formData.teleop.cycles.gardenPollen, matchTimer]}}})}
              decrement={() => setFormData({...formData, teleop: {...formData.teleop, gardenPollen: Math.max(formData.teleop.gardenPollen - 1, 0), cycles: {...formData.teleop.cycles, gardenPollen: formData.teleop.cycles.gardenPollen.slice(0, -1)}}})}
              disabled={disabled.gardenPollen}
            />
          </div>
        </div>  

        <div className="input-row">
          <button onClick={() => setFormData({...formData, teleop: {...formData.teleop, park: -1}})} className={(!isActive || matchTimer < 30) || formData.teleop.park === -1 ? "disabled undo" : "undo"}>
            Undo Park
          </button>
          <Button label="Park" onClick={() => setFormData({...formData, teleop: {...formData.teleop, park: matchTimer}})} disabled={(!isActive || matchTimer < 30) || formData.teleop.park !== -1}/>
        </div>
    </div>
  )
}

export default Teleop