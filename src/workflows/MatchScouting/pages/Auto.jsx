import { useState } from 'react'
import '../../../css/App.css'
import TextInput from '../../../components/inputs/Text.jsx'
import NumberInput from '../../../components/inputs/Num.jsx'
import SelectButtons from '../../../components/inputs/SelectButton.jsx'
import Counter from '../../../components/inputs/Counter.jsx'
import Button from '../../../components/inputs/Button.jsx'
import OBSSI from '../../../components/inputs/OBSSI.jsx'

function Auto({disabled, setDisabled, formData, setFormData, isActive, matchTimer}) {
  return (
    <div className="input-page auto-page">
        <h1>Auto</h1>
        <div className="input-row">
        <div className="input-column">
          <OBSSI 
            label={"Nectar Scored in Hive"}
            count={formData.auto.hiveNectar}
            increment={() => setFormData({...formData, auto: {...formData.auto, hiveNectar: formData.auto.hiveNectar + 1}})}
            decrement={() => setFormData({...formData, auto: {...formData.auto, hiveNectar: Math.max(formData.auto.hiveNectar - 1, 0)}})}
            disabled={disabled.hiveNectar}
          />

          <OBSSI
            label={"Pollen Scored in Hive"}
            count={formData.auto.hivePollen}
            increment={() => setFormData({...formData, auto: {...formData.auto, hivePollen: formData.auto.hivePollen + 1}})}
            decrement={() => setFormData({...formData, auto: {...formData.auto, hivePollen: Math.max(formData.auto.hivePollen - 1, 0)}})}
            disabled={disabled.hivePollen}
          />
        </div>

        <div className="input-column">
          <OBSSI 
            label={"Nectar Scored in Flower"}
            count={formData.auto.flowerNectar}
            increment={() => setFormData({...formData, auto: {...formData.auto, flowerNectar: formData.auto.flowerNectar + 1}})}
            decrement={() => setFormData({...formData, auto: {...formData.auto, flowerNectar: Math.max(formData.auto.flowerNectar - 1, 0)}})}
            disabled={disabled.flowerNectar}
          />

          <OBSSI
            label={"Pollen Scored in Flower"}
            count={formData.auto.flowerPollen}
            increment={() => setFormData({...formData, auto: {...formData.auto, flowerPollen: formData.auto.flowerPollen + 1}})}
            decrement={() => setFormData({...formData, auto: {...formData.auto, flowerPollen: Math.max(formData.auto.flowerPollen - 1, 0)}})}
            disabled={disabled.flowerPollen}
          />
        </div>      
        </div>  
    </div>
  )
}

export default Auto