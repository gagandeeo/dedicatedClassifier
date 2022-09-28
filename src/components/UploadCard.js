import React from 'react'
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './component.css'

const UploadCard = ({ file, handleImageChange }) => {
  return (
    <Card className='upload__card'>
            {!file?
            <IconButton size='large' color="primary" aria-label="upload picture" component="label">
                <CardContent style={{width:100}} > 
                    <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    <PhotoCamera />
                </CardContent>
            </IconButton>
            :
            <>
            <CardContent style={{width:200}}>
                <img id="image_up" alt="" className="upload__image" src={URL.createObjectURL(file)} />
            </CardContent>
            <IconButton size='small'className='upload__button' color="primary" aria-label="upload picture" component="label">
                    <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    <PhotoCamera />
            </IconButton>
            </>}
        </Card>
  )
}

export default UploadCard