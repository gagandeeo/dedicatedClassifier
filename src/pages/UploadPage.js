import React, { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs';
import { MODEL_CLASSES } from '../model/classes.js';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import "./css/UploadPage.css";
import { openDB } from 'idb';
import { Alert, Collapse, Switch } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';


const MODEL_PATH = "/model/model.json";
const IMAGE_SIZE = 224;
const TOPK_PREDICTIONS = 5;

const INDEXEDDB_DB = 'tensorflowjs';
const INDEXEDDB_STORE = 'model_info_store';
const INDEXEDDB_KEY = 'web-model';

const UploadPage = () => {

    const [file, setFile] = useState(null);
    const [model, setModel] = useState(null);
    const [results, setResults] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // switchMode state
    const [switchCache, setSwitchCache] = useState(true)
    const [timePer, setTimePer] = useState(null);

     useEffect(() => {
        const fetchModel = async() => {
            // check indexedDB
            if(('indexedDB' in window)){
                try{
                    const model_ = await tf.loadLayersModel('indexeddb://' + INDEXEDDB_KEY)
                    
                    // warmup model
                    let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                    prediction.dispose();

                    setModel(model_)
                    try{
                        const db = await openDB(INDEXEDDB_DB, 1, );
                        await db.transaction(INDEXEDDB_STORE)
                                            .objectStore(INDEXEDDB_STORE)
                                            .get(INDEXEDDB_KEY);
                    }
                    catch(error){
                        console.warn(error);
                        console.warn('Couldnot retrieve when model was saved')
                    }
                }
                catch(error){
                    console.log('Not found models, Loading and saving...')
                    const model_ = await tf.loadLayersModel(MODEL_PATH);
                    
                    // warmup model
                    let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                    prediction.dispose();
                    
                    setModel(model_);
                    await model_.save('indexeddb://' + INDEXEDDB_KEY);
                }
            }else{
                const model_ = await tf.loadLayersModel(MODEL_PATH);
                
                // warmup model
                let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                prediction.dispose();
                
                setModel(model_)
            }
        }
        fetchModel().catch(console.error)
    },[])


    const handleImageChange = (e) => {
        setFile(e.target.files[0])
    }

    const getTopKClasses = (values, topK) => {
        const valuesAndIndices = [];
            for (let i = 0; i < values.length; i++) {
                valuesAndIndices.push({value: values[i], index: i});
            }
            valuesAndIndices.sort((a, b) => {
            return b.value - a.value;
        });
        
        const topkValues = new Float32Array(topK);
        const topkIndices = new Int32Array(topK);
        for (let i = 0; i < topK; i++) {
            topkValues[i] = valuesAndIndices[i].value;
            topkIndices[i] = valuesAndIndices[i].index;
        }

        const res = {};
        for (let i = 0; i < topkIndices.length; i++) {
            res[MODEL_CLASSES[topkIndices[i]].split(',')[0]] = topkValues[i]
        }
        return res;
    }

    const convertToTensor = () => {
        let img = document.getElementById('image_up')
        return tf.tidy(()=> tf.browser.fromPixels(img).toFloat());
    }

    const processImage = async () => {
        const tensor =  convertToTensor()
        const resizeImage = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE]);
        const imageData = tf.tidy(() => resizeImage.expandDims(0).toFloat().div(127).sub(1));
        return imageData;
    }

    const showResults = (preds) => {
        const list = []
        for(const key in preds){
           list.push(<li key={key}>{key + " " + (preds[key]*100).toFixed(2) + "%"}</li>)
        }
        setResults(list);
        setOpen(true);
        setLoading(false);
    }

    const predictUsingCache = async() => {
        const timeBegin = performance.now()

        const imageData = await processImage()
        const probabilities =  await model.predict(imageData).data();
        const preds =  getTopKClasses(probabilities, TOPK_PREDICTIONS);
        
        setTimePer(performance.now() - timeBegin)
        showResults(preds)
    }

    const handlePredict = () => {
        // Switching Functions
            if(switchCache){
                predictUsingCache()
            }else{
                const timeBegin = performance.now()
                const formData = new FormData()
                formData.append('file', file);
                const options = {
                    method : 'POST',
                    body: formData,
                }
                fetch("http://localhost:8000/uploadfile/",options)
                    .then((res) => res.json())
                    .then((result) => {
                        setTimePer(performance.now() - timeBegin)
                        showResults(result.result)
                        setLoading(false)
                    })
            }
    }

  return (
    <div className='upload__container'>
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
                     {timePer?.toFixed(2)} ms
                    </h2>
                 </div>
         </Alert>
         </Collapse>
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
         <div className='control__div'>
             <div className='switch__div' >
                 <FormControlLabel  control={
                     <Switch
                     checked={switchCache}
                     onChange={()=>setSwitchCache(!switchCache)}
                     inputProps={{ 'aria-label': 'controlled' }}
                     />} label="Cache Mode" />
             </div>
             <Button className="result__button"variant="outlined" onClick={()=>{
                setLoading(true);
                handlePredict();
             }}>
                Predict
            </Button>
            {loading? <PendingOutlinedIcon fontSize='medium' className="pending__icon" />:null }
         </div>
    </div>
  )
}

export default UploadPage