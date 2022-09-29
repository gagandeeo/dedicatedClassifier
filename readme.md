# Dedicated Object Classifier
Live Application: 

## About
- This Web-application uses machine model to identify object present in an image.
- Model used is MobilenetV2, as a result this is a [transfer learning](https://machinelearningmastery.com/transfer-learning-for-deep-learning/) technique. More about this model can be found here [MobileNetV2](https://www.tensorflow.org/api_docs/python/tf/keras/applications/mobilenet_v2)
- This application is a PWA, hence it can be installed on user's local machine.

## This application has two modes:
- Server-Mode: Needs internet connectivity for accesing the api for prediction (only).

### Cache-Mode
- Once app is visited/installed this allows user to use this app in offline mode (also).
- It uses browser's feature of indexedDB to save and load model.
- Uses cache to dynamically store required components.
> **__NOTE:__**
The cache mode and indexedDB mode would only work if these features are supported by browser. 

### Server-Mode
- This mode constantly uses the traditional method of serving model through hosted APIs.
> **__NOTE:__**
Requires internet connectivity for predictions.

## Developement

### Client
To deploy model locally use the following steps:
- Clone this repo
- Inside the root folder run:
    - npm install
    - npm start
- Visit http://localhost:3000

### Server
- To deploy server locally visit https://github.com/gagandeeo/dedicatedTF
- Also edit REACT_APP_SEREVR_URL accordingly in .env.local in **client** application

## Production
To make offline mode work, we need to serve application in production mode:
- In root folder run following commands
    - npm run build
    - npm install -g serve (if not installed already)
    - server -s build
