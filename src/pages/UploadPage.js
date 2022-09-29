import React, { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs';

import { MODEL_CLASSES } from '../model/classes.js';
import UploadCard from '../components/UploadCard.js';
import Controller from '../components/Controller.js';
import ResultContainer from '../components/ResultContainer.js';
import CircularProgress from '@mui/material/CircularProgress';
import './css/UploadPage.css'

// Model utilities
const IMAGE_SIZE = Number(process.env.REACT_APP_IMAGE_SIZE)

const UploadPage = () => {

    // states of files and models
    const [file, setFile] = useState(null);
    const [model, setModel] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    // states for handling results
    const [results, setResults] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timePer, setTimePer] = useState(null);

    // state for controlling prediction mode
    const [switchCache, setSwitchCache] = useState(false)

     useEffect(() => {
        const fetchModel = async() => {
            // check indexedDB support for browser
            if(('indexedDB' in window)){
                // Get model from stored indexed
                try{
                    const model_ = await tf.loadLayersModel('indexeddb://' + process.env.REACT_APP_INDEXEDDB_KEY)
                    
                    // warmup model
                    let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                    prediction.dispose();

                    // save model
                    setModel(model_)
                    setModelLoaded(true)
                }
                catch(error){
                    // If error here, assume that no models are saved hence save it to indexedDB
                    // window.alert('Loading model... Note:Cache method would work after 1-2 minutes')
                    const model_ = await tf.loadLayersModel(process.env.REACT_APP_MODEL_PATH);
                    
                    // warmup model
                    let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                    prediction.dispose();
                    
                    // save model
                    setModel(model_);
                    setModelLoaded(true)
                    await model_.save('indexeddb://' + process.env.REACT_APP_INDEXEDDB_KEY);
                }
            }else{
                // If error here, assume browser doesnot support indexedDB, hence load locally
                const model_ = await tf.loadLayersModel(process.env.REACT_APP_MODEL_PATH);
                
                // warmup model
                let prediction = tf.tidy(() => model_.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
                prediction.dispose();
                
                // save model
                setModel(model_)
                setModelLoaded(true)
            }
        }

        // Catch error for development mode only!!
        fetchModel().catch(console.error)
    },[])

    
    const handleImageChange = (e) => {
        // Function for handling image upload
        setFile(e.target.files[0])
    }

    const getTopKClasses = (values, topK) => {
        // Function for selecting top 5 classes
        // Note: This function is called only in cache mode/client mode
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

    const showResults = (preds) => {
        // Function for converting results to display format.
        const list = []
        for(const key in preds){
           list.push(<li key={key}>{key + " " + (preds[key]*100).toFixed(2) + "%"}</li>)
        }
        setResults(list);
        setOpen(true);
        setLoading(false);
    }

    const predictUsingCache = async() => {
        // Function for predicting image using Cache Mode.
        try{
            // Start performance measurement
            const timeBegin = performance.now()
            
            // Convert to tensor
            const img = document.getElementById('image_up')
            const tensor = tf.tidy(()=> tf.browser.fromPixels(img).toFloat());
            // Process Image
            const resizeImage = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE]);
            const imageData = tf.tidy(() => resizeImage.expandDims(0).toFloat().div(127).sub(1));
            // Predict
            const probabilities =  await model.predict(imageData).data();
            const preds =  getTopKClasses(probabilities, process.env.REACT_APP_TOPK_PREDICTIONS);
            
            setTimePer(performance.now() - timeBegin)
            showResults(preds)
        }catch{
            // If error here, assume something internal went wrong in above prediction block.
            window.alert('Something went wrong! pleaser try again')

            // sanitize all states
            setLoading(false)
            setResults(false)
            setOpen(false)
            setTimePer(false)
        }
        
    }

    const handlePredict = () => {
        // Function for handling predictions according to modes
        if(file){
            // Image upload verified
            if(switchCache){
                // Using cache mode
                predictUsingCache()
            }else{
                // using server mode

                // Start performance measurement
                const timeBegin = performance.now()

                // Create formData with image appended
                const formData = new FormData()
                formData.append('file', file);

                // Define post body
                const options = {
                    method : 'POST',
                    body: formData,
                }

                // Send request and conclude with results
                fetch(process.env.REACT_APP_SEREVR_URL,options)
                    .then((res) => res.json())
                    .catch(() => {
                        // sanitize all states
                        setLoading(false)
                        setResults(false)
                        setOpen(false)
                        setTimePer(false)
                        window.alert('Something went wrong! pleaser try again')
                    })
                    .then((result) => {
                        setTimePer(performance.now() - timeBegin)
                        showResults(result.result)
                        setLoading(false)
                })
                
            }
        }else{
            // If error here, assume image wasn't uploaded
            window.alert('Please Upload Image')
            setLoading(false)
        }
    }

  return (
    <div className='upload__container'>
        {!modelLoaded? 
            <div style={{ fontFamily: 'sans-serif' ,  color: 'white', alignSelf: 'flex-end', marginRight: '10px' }}>
                <CircularProgress color='primary' />
                <h4>Loading Model...</h4>
                <h4>Use non-cache mode instead</h4>
                <h4>This will take few seconds for first time site visit only</h4>
            </div> : null }
        {/* Result */}
        <ResultContainer 
            open={open}
            setOpen={setOpen}
            results={results}
            timePer={timePer} 
        />
        {/* Upload Card */}
        <UploadCard 
            file={file}
            handleImageChange={handleImageChange}
        />
        {/* Controller */}
        <Controller 
            switchCache={switchCache}
            setSwitchCache={setSwitchCache}
            loading={loading}
            handlePredict={handlePredict}
            setLoading = {setLoading}
            modelLoaded = {modelLoaded}
        />
    </div>
  )
}

export default UploadPage