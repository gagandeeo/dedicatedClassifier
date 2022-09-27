from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras import applications
from PIL import Image
import numpy as np
import io


def prepare_image(image_data):
    img_ = Image.open(io.BytesIO(image_data))
    img_ = img_.resize((224,224))
    img_array = image.img_to_array(img_)
    img_array_expanded_dims = np.expand_dims(img_array, axis=0)
    return applications.mobilenet.preprocess_input(img_array_expanded_dims)

def predict(img, model):
    predictions = np.array(model.predict(img))
    results = np.array(applications.imagenet_utils.decode_predictions(predictions))
    return results

    
    
    


