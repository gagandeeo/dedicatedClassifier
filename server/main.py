from typing import Union
from test_model import prepare_image, load_model, predict
from fastapi import FastAPI, File, UploadFile


app = FastAPI()
model = load_model("./mobilenet-model.h5")


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    content = await file.read()
    preprocess_img = prepare_image(content)
    res = predict(preprocess_img, model)
    return {"result": res}