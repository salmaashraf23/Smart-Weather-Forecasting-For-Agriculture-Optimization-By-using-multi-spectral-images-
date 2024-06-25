from flask import Flask, request, jsonify
import rasterio
import pandas as pd
import numpy as np  # Import numpy for float64 type

app = Flask(__name__)

# Path to the georeferenced TIFF file
tiff_path = 'Finalll Stacked Layer_modified.tif'

# Path to the weather data CSV file
csv_file = 'weather_forecasting.csv'
df_weather = pd.read_csv(csv_file)

# Load crop data into a DataFrame
crop_df = pd.read_excel('model of crop.xlsx')

# List of labels to process
labels = ['wheat', 'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
          'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes',
          'watermelon', 'muskmelon', 'apple', 'orange']

# Dictionary to store the min and max values for each label
min_max_values = {}

# Calculate min and max values for each crop label
for label in labels:
    label_df = crop_df[crop_df['label'] == label]
    min_values = label_df.min()
    max_values = label_df.max()
    min_max_values[label] = {'min': min_values, 'max': max_values}

# Handle missing optional dependency 'openpyxl'
try:
    import openpyxl
except ImportError:
    openpyxl = None
    print("Warning: 'openpyxl' is not installed. Install it using 'pip install openpyxl'.")

def determine_agriculture_label(total_pixel_value):
    if total_pixel_value == 322:
        return "High agriculture"
    elif total_pixel_value == 183:
        return "Low agriculture"
    elif total_pixel_value == 296:
        return "Not preferred"
    else:
        return "Unknown"

def is_high_agriculture(x, y):
    try:
        with rasterio.open(tiff_path) as src:
            # Convert geographic coordinates to image row, col indices
            row, col = src.index(x, y)

            # Check if indices are within the valid range
            if row < 0 or row >= src.height or col < 0 or col >= src.width:
                return False, "Out of Bounds"

            # Determine the number of bands
            num_bands = src.count

            if num_bands == 3:
                # Read the pixel values for the 3 bands and convert to float64
                pixel_values = [np.float64(src.read(band)[row, col]) for band in range(1, num_bands + 1)]
                total_pixel_value = np.sum(pixel_values)  # Use np.sum to handle float64 correctly
                label = determine_agriculture_label(total_pixel_value)
                return True, label
            else:
                return False, "Unsupported number of bands"
    
    except Exception as e:
        return False, f"Error: {e}"

def rule_based_crop_classifier(Temp, Humidity, Precipitation):
    if (13.22 <= Temp <= 22.64) and (55.64 <= Humidity <= 72.22) and (0.0 <= Precipitation <= 55.97):
        return "wheat"
    elif (20.045414 <= Temp <= 26.929951) and (80.122675 <= Humidity <= 84.969072) and (182.561632 <= Precipitation <= 298.560117):
        return "rice"
    elif (18.041855 <= Temp <= 26.549864) and (55.282204 <= Humidity <= 74.829137) and (60.651715 <= Precipitation <= 109.751538):
        return "maize"
    elif (17.024985 <= Temp <= 20.995022) and (14.25804 <= Humidity <= 19.969789) and (65.113656 <= Precipitation <= 94.781896):
        return "chickpea"
    elif (15.330426 <= Temp <= 24.923601) and (18.09224 <= Humidity <= 24.969699) and (60.275525 <= Precipitation <= 149.744103):
        return "kidneybeans"
    elif (18.319104 <= Temp <= 36.977944) and (30.400468 <= Humidity <= 69.691413) and (90.054227 <= Precipitation <= 198.829881):
        return "pigeonpeas"
    elif (24.018254 <= Temp <= 31.999286) and (40.009334 <= Humidity <= 64.955854) and (30.92014 <= Precipitation <= 74.443307):
        return "mothbeans"
    elif (27.014704 <= Temp <= 29.914544) and (80.034996 <= Humidity <= 89.996156) and (36.120429 <= Precipitation <= 59.872321):
        return "mungbean"
    elif (25.097374 <= Temp <= 34.946616) and (60.065349 <= Humidity <= 69.961) and (60.417903 <= Precipitation <= 74.915595):
        return "blackgram"
    elif (18.064861 <= Temp <= 29.944139) and (60.091166 <= Humidity <= 69.923759) and (35.034848 <= Precipitation <= 54.939377):
        return "lentil"
    elif (18.07133 <= Temp <= 24.962732) and (85.129122 <= Humidity <= 94.998975) and (102.518476 <= Precipitation <= 112.475094):
        return "pomegranate"
    elif (25.010185 <= Temp <= 29.908885) and (75.031933 <= Humidity <= 84.978492) and (90.109781 <= Precipitation <= 119.84797):
        return "banana"
    elif (27.003155 <= Temp <= 35.990097) and (45.022364 <= Humidity <= 54.964053) and (89.291476 <= Precipitation <= 100.812466):
        return "mango"
    elif (8.825675 <= Temp <= 41.948657) and (80.016394 <= Humidity <= 83.983517) and (65.010953 <= Precipitation <= 74.915062):
        return "grapes"
    elif (24.043558 <= Temp <= 26.986037) and (80.026213 <= Humidity <= 89.984052) and (40.126504 <= Precipitation <= 59.7598):
        return "watermelon"
    elif (27.024151 <= Temp <= 29.943492) and (90.015064 <= Humidity <= 94.962187) and (20.211267 <= Precipitation <= 29.866814):
        return "muskmelon"
    elif (21.036527 <= Temp <= 23.996862) and (90.025751 <= Humidity <= 94.920481) and (100.117344 <= Precipitation <= 124.983162):
        return "apple"
    elif (10.010813 <= Temp <= 34.906653) and (90.006217 <= Humidity <= 94.964199) and (100.173796 <= Precipitation <= 119.694658):
        return "orange"
    else:
        return "Unknown"

@app.route('/get_data', methods=['GET'])
def get_data():
    try:
        # Get coordinates and time from request
        x = float(request.args.get('x'))
        y = float(request.args.get('y'))
        time = request.args.get('time')
        
        if time is None:
            return jsonify({"error": "Time parameter is missing"}), 400

        # Check if the coordinates correspond to high agriculture
        agri_result, agri_label = is_high_agriculture(x, y)
        
        if not agri_result:
            return jsonify({"error": agri_label}), 400

        # If the agricultural label is "Not preferred", return a specific message
        if agri_label == "Not preferred":
            return jsonify({"message": "This land is not suitable for agriculture"}), 200

        # Filter the DataFrame for the given time
        filtered_df = df_weather[df_weather['time'] == time]
        
        if not filtered_df.empty:
            row = filtered_df.iloc[0]
            filtered_data = {
                "Temperature_2M": row["Temperature.2M"],
                "relHumidity_2M": row["relHumidity.2M"],
                "totPrecip_s": row["totPrecip.s"],
                "Pressure": row["Pressure"]
            }
        else:
            return jsonify({"error": "Time not found"}), 404

        # Use the weather data to classify the crop
        crop_label = rule_based_crop_classifier(row["Temperature.2M"], row["relHumidity.2M"], row["totPrecip.s"])

        return jsonify({
            'x': x,
            'y': y,
            'agriculture_label': agri_label,
            'weather_data': filtered_data,
            'predicted_crop': crop_label
        })

    except ValueError:
        return jsonify({"error": "Invalid input for coordinates"}), 400

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)