# region: Python Standard Library Imports
import io
import os
import sys
import json
import random
import zipfile
import datetime # For timestamps and consistent file naming
import base64
import shutil
# endregion

# region: Third-Party Library Imports
import numpy as np
import pandas as pd
import cv2
from PIL import Image, ImageOps, ImageEnhance, ImageChops
from werkzeug.utils import secure_filename
import torch
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from gradio_client import Client, handle_file # Assuming this is used later in your app
from dotenv import load_dotenv
# endregion

# region: Application-Specific Imports
# Adjust the sys.path append if 'ESRGAN' is not directly in the project root
sys.path.append(os.path.join(os.path.dirname(__file__), 'ESRGAN'))
import RRDBNet_arch as arch # For image enhancement using ESRGAN
# endregion

# region: Initial Configuration and Environment Setup
load_dotenv() # Load environment variables from .env file

# Initialize Flask application
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing
# endregion

# region: Constants and Path Definitions
# --- Base Directory ---
BASE_FOLDER = 'C:\\Users\\Vishnu\\Documents\\Gitprojects\\majorProject\\database'
os.makedirs(BASE_FOLDER, exist_ok=True) # Ensure the base directory exists

# --- Core Sub-directories within BASE_FOLDER ---
UPLOAD_FOLDER = os.path.join(BASE_FOLDER, 'uploads')
AUGMENTED_FOLDER = os.path.join(BASE_FOLDER, 'augmented')
ENHANCED_FOLDER = os.path.join(BASE_FOLDER, 'enhanced')
UPLOAD_CSV_DIR = os.path.join(BASE_FOLDER, 'csv_uploads')
RESULT_CSV_DIR = os.path.join(BASE_FOLDER, 'csv_results')
IMAGES_DIR = os.path.join(BASE_FOLDER, 'generated_images')
METADATA_DIR = os.path.join(BASE_FOLDER, 'metadata') # Centralized metadata directory

# --- Metadata File Paths within METADATA_DIR ---
METADATA_FILE = os.path.join(METADATA_DIR, 'augmentation_metadata.json')
ENHANCED_METADATA_FILE = os.path.join(METADATA_DIR, 'enhancement_metadata.json')
GENERATED_IMAGES_META_FILE = os.path.join(METADATA_DIR, 'image_creation_metadata.json') # Renamed for clarity
CSV_PROCESSING_META_FILE = os.path.join(METADATA_DIR, "csv_processing_metadata.json") # Renamed for clarity

# --- External Service URLs (from .env) ---
GRADIO_URL = os.getenv("GRADIO_URL")
GRADIO_URL_IMAGES = os.getenv("GRADIO_URL_IMAGES")
# endregion

# region: Flask Application Configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AUGMENTED_FOLDER'] = AUGMENTED_FOLDER
# endregion

# region: Directory Creation
# Ensure all necessary directories exist upon application startup.
folders_to_create = [
    UPLOAD_FOLDER,
    AUGMENTED_FOLDER,
    ENHANCED_FOLDER,
    UPLOAD_CSV_DIR,
    RESULT_CSV_DIR,
    IMAGES_DIR,
    METADATA_DIR # Ensure metadata directory is created
]
for folder in folders_to_create:
    os.makedirs(folder, exist_ok=True)
# endregion



# loading meta data


# image augmentation meta json

if os.path.exists(METADATA_FILE) and os.path.getsize(METADATA_FILE) > 0:
    try:
        with open(METADATA_FILE, 'r') as f:
            augmentation_metadata = json.load(f)
    except json.JSONDecodeError:
        print("Warning: augmentation_metadata.json is malformed. Using empty metadata.")
        augmentation_metadata = {}
else:
    augmentation_metadata = {}


# image resolution meta json

if os.path.exists(ENHANCED_METADATA_FILE) and os.path.getsize(ENHANCED_METADATA_FILE) > 0:
    try:
        with open(ENHANCED_METADATA_FILE, 'r') as f:
            enhancement_metadata = json.load(f)
    except json.JSONDecodeError:
        print("Warning: enhancement_metadata.json is malformed. Using empty metadata.")
        enhancement_metadata = {}
else:
    enhancement_metadata = {}


# --- helper functions ---


# --- Helper function to zip a directory (can be reused for download_uploads) ---
def zip_directory_contents(source_dir, zipf, arcname_prefix=""):
    """
    Adds the contents of a source_dir to an open zipfile object.
    arcname_prefix: A prefix to add to the path of files inside the zip.
                    e.g., "uploads/" or "run_0/"
    """
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            file_path = os.path.join(root, file)
            # Calculate the relative path within the source_dir
            # Then combine with the arcname_prefix for the path inside the zip
            arcname = os.path.join(arcname_prefix, os.path.relpath(file_path, source_dir))
            zipf.write(file_path, arcname)




# def zip_directory(dir_path, zip_path):
#     """Helper function to zip a directory."""
#     with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
#         for root, dirs, files in os.walk(dir_path):
#             for file in files:
#                 zipf.write(os.path.join(root, file),
#                            os.path.relpath(os.path.join(root, file), dir_path))


# --- CSV meta data storing and retrieving -----

def load_csv_meta():
    if not os.path.exists(CSV_PROCESSING_META_FILE):
        with open(CSV_PROCESSING_META_FILE, 'w') as f:
            json.dump([], f)
    with open(CSV_PROCESSING_META_FILE, 'r') as f:
        return json.load(f)

def save_csv_meta(meta):
    with open(CSV_PROCESSING_META_FILE, 'w') as f:
        json.dump(meta, f, indent=4)

# --- end of csv data retrieving ---





# --- Start of Augmentation Functions ---

def rotate_image(image, angle=90):
    return image.rotate(angle, expand=True)

def scale_image(image, scale=1.5):
    if scale <= 0: return image
    width, height = image.size
    return image.resize((int(width * scale), int(height * scale)))

def translate_image(image, x_offset, y_offset):
    return ImageChops.offset(image, x_offset, y_offset)

def flip_horizontal(image):
    return ImageOps.mirror(image)

def flip_vertical(image):
    return ImageOps.flip(image)

def crop_image(image, left, top, right, bottom):
    width, height = image.size
    left = max(0, int(left))
    top = max(0, int(top))
    right = min(width, int(right))
    bottom = min(height, int(bottom))
    if left < right and top < bottom:
        return image.crop((left, top, right, bottom))
    return image

def pad_image(image, padding_size, padding_color="#000000"):
    padding_size = int(padding_size)
    if padding_size <=0: return image
    return ImageOps.expand(image, border=padding_size, fill=padding_color)

def adjust_brightness(image, factor):
    enhancer = ImageEnhance.Brightness(image.convert('RGB'))
    return enhancer.enhance(factor)

def adjust_contrast(image, factor):
    enhancer = ImageEnhance.Contrast(image.convert('RGB'))
    return enhancer.enhance(factor)

def convert_grayscale(image):
    return ImageOps.grayscale(image).convert('RGB')

def adjust_saturation(image, factor):
    enhancer = ImageEnhance.Color(image.convert('RGB'))
    return enhancer.enhance(factor)

def add_gaussian_noise(image, mean=0, var=0.01):
    img_array = np.array(image.convert('RGB')).astype(np.float32) / 255.0
    noise = np.random.normal(mean, var ** 0.5, img_array.shape)
    img_noisy = img_array + noise
    img_noisy = np.clip(img_noisy, 0, 1)
    img_noisy = (img_noisy * 255).astype(np.uint8)
    return Image.fromarray(img_noisy)

def add_salt_pepper_noise(image, amount=0.005, salt_vs_pepper=0.5):
    img_array = np.array(image.convert('RGB'))
    num_salt = np.ceil(amount * img_array.shape[0] * img_array.shape[1] * salt_vs_pepper).astype(int)
    num_pepper = np.ceil(amount * img_array.shape[0] * img_array.shape[1] * (1.0 - salt_vs_pepper)).astype(int)
    if img_array.size > 0 :
        if num_salt > 0:
            salt_rows = np.random.randint(0, max(1, img_array.shape[0]), num_salt)
            salt_cols = np.random.randint(0, max(1, img_array.shape[1]), num_salt)
            img_array[salt_rows, salt_cols, :] = [255,255,255]
        if num_pepper > 0:
            pepper_rows = np.random.randint(0, max(1, img_array.shape[0]), num_pepper)
            pepper_cols = np.random.randint(0, max(1, img_array.shape[1]), num_pepper)
            img_array[pepper_rows, pepper_cols, :] = [0,0,0]
    return Image.fromarray(img_array)

def add_speckle_noise(image):
    img_array = np.array(image.convert('RGB')).astype(np.float32) / 255.0
    noise = np.random.randn(*img_array.shape)
    img_noisy = img_array + img_array * noise
    img_noisy = np.clip(img_noisy, 0, 1)
    img_noisy = (img_noisy * 255).astype(np.uint8)
    return Image.fromarray(img_noisy)

def add_motion_blur(image, size=9):
    size = int(size)
    if size <= 1: size = 3
    if size % 2 == 0 : size +=1
    kernel = np.zeros((size, size))
    kernel[int((size - 1)/2), :] = np.ones(size)
    kernel = kernel / size
    img_array = np.array(image.convert('RGB'))
    img_blur = cv2.filter2D(img_array, -1, kernel)
    return Image.fromarray(img_blur)

def apply_cutout(image, mask_size):
    mask_size = int(mask_size)
    if mask_size <=0: return image
    img_array = np.array(image.convert('RGB'))
    h, w = img_array.shape[:2]
    if h == 0 or w == 0: return image
    y = np.random.randint(h)
    x = np.random.randint(w)
    y1 = np.clip(y - mask_size // 2, 0, h)
    y2 = np.clip(y + mask_size // 2, 0, h)
    x1 = np.clip(x - mask_size // 2, 0, w)
    x2 = np.clip(x + mask_size // 2, 0, w)
    img_array[y1:y2, x1:x2] = 0
    return Image.fromarray(img_array)

def apply_random_erasing(image, sl=0.02, sh=0.4, r1=0.3):
    img_array = np.array(image.convert('RGB'))
    h, w, c = img_array.shape
    s_img = h * w
    if s_img == 0: return image
    s_erase = np.random.uniform(sl, sh) * s_img
    r_aspect = np.random.uniform(r1, 1/r1 if r1 != 0 else 1)
    h_e = int(np.sqrt(s_erase * r_aspect))
    w_e = int(np.sqrt(s_erase / r_aspect if r_aspect != 0 else s_erase))
    if w_e == 0 or h_e == 0 or w_e >= w or h_e >= h:
        return Image.fromarray(img_array)
    x_e = np.random.randint(0, w - w_e + 1)
    y_e = np.random.randint(0, h - h_e + 1)
    img_array[y_e:y_e+h_e, x_e:x_e+w_e] = np.random.randint(0, 256, (h_e, w_e, c))
    return Image.fromarray(img_array)

def apply_mixup(image, other_image, alpha=0.4):
    if other_image is None: return image
    lam = np.random.beta(alpha, alpha) if alpha > 0 else 1.0
    image_array = np.array(image.convert('RGB')).astype(np.float32)
    other_array = np.array(other_image.convert('RGB').resize(image.size)).astype(np.float32)
    mixed_array = lam * image_array + (1 - lam) * other_array
    return Image.fromarray(mixed_array.astype(np.uint8))

def apply_cutmix(image, other_image):
    if other_image is None: return image
    img_array = np.array(image.convert('RGB'))
    other_array = np.array(other_image.convert('RGB').resize(image.size))
    h, w, _ = img_array.shape
    if h == 0 or w == 0: return image
    lam = np.random.beta(1.0, 1.0)
    cut_ratio = np.sqrt(1. - lam)
    cut_w = int(w * cut_ratio)
    cut_h = int(h * cut_ratio)
    if cut_w == 0 or cut_h == 0: return image
    cx = np.random.randint(w)
    cy = np.random.randint(h)
    bbx1 = np.clip(cx - cut_w // 2, 0, w)
    bby1 = np.clip(cy - cut_h // 2, 0, h)
    bbx2 = np.clip(cx + cut_w // 2, 0, w)
    bby2 = np.clip(cy + cut_h // 2, 0, h)
    if bbx1 < bbx2 and bby1 < bby2:
      img_array[bby1:bby2, bbx1:bbx2, :] = other_array[bby1:bby2, bbx1:bbx2, :]
    return Image.fromarray(img_array)

def run_augmentations(image, techniques, params, source_dataset_folder, files_in_dataset, current_image_filename):
    processed_image = image.copy()
    if "rotate" in techniques:
        processed_image = rotate_image(processed_image, float(params.get("rotation_angle", 90)))
    if "scale" in techniques:
        processed_image = scale_image(processed_image, float(params.get("scaling_factor", 1.5)))
    if "translate" in techniques:
        processed_image = translate_image(processed_image, int(params.get("translation_x", 0)), int(params.get("translation_y", 0)))
    if "flip_horizontal" in techniques:
        processed_image = flip_horizontal(processed_image)
    if "flip_vertical" in techniques:
        processed_image = flip_vertical(processed_image)
    if "crop" in techniques:
        img_w, img_h = processed_image.size
        processed_image = crop_image(processed_image, float(params.get("crop_left", 0)), float(params.get("crop_top", 0)), float(params.get("crop_right", img_w)), float(params.get("crop_bottom", img_h)))
    if "pad" in techniques:
        processed_image = pad_image(processed_image, int(params.get("padding_size", 0)), params.get("padding_color", "#000000"))
    if "brightness" in techniques:
        processed_image = adjust_brightness(processed_image, float(params.get("brightness_factor", 1.0)))
    if "contrast" in techniques:
        processed_image = adjust_contrast(processed_image, float(params.get("contrast_factor", 1.0)))
    if "grayscale" in techniques:
        processed_image = convert_grayscale(processed_image)
    if "saturation" in techniques:
        processed_image = adjust_saturation(processed_image, float(params.get("saturation_factor", 1.0)))
    if "gaussian_noise" in techniques:
        processed_image = add_gaussian_noise(processed_image, var=float(params.get("gaussian_variance", 0.01)))
    if "salt_pepper_noise" in techniques:
        processed_image = add_salt_pepper_noise(processed_image, amount=float(params.get("sap_amount", 0.005)))
    if "speckle_noise" in techniques:
        processed_image = add_speckle_noise(processed_image)
    if "motion_blur" in techniques:
        processed_image = add_motion_blur(processed_image, size=int(params.get("motion_blur_size", 9)))
    if "cutout" in techniques:
        processed_image = apply_cutout(processed_image, int(params.get("cutout_size", 50)))
    if "random_erasing" in techniques:
        processed_image = apply_random_erasing(processed_image)
    
    other_image_for_mix = None
    if ("mixup" in techniques or "cutmix" in techniques) and files_in_dataset and source_dataset_folder:
        possible_other_files = [f for f in files_in_dataset if f != current_image_filename]
        if not possible_other_files and len(files_in_dataset) > 0:
            possible_other_files = files_in_dataset
        if possible_other_files:
            other_filename = random.choice(possible_other_files)
            other_filepath = os.path.join(source_dataset_folder, other_filename)
            try:
                other_image_for_mix = Image.open(other_filepath)
            except Exception as e:
                print(f"Warning: Could not load other image {other_filepath} for mixup/cutmix: {e}")
    if "mixup" in techniques:
        processed_image = apply_mixup(processed_image, other_image_for_mix, float(params.get("mixup_alpha", 0.4)))
    if "cutmix" in techniques:
        processed_image = apply_cutmix(processed_image, other_image_for_mix)
    if other_image_for_mix:
        other_image_for_mix.close()
    return processed_image

# --- End of Augmentation Functions ---


# enhancing images
def enhance_esrgan_image(input_path, output_path, model_path, device='cpu'):
    device = torch.device(device)
    model = arch.RRDBNet(3, 3, 64, 23, gc=32)
    model.load_state_dict(torch.load(model_path, map_location=device), strict=True)
    model.eval()
    model = model.to(device)
    print(f'Loaded model from {model_path}')
    print(f'Enhancing image: {input_path}')

    # Read and preprocess image
    img = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Image not found at {input_path}")
    img = img.astype(np.float32) / 255.0
    img = torch.from_numpy(np.transpose(img[:, :, [2, 1, 0]], (2, 0, 1))).float().unsqueeze(0).to(device)

    # Inference
    with torch.no_grad():
        output = model(img).data.squeeze().float().cpu().clamp_(0, 1).numpy()
    output = np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round().astype(np.uint8)

    # Save result
    cv2.imwrite(output_path, output)
    print(f'Saved enhanced image to: {output_path}')


#---- End of enhancing images


# --- Starting Routing ----




# ------ Routing 1 : Image Augmentation Started --------

@app.route('/upload', methods=['POST'])
def upload_files():
    dataset = request.form.get('dataset')
    files = request.files.getlist('files')
    if not dataset:
        return jsonify({"error": "No dataset name provided"}), 400
    if not files or all(f.filename == '' for f in files):
        return jsonify({"error": "No files selected for upload"}), 400
    dataset_folder = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(dataset))
    os.makedirs(dataset_folder, exist_ok=True)
    for file in files:
        if file.filename == '': continue
        filename = secure_filename(file.filename)
        filepath = os.path.join(dataset_folder, filename)
        file.save(filepath)
        if filename.lower().endswith('.zip'):
            try:
                with zipfile.ZipFile(filepath, 'r') as zip_ref:
                    zip_ref.extractall(dataset_folder)
                os.remove(filepath)
            except zipfile.BadZipFile:
                print(f"Bad zip file: {filepath}. Kept for inspection.")
            except Exception as e:
                print(f"Error processing zip file {filepath}: {e}")
    return jsonify({"message": "Files uploaded successfully", "dataset": dataset}), 200

@app.route('/datasets', methods=['GET'])
def list_datasets():
    datasets_info = []
    base_upload_folder = app.config['UPLOAD_FOLDER']
    for folder_name in os.listdir(base_upload_folder):
        folder_path = os.path.join(base_upload_folder, folder_name)
        if os.path.isdir(folder_path):
            try:
                files_in_folder = os.listdir(folder_path)
                image_files = [f for f in files_in_folder if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                dataset_metadata = augmentation_metadata.get(folder_name, {})
                runs = dataset_metadata.get("augmentation_runs", [])
                datasets_info.append({
                    'name': folder_name,
                    'count': len(image_files),
                    'files': image_files,
                    'all_files_in_folder': files_in_folder,
                    'augmentation_runs': runs
                })
            except Exception as e:
                print(f"Error listing dataset {folder_name}: {e}")
    return jsonify(datasets_info)

@app.route('/augment', methods=['POST'])
def augment_dataset_route():
    data = request.get_json()
    dataset_name = secure_filename(data.get('datasetName'))
    techniques = data.get('techniques', [])
    parameters = data.get('parameters', {})
    if not dataset_name: return jsonify({'error': 'Dataset name not provided'}), 400
    if not techniques: return jsonify({'error': 'No augmentation techniques selected'}), 400
    source_folder = os.path.join(app.config['UPLOAD_FOLDER'], dataset_name)
    if not os.path.isdir(source_folder):
        return jsonify({'error': f"Source dataset folder '{dataset_name}' not found."}), 404
    dataset_augmented_base_path = os.path.join(app.config['AUGMENTED_FOLDER'], dataset_name)
    os.makedirs(dataset_augmented_base_path, exist_ok=True)
    existing_runs = augmentation_metadata.get(dataset_name, {}).get("augmentation_runs", [])
    existing_run_ids = {int(r["run_id"].split("_")[1]) for r in existing_runs if r["run_id"].startswith("run_") and r["run_id"].split("_")[1].isdigit()}
    run_index = 0
    while run_index in existing_run_ids:
        run_index += 1
    current_run_id = f"run_{run_index}"
    target_run_folder_path = os.path.join(dataset_augmented_base_path, current_run_id)
    os.makedirs(target_run_folder_path)
    
    zip_dir_path = os.path.join(dataset_augmented_base_path, "zip")
    os.makedirs(zip_dir_path, exist_ok=True)
    
    zip_filename = f"{dataset_name}_augmented_{current_run_id}.zip"
    zip_filepath = os.path.join(zip_dir_path, zip_filename)
    source_image_files = [f for f in os.listdir(source_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    augmented_file_names_for_zip = []
    for filename in source_image_files:
        img_path = os.path.join(source_folder, filename)
        try:
            with Image.open(img_path) as img:
                augmented_img = run_augmentations(img, techniques, parameters, source_folder, source_image_files, filename)
                if augmented_img.mode == 'P' and 'transparency' in augmented_img.info: augmented_img = augmented_img.convert("RGBA")
                elif augmented_img.mode == 'LA' or (augmented_img.mode == 'L' and 'transparency' in augmented_img.info): augmented_img = augmented_img.convert("RGBA")
                elif augmented_img.mode not in ['RGB', 'RGBA', 'L']: augmented_img = augmented_img.convert('RGB')
                base, ext = os.path.splitext(filename)
                save_ext = ext if ext.lower() in ['.jpg', '.jpeg', '.png'] else '.png'
                save_filename = f"aug_{base}{save_ext}"
                save_path = os.path.join(target_run_folder_path, save_filename)
                if save_ext.lower() in ['.jpg', '.jpeg']:
                    if augmented_img.mode == 'RGBA':
                        rgb_img = Image.new("RGB", augmented_img.size, (255, 255, 255))
                        rgb_img.paste(augmented_img, mask=augmented_img.split()[3])
                        augmented_img = rgb_img
                    augmented_img.save(save_path, "JPEG", quality=95)
                else:
                    augmented_img.save(save_path, "PNG")
                augmented_file_names_for_zip.append(save_filename)
        except Exception as e: print(f"Error augmenting image {filename}: {e}")
    with zipfile.ZipFile(zip_filepath, 'w') as zipf:
        for aug_file_name in augmented_file_names_for_zip:
            file_in_run_folder_path = os.path.join(target_run_folder_path, aug_file_name)
            if os.path.isfile(file_in_run_folder_path):
                 zipf.write(file_in_run_folder_path, aug_file_name)
    if dataset_name not in augmentation_metadata: augmentation_metadata[dataset_name] = {"augmentation_runs": []}
    elif "augmentation_runs" not in augmentation_metadata[dataset_name]: augmentation_metadata[dataset_name]["augmentation_runs"] = []
    new_run_info = {
        "run_id": current_run_id, "timestamp": datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S"),
        "techniques": techniques, "parameters": parameters, "augmented_zip": zip_filename,
        "output_folder_name": current_run_id
    }
    augmentation_metadata[dataset_name]["augmentation_runs"].append(new_run_info)
    with open(METADATA_FILE, 'w') as f: json.dump(augmentation_metadata, f, indent=4)
    return jsonify({'message': 'Augmentation complete', 'zip_filename': zip_filename, 'run_id': current_run_id})

@app.route('/preview_augmentation', methods=['POST'])
def preview_augmentation():
    data = request.get_json()
    dataset_name = secure_filename(data.get('datasetName'))
    image_filename = secure_filename(data.get('imageFilename'))
    technique = data.get('technique')
    params = data.get('parameters', {})
    if not all([dataset_name, image_filename, technique]):
        return jsonify({"error": "Missing data for single technique preview"}), 400
    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], dataset_name, image_filename)
    if not os.path.exists(original_image_path):
        return jsonify({"error": "Sample image not found"}), 404
    try:
        with Image.open(original_image_path) as img:
            preview_image = img.copy()
            if technique == "rotate": preview_image = rotate_image(preview_image, float(params.get("rotation_angle", 90)))
            elif technique == "scale": preview_image = scale_image(preview_image, float(params.get("scaling_factor", 1.5)))
            elif technique == "translate": preview_image = translate_image(preview_image, int(params.get("translation_x", 0)), int(params.get("translation_y", 0)))
            elif technique == "flip_horizontal": preview_image = flip_horizontal(preview_image)
            elif technique == "flip_vertical": preview_image = flip_vertical(preview_image)
            elif technique == "crop":
                img_w, img_h = preview_image.size
                preview_image = crop_image(preview_image, float(params.get("crop_left", 0)), float(params.get("crop_top", 0)), float(params.get("crop_right", img_w)), float(params.get("crop_bottom", img_h)))
            elif technique == "pad": preview_image = pad_image(preview_image, int(params.get("padding_size", 0)), params.get("padding_color", "#000000"))
            elif technique == "brightness": preview_image = adjust_brightness(preview_image, float(params.get("brightness_factor", 1.0)))
            elif technique == "contrast": preview_image = adjust_contrast(preview_image, float(params.get("contrast_factor", 1.0)))
            elif technique == "saturation": preview_image = adjust_saturation(preview_image, float(params.get("saturation_factor", 1.0)))
            elif technique == "grayscale": preview_image = convert_grayscale(preview_image)
            elif technique == "gaussian_noise": preview_image = add_gaussian_noise(preview_image, var=float(params.get("gaussian_variance", 0.01)))
            elif technique == "salt_pepper_noise": preview_image = add_salt_pepper_noise(preview_image, amount=float(params.get("sap_amount", 0.005)))
            elif technique == "speckle_noise": preview_image = add_speckle_noise(preview_image)
            elif technique == "motion_blur": preview_image = add_motion_blur(preview_image, size=int(params.get("motion_blur_size", 9)))
            elif technique == "cutout": preview_image = apply_cutout(preview_image, int(params.get("cutout_size", 50)))
            elif technique == "random_erasing": preview_image = apply_random_erasing(preview_image)
            if preview_image.mode == 'P' and 'transparency' in preview_image.info: preview_image = preview_image.convert("RGBA")
            elif preview_image.mode == 'LA' or (preview_image.mode == 'L' and 'transparency' in preview_image.info): preview_image = preview_image.convert("RGBA")
            elif preview_image.mode not in ['RGB', 'RGBA', 'L']: preview_image = preview_image.convert('RGB')
            buffered = io.BytesIO()
            save_format = "PNG"
            preview_image.save(buffered, format=save_format)
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return jsonify({"preview_image_base64": f"data:image/{save_format.lower()};base64,{img_str}"})
    except Exception as e:
        print(f"Error generating single technique preview for {technique}: {e}")
        return jsonify({"error": f"Could not generate single technique preview: {str(e)}"}), 500

@app.route('/preview_combined_augmentations', methods=['POST'])
def preview_combined_augmentations():
    data = request.get_json()
    dataset_name = secure_filename(data.get('datasetName'))
    image_filename = secure_filename(data.get('imageFilename'))
    techniques_to_apply = data.get('techniques', [])
    params = data.get('parameters', {})
    if not all([dataset_name, image_filename]):
        return jsonify({"error": "Missing dataset name or image filename for combined preview"}), 400
    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], dataset_name, image_filename)
    source_dataset_folder = os.path.join(app.config['UPLOAD_FOLDER'], dataset_name)
    if not os.path.exists(original_image_path):
        return jsonify({"error": "Sample image not found for combined preview"}), 404
    if not os.path.isdir(source_dataset_folder):
         return jsonify({"error": f"Source dataset folder '{dataset_name}' not found for combined preview."}), 404
    try:
        files_in_dataset = []
        if os.path.isdir(source_dataset_folder):
            files_in_dataset = [f for f in os.listdir(source_dataset_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        with Image.open(original_image_path) as img:
            processed_image = run_augmentations(img, techniques_to_apply, params, source_dataset_folder, files_in_dataset, image_filename)
            if processed_image.mode == 'P' and 'transparency' in processed_image.info: processed_image = processed_image.convert("RGBA")
            elif processed_image.mode == 'LA' or (processed_image.mode == 'L' and 'transparency' in processed_image.info): processed_image = processed_image.convert("RGBA")
            elif processed_image.mode not in ['RGB', 'RGBA', 'L']: processed_image = processed_image.convert('RGB')
            buffered = io.BytesIO()
            save_format="PNG"
            processed_image.save(buffered, format=save_format)
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return jsonify({"preview_image_base64": f"data:image/{save_format.lower()};base64,{img_str}"})
    except Exception as e:
        print(f"Error generating combined augmentations preview: {e}")
        return jsonify({"error": f"Could not generate combined preview: {str(e)}"}), 500

@app.route('/uploads/<dataset>/<filename>')
def uploaded_file(dataset, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(dataset)), secure_filename(filename))

@app.route('/augmented/<dataset>/<zipfilename>')
def serve_augmented_zip(dataset, zipfilename):
    dataset_aug_path = os.path.join(app.config['AUGMENTED_FOLDER'],secure_filename(dataset), "zip")
    print(dataset_aug_path)
    return send_from_directory(dataset_aug_path, secure_filename(zipfilename), as_attachment=True)

@app.route('/download_full_dataset/<dataset_name>')
def download_full_dataset(dataset_name):
    safe_dataset_name = secure_filename(dataset_name)

    # Define paths based on your existing app.config or global variables
    # Ensure these are correctly set up in your main app.py
    # Example:
    # UPLOAD_FOLDER = os.path.join(BASE_FOLDER, 'uploads')
    # AUGMENTED_FOLDER = os.path.join(BASE_FOLDER, 'augmented')
    uploads_source_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_dataset_name)
    augmented_dataset_path = os.path.join(app.config['AUGMENTED_FOLDER'], safe_dataset_name)

    # Define the final zip file name and path
    zip_filename = f"{safe_dataset_name}_full_dataset.zip"
    # Store the final zip in a temporary location or a designated download folder
    # For simplicity, let's put it in the augmented dataset's 'zip' subfolder
    # Ensure this 'zip' folder exists as per previous fixes
    output_zip_dir = os.path.join(app.config['AUGMENTED_FOLDER'], safe_dataset_name, "zip")
    os.makedirs(output_zip_dir, exist_ok=True) # Ensure the output directory exists

    zip_path = os.path.join(output_zip_dir, zip_filename)

    # --- Clean up existing zip file if it exists ---
    if os.path.exists(zip_path):
        os.remove(zip_path)
        print(f"Removed existing zip file: {zip_path}")

    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # 1. Add contents of the 'uploads' folder
            if os.path.isdir(uploads_source_path):
                print(f"Adding uploads from: {uploads_source_path}")
                # Add to a subfolder within the zip named after the dataset and "uploads"
                zip_directory_contents(uploads_source_path, zipf, os.path.join(safe_dataset_name, "uploads"))
            else:
                print(f"Warning: Uploads folder not found for dataset '{safe_dataset_name}' at {uploads_source_path}")

            # 2. Iterate through 'run_X' folders in the 'augmented' dataset path
            if os.path.isdir(augmented_dataset_path):
                for item in os.listdir(augmented_dataset_path):
                    item_path = os.path.join(augmented_dataset_path, item)
                    # Check if it's a directory and starts with 'run_'
                    if os.path.isdir(item_path) and item.startswith('run_'):
                        print(f"Adding augmented run from: {item_path}")
                        # Add to a subfolder within the zip named after the dataset and the run_id
                        zip_directory_contents(item_path, zipf, os.path.join(safe_dataset_name, item))
            else:
                print(f"Warning: Augmented folder not found for dataset '{safe_dataset_name}' at {augmented_dataset_path}")

        # --- Check if the zip file was actually created and has content ---
        if os.path.exists(zip_path) and os.path.getsize(zip_path) > 0:
            return send_file(zip_path, as_attachment=True, download_name=zip_filename)
        else:
            # If the zip file is empty or not created, it means no data was found to zip
            return jsonify({'error': f"No data found to create a full dataset zip for '{safe_dataset_name}'."}), 404

    except Exception as e:
        print(f"Error creating full dataset zip for '{safe_dataset_name}': {e}")
        return jsonify({'error': f"Failed to create full dataset zip: {str(e)}"}), 500

@app.route('/download_uploads/<dataset_name>')
def download_uploads(dataset_name):
    safe_dataset_name = secure_filename(dataset_name)
    uploads_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_dataset_name)
    zip_filename = f"{safe_dataset_name}_uploads.zip"
    # Store this zip in the augmented dataset's 'zip' subfolder for consistency
    output_zip_dir = os.path.join(app.config['AUGMENTED_FOLDER'], safe_dataset_name, "zip")
    os.makedirs(output_zip_dir, exist_ok=True)
    zip_path = os.path.join(output_zip_dir, zip_filename)

    # Remove existing zip if it exists
    if os.path.exists(zip_path):
        os.remove(zip_path)

    if os.path.isdir(uploads_path):
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zip_directory_contents(uploads_path, zipf, os.path.join(safe_dataset_name, "uploads"))
        if os.path.exists(zip_path) and os.path.getsize(zip_path) > 0:
            return send_file(zip_path, as_attachment=True, download_name=zip_filename)
        else:
            return jsonify({'error': 'Failed to create the uploads zip file or it was empty.'}), 500
    else:
        return jsonify({'error': f"Uploads for dataset '{safe_dataset_name}' not found."}), 404

@app.route('/delete_dataset/<dataset_name>', methods=['DELETE'])
def delete_dataset(dataset_name):
    safe_dataset_name = secure_filename(dataset_name)
    uploads_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_dataset_name)
    augmented_path = os.path.join(app.config['AUGMENTED_FOLDER'], safe_dataset_name)

    if os.path.isdir(uploads_path):
        try:
            shutil.rmtree(uploads_path)
            print(f"Deleted uploads folder: {uploads_path}")
        except Exception as e:
            return jsonify({'error': f'Error deleting uploads: {str(e)}'}), 500

    if os.path.isdir(augmented_path):
        try:
            shutil.rmtree(augmented_path)
            print(f"Deleted augmented folder: {augmented_path}")
        except Exception as e:
            return jsonify({'error': f'Error deleting augmented data: {str(e)}'}), 500

    # Update metadata
    if safe_dataset_name in augmentation_metadata:
        del augmentation_metadata[safe_dataset_name]
        try:
            with open(METADATA_FILE, 'w') as f:
                json.dump(augmentation_metadata, f, indent=4)
            print(f"Updated metadata after deleting dataset: {safe_dataset_name}")
        except Exception as e:
            print(f"Error updating metadata: {e}")

    return jsonify({'message': f'Dataset "{safe_dataset_name}" and associated data deleted successfully.'}), 200

@app.route('/delete_run/<dataset_name>/<run_id>', methods=['DELETE'])
def delete_run(dataset_name, run_id):
    safe_dataset_name = secure_filename(dataset_name)
    safe_run_id_to_delete = secure_filename(run_id)
    augmented_dataset_path = os.path.join(app.config['AUGMENTED_FOLDER'], safe_dataset_name)
    zip_folder_path = os.path.join(augmented_dataset_path, "zip")
    run_folder_to_delete = os.path.join(augmented_dataset_path, safe_run_id_to_delete)
    zip_filename_to_delete = None

    if os.path.isdir(run_folder_to_delete):
        try:
            shutil.rmtree(run_folder_to_delete)
            print(f"Deleted run folder: {run_folder_to_delete}")
        except Exception as e:
            return jsonify({'error': f'Error deleting run: {str(e)}'}), 500

        # Update metadata and re-index subsequent runs
        if safe_dataset_name in augmentation_metadata and "augmentation_runs" in augmentation_metadata[safe_dataset_name]:
            original_runs = augmentation_metadata[safe_dataset_name]["augmentation_runs"]
            updated_runs = []
            deleted_run_index = -1

            for i, run in enumerate(original_runs):
                if run.get("run_id") == safe_run_id_to_delete:
                    zip_filename_to_delete = run.get("augmented_zip")
                    deleted_run_index = i
                else:
                    updated_runs.append(run)

            augmentation_metadata[safe_dataset_name]["augmentation_runs"] = [] # Clear for re-indexing

            # Re-index the remaining runs
            new_run_index = 0
            runs_to_keep = []
            for run_info in updated_runs:
                new_run_id = f"run_{new_run_index}"
                old_run_id = run_info.get("run_id")
                run_info["run_id"] = new_run_id
                run_info["output_folder_name"] = new_run_id

                old_run_path = os.path.join(augmented_dataset_path, old_run_id)
                new_run_path = os.path.join(augmented_dataset_path, new_run_id)

                if os.path.isdir(old_run_path):
                    try:
                        os.rename(old_run_path, new_run_path)
                        print(f"Renamed '{old_run_path}' to '{new_run_path}'")
                        runs_to_keep.append(run_info)
                        new_run_index += 1
                    except Exception as e:
                        print(f"Error renaming run folder '{old_run_path}': {e}")
                else:
                    print(f"Warning: Run folder '{old_run_path}' not found during re-indexing.")

            augmentation_metadata[safe_dataset_name]["augmentation_runs"] = runs_to_keep

            try:
                with open(METADATA_FILE, 'w') as f:
                    json.dump(augmentation_metadata, f, indent=4)
                print(f"Updated and re-indexed runs in metadata for dataset '{safe_dataset_name}' after deleting '{safe_run_id_to_delete}'")
            except Exception as e:
                print(f"Error updating metadata: {e}")

        # Delete the associated zip file if found
        if zip_filename_to_delete:
            zip_file_path = os.path.join(zip_folder_path, zip_filename_to_delete)
            if os.path.exists(zip_file_path):
                try:
                    os.remove(zip_file_path)
                    print(f"Deleted associated zip file: {zip_file_path}")
                except Exception as e:
                    print(f"Error deleting zip file: {e}")

        return jsonify({'message': f'Run "{safe_run_id_to_delete}" and subsequent runs in dataset "{safe_dataset_name}" re-indexed successfully.'}), 200
    else:
        return jsonify({'error': f'Run "{safe_run_id_to_delete}" not found in dataset "{safe_dataset_name}"'}), 404

@app.route('/preview_uploads/<dataset_name>')
def preview_dataset_uploads(dataset_name):
    """
    Serves image previews for original uploaded datasets.

    Args:
        dataset_name (str): The name of the dataset.

    Returns:
        JSON: A JSON object containing a list of image data (name, base64 string, format)
              or an error message.
    """
    safe_dataset_name = secure_filename(dataset_name)
    base_folder = app.config['UPLOAD_FOLDER']
    target_path = os.path.join(base_folder, safe_dataset_name)

    if not os.path.isdir(target_path):
        return jsonify({"error": f"Uploads path '{target_path}' not found."}), 404

    image_files_data = []
    try:
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')
        files_in_folder = [f for f in os.listdir(target_path) if f.lower().endswith(image_extensions)]
        preview_limit = 50
        for filename in files_in_folder[:preview_limit]:
            filepath = os.path.join(target_path, filename)
            try:
                with Image.open(filepath) as img:
                    if img.mode == 'P' and 'transparency' in img.info:
                        img = img.convert("RGBA")
                    elif img.mode == 'LA' or (img.mode == 'L' and 'transparency' in img.info):
                        img = img.convert("RGBA")
                    elif img.mode not in ['RGB', 'RGBA', 'L']:
                        img = img.convert('RGB')

                    buffered = io.BytesIO()
                    save_format = "PNG"  # Default to PNG
                    if img.mode == 'RGB':
                        img.save(buffered, format="JPEG", quality=85)
                        save_format = "JPEG"
                    else:
                        img.save(buffered, format="PNG")

                    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                    image_files_data.append({
                        "name": filename,
                        "base64": img_str,
                        "format": save_format.lower()
                    })
            except Exception as e:
                print(f"Error processing image {filename} for preview: {e}")
                image_files_data.append({
                    "name": filename,
                    "error": "Could not load image for preview"
                })
    except Exception as e:
        print(f"Error listing files in {target_path}: {e}")
        return jsonify({"error": f"Error accessing content: {str(e)}"}), 500

    return jsonify({"images": image_files_data}), 200

@app.route('/preview_runs/<dataset_name>/<run_id>')
def preview_dataset_runs(dataset_name, run_id):
    """
    Serves image previews for a specific augmented run of a dataset.

    Args:
        dataset_name (str): The name of the dataset.
        run_id (str): The ID of the augmentation run.

    Returns:
        JSON: A JSON object containing a list of image data (name, base64 string, format)
              or an error message.
    """
    safe_dataset_name = secure_filename(dataset_name)
    safe_run_id = secure_filename(run_id)
    base_folder = app.config['AUGMENTED_FOLDER']
    target_path = os.path.join(base_folder, safe_dataset_name, safe_run_id)
    print(target_path)

    if not os.path.isdir(target_path):
        return jsonify({"error": f"Runs path '{target_path}' not found."}), 404

    image_files_data = []
    try:
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')
        files_in_folder = [f for f in os.listdir(target_path) if f.lower().endswith(image_extensions)]
        preview_limit = 50
        for filename in files_in_folder[:preview_limit]:
            filepath = os.path.join(target_path, filename)
            try:
                with Image.open(filepath) as img:
                    if img.mode == 'P' and 'transparency' in img.info:
                        img = img.convert("RGBA")
                    elif img.mode == 'LA' or (img.mode == 'L' and 'transparency' in img.info):
                        img = img.convert("RGBA")
                    elif img.mode not in ['RGB', 'RGBA', 'L']:
                        img = img.convert('RGB')

                    buffered = io.BytesIO()
                    save_format = "PNG"  # Default to PNG
                    if img.mode == 'RGB':
                        img.save(buffered, format="JPEG", quality=85)
                        save_format = "JPEG"
                    else:
                        img.save(buffered, format="PNG")

                    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                    image_files_data.append({
                        "name": filename,
                        "base64": img_str,
                        "format": save_format.lower()
                    })
            except Exception as e:
                print(f"Error processing image {filename} for preview: {e}")
                image_files_data.append({
                    "name": filename,
                    "error": "Could not load image for preview"
                })
    except Exception as e:
        print(f"Error listing files in {target_path}: {e}")
        return jsonify({"error": f"Error accessing content: {str(e)}"}), 500

    return jsonify({"images": image_files_data}), 200


# ------ Routing 1 : Image Augmentation  Ended --------




# ---- Routing 2 : CTGAN Csv Generation starting


@app.route('/generate-synthetic', methods=['POST'])
def generate_synthetic():
    file = request.files.get('file')
    epochs = int(request.form.get('epochs', 5))
    num_samples = int(request.form.get('samples', 100))

    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if not GRADIO_URL:
        return jsonify({"error": "Gradio URL not configured"}), 500

    try:
        temp_input_filename = secure_filename(file.filename)
        temp_input_path = os.path.join(UPLOAD_CSV_DIR, temp_input_filename)
        file.save(temp_input_path)

        # Get shape info for uploaded file
        df_input = pd.read_csv(temp_input_path)
        input_rows, input_cols = df_input.shape

        # Predict using Gradio
        client = Client(GRADIO_URL)
        prediction_result_path = client.predict(
            handle_file(temp_input_path),
            epochs,
            num_samples,
            api_name="/predict"
        )

        if not isinstance(prediction_result_path, str) or not os.path.exists(prediction_result_path):
            os.remove(temp_input_path)
            return jsonify({"error": "Failed to generate synthetic data"}), 500

        base, ext = os.path.splitext(temp_input_filename)
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        output_filename = f"{base}_gen_{timestamp}{ext}"
        output_path = os.path.join(RESULT_CSV_DIR, output_filename)

        shutil.copy(prediction_result_path, output_path)

        # Get shape info for generated file
        df_output = pd.read_csv(output_path)
        output_rows, output_cols = df_output.shape

        # Save metadata
        meta = load_csv_meta()
        meta.append({
            "original_file": temp_input_filename,
            "generated_file": output_filename,
            "epochs": epochs,
            "samples": num_samples,
            "timestamp": timestamp,
            "input_shape": {"rows": input_rows, "cols": input_cols},
            "output_shape": {"rows": output_rows, "cols": output_cols}
        })
        save_csv_meta(meta)

        return jsonify({"message": "Success", "uploaded_file": temp_input_filename, "output_file": output_filename})
    except Exception as e:
        if 'temp_input_path' in locals() and os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        return jsonify({"error": str(e)}), 500

@app.route('/get-csv-history', methods=['GET'])
def get_csv_history():
    return jsonify(load_csv_meta())


@app.route('/download-csv/<filetype>/<filename>', methods=['GET'])
def download_csv(filetype, filename):
    safe_filename = secure_filename(filename)
    if not safe_filename == filename:
        return jsonify({"error": "Invalid filename"}), 400

    if filetype == "uploaded":
        path = os.path.join(UPLOAD_CSV_DIR, safe_filename)
    elif filetype == "generated":
        path = os.path.join(RESULT_CSV_DIR, safe_filename)
    else:
        return jsonify({"error": "Invalid file type"}), 400

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    return send_file(path, as_attachment=True)

@app.route('/preview-csv/<filetype>/<filename>', methods=['GET'])
def preview_csv(filetype, filename):
    safe_filename = secure_filename(filename)

    if filetype == "uploaded":
        path = os.path.join(UPLOAD_CSV_DIR, safe_filename)
    elif filetype == "generated":
        path = os.path.join(RESULT_CSV_DIR, safe_filename)
    else:
        return jsonify({"error": "Invalid file type"}), 400

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    try:
        df = pd.read_csv(path)
        preview_data = df.to_dict(orient='records')  # Removed head(10)
        return jsonify({
            "columns": list(df.columns),
            "data": preview_data
        })
    except Exception as e:
        return jsonify({"error": f"Failed to preview: {str(e)}"}), 500


# ---- Routing 2 : CTGAN Csv Generation ended




# ---- Routing 3 : ESR GAN Image Super resolution start


@app.route('/upload_and_enhance', methods=['POST'])
def upload_and_enhance_images():
    dataset = request.form.get('dataset')
    files = request.files.getlist('files')
    if not dataset:
        return jsonify({"error": "Dataset name required"}), 400

    dataset_safe = secure_filename(dataset)
    base_path = os.path.join(ENHANCED_FOLDER, dataset_safe)
    originals_path = os.path.join(base_path, 'originals')
    predictions_path = os.path.join(base_path, 'predictions')
    zip_path = os.path.join(base_path, f"{dataset_safe}_enhanced.zip")
    os.makedirs(originals_path, exist_ok=True)
    os.makedirs(predictions_path, exist_ok=True)

    model_path = os.path.join("ESRGAN", "models", "RRDB_ESRGAN_x4.pth")

    enhanced_files = []
    for file in files:
        filename = secure_filename(file.filename)
        input_path = os.path.join(originals_path, filename)
        file.save(input_path)

        output_path = os.path.join(predictions_path, filename)  # Preserve file type
        try:
            enhance_esrgan_image(input_path, output_path, model_path)
            enhanced_files.append(filename)
        except Exception as e:
            print(f"Enhancement failed for {filename}: {e}")

    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for f in enhanced_files:
            zipf.write(os.path.join(predictions_path, f), arcname=f)

    enhancement_metadata[dataset_safe] = {
        "dataset": dataset_safe,
        "original_count": len(files),
        "enhanced_count": len(enhanced_files),
        "zip": f"{dataset_safe}_enhanced.zip"
    }
    with open(ENHANCED_METADATA_FILE, 'w') as f:
        json.dump(enhancement_metadata, f, indent=4)

    return jsonify({
        "message": "Upload and enhancement complete",
        "dataset": dataset_safe,
        "enhanced_count": len(enhanced_files),
        "zip_filename": f"{dataset_safe}_enhanced.zip"
    })


@app.route('/enhanced_datasets', methods=['GET'])
def list_enhanced_datasets():
    return jsonify(list(enhancement_metadata.values()))


@app.route('/download_enhanced/<type>/<dataset>')
def download_zip(type, dataset):
    safe = secure_filename(dataset)
    type = type.lower()

    if type == 'enhanced':
        zip_name = f"{safe}_enhanced.zip"
        folder = os.path.join(ENHANCED_FOLDER, safe, 'predictions')
    elif type == 'original':
        zip_name = f"{safe}_originals.zip"
        folder = os.path.join(ENHANCED_FOLDER, safe, 'originals')
    else:
        return jsonify({"error": "Invalid type. Use 'original' or 'enhanced'."}), 400

    zip_path = os.path.join(ENHANCED_FOLDER, safe, zip_name)

    if not os.path.exists(folder):
        return jsonify({"error": f"{type.capitalize()} folder not found"}), 404

    if not os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, _, files in os.walk(folder):
                for f in files:
                    full_path = os.path.join(root, f)
                    arcname = os.path.relpath(full_path, folder)
                    zipf.write(full_path, arcname=arcname)

    return send_file(zip_path, as_attachment=True)



@app.route('/preview_enhanced/<dataset>')
def preview_dataset(dataset):
    safe = secure_filename(dataset)
    originals_path = os.path.join(ENHANCED_FOLDER, safe, 'originals')
    predictions_path = os.path.join(ENHANCED_FOLDER, safe, 'predictions')

    if not os.path.exists(originals_path) or not os.path.exists(predictions_path):
        return jsonify({"error": "Dataset folders not found"}), 404

    original_files = sorted(os.listdir(originals_path))
    enhanced_files = sorted(os.listdir(predictions_path))

    return jsonify({
        "dataset": safe,
        "originals": original_files,
        "enhanced": enhanced_files
    })


@app.route('/image_enhanced/<dataset>/<type>/<filename>')
def serve_individual_image(dataset, type, filename):
    safe = secure_filename(dataset)
    type = type.lower()
    if type not in ['originals', 'predictions']:
        return jsonify({"error": "Invalid image type"}), 400

    folder = os.path.join(ENHANCED_FOLDER, safe, type)
    filepath = os.path.join(folder, secure_filename(filename))

    if not os.path.exists(filepath):
        return jsonify({"error": "Image not found"}), 404

    return send_file(filepath)


@app.route('/delete_enhanced_dataset/<dataset>', methods=['DELETE'])
def delete_enhanced_dataset(dataset):
    safe = secure_filename(dataset)
    dataset_folder = os.path.join(ENHANCED_FOLDER, safe)

    if not os.path.exists(dataset_folder):
        return jsonify({"error": "Dataset not found"}), 404

    try:
        shutil.rmtree(dataset_folder)
    except Exception as e:
        return jsonify({"error": f"Failed to delete dataset: {e}"}), 500

    if safe in enhancement_metadata:
        del enhancement_metadata[safe]
        with open(ENHANCED_METADATA_FILE, 'w') as f:
            json.dump(enhancement_metadata, f, indent=4)

    return jsonify({"message": f"Dataset '{safe}' deleted successfully."})



# ---- Routing 3 : ESR GAN Image Super resolution ended





@app.route('/generate-images', methods=['POST'])
def generate_images():
    truncation = float(request.form.get('truncation', 0.7))
    seed_start = int(request.form.get('seed_start', 0))
    seed_end = int(request.form.get('seed_end', 24))

    try:
        client = Client(GRADIO_URL_IMAGES)
        zip_path = client.predict(truncation, seed_start, seed_end, api_name="/predict")
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"images_{seed_start}_{seed_end}_{timestamp}.zip"
        saved_path = os.path.join(IMAGES_DIR, filename)
        shutil.copy(zip_path, saved_path)

        # Save metadata
        with open(GENERATED_IMAGES_META_FILE, "r+") as meta_file:
            data = json.load(meta_file)
            data.append({
                "timestamp": timestamp,
                "filename": filename,
                "seed_start": seed_start,
                "seed_end": seed_end,
                "truncation": truncation
            })
            meta_file.seek(0)
            json.dump(data, meta_file, indent=2)

        return jsonify({"message": "Images generated", "filename": filename})

    except Exception as e:
        print("Image generation failed:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/image-generation-history', methods=['GET'])
def get_image_generation_history():
    if not os.path.exists(GENERATED_IMAGES_META_FILE):
        return jsonify([])
    with open(GENERATED_IMAGES_META_FILE, "r") as meta_file:
        data = json.load(meta_file)
    return jsonify(data)


@app.route('/download-image-zip/<filename>', methods=['GET'])
def download_image_zip(filename):
    safe_name = secure_filename(filename)
    path = os.path.join(IMAGES_DIR, safe_name)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    return send_file(path, as_attachment=True)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)