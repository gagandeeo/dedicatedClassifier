import React from 'react'
import Button from '@mui/material/Button';
import { Switch } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import './component.css'


const Controller = ({ switchCache, setSwitchCache, loading, handlePredict, setLoading, modelLoaded }) => {
  return (
    <div className='control__div'>
        <div className='switch__div' >
            <FormControlLabel  control={
                <Switch
                checked={switchCache}
                onChange={()=>setSwitchCache(!switchCache)}
                disabled={!modelLoaded}
                inputProps={{ 'aria-label': 'controlled' }}
                ></Switch>} label="Cache Mode" />
        </div>
        <Button className="result__button"variant="outlined" onClick={()=>{
            setLoading(true);
            handlePredict();
        }}>
          {loading? <PendingOutlinedIcon fontSize='medium' className="pending__icon" />: "Predict" }
        </Button>
    </div>
  )
}

export default Controller