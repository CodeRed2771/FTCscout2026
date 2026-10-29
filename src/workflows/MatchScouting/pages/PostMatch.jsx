import { useState } from 'react'
import '../../../css/App.css'
import TextInput from '../../../components/inputs/Text.jsx'
import NumberInput from '../../../components/inputs/Num.jsx'
import SelectButtons from '../../../components/inputs/SelectButton.jsx'
import Counter from '../../../components/inputs/Counter.jsx'
import Button from '../../../components/inputs/Button.jsx'
import Textarea from '../../../components/inputs/Textarea.jsx'

function PostMatch({submitMatch, disabled, setDisabled, formData, setFormData, isActive, matchTimer}) {
  return (
    <div className="input-page">
      <h1>Post-Match</h1>

      <Textarea 
        label="Comments"
        value={formData.comments}
        onChange={(val) => setFormData({...formData, comments: val})}
      />

      <Button
        label="Submit Match"
        onClick={submitMatch}
        type="submit"
      />
    </div>
  )
}

export default PostMatch