import React from 'react'
import { Alert, Collapse } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import "./component.css"

const ResultContainer = ({ open, setOpen, results, timePer }) => {
  return (
    <Collapse className='result__container' in={open}>
             <Alert action={
                 <IconButton
                     color="inherit"
                     size="small"
                     onClick={() => {
                         setOpen(false);
                     }}
                 >
                     <CloseIcon fontSize='inherit' />
                 </IconButton>
             }
         >   
                 <div className="result__div">
                    <div>
                     {results}
                    </div>
                    <h2 style={{ alignSelf: 'center', marginLeft: 80 }} >
                    <HourglassBottomIcon fontSize='small' style={{color: 'black', top: 20, marginRight: 10}} />
                    {timePer? <>{timePer.toFixed(2)} ms </>: null}
                    </h2>
                 </div>
         </Alert>
         </Collapse>
  )
}

export default ResultContainer