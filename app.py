from flask import Flask, request, jsonify
import joblib
import numpy as np

# Load model and scaler
model = joblib.load('xgb_model.joblib')
scaler = joblib.load('scaler.joblib')

# Features used during training (must match input JSON)
FEATURES = [
    'Flow Duration', 'Tot Fwd Pkts', 'Tot Bwd Pkts',
    'TotLen Fwd Pkts', 'TotLen Bwd Pkts',
    'Fwd Pkt Len Mean', 'Bwd Pkt Len Mean',
    'Flow IAT Mean', 'Flow IAT Std', 'Fwd IAT Mean'
]

# Initialize Flask
app = Flask(__name__)

@app.route('/')
def index():
    return "WiFi Anomaly Detection API is Live 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        # Ensure all features are present
        if not all(feature in data for feature in FEATURES):
            return jsonify({'error': 'Missing one or more required features.', 'required': FEATURES}), 400

        input_data = np.array([data[feature] for feature in FEATURES]).reshape(1, -1)
        input_scaled = scaler.transform(input_data)
        prediction = model.predict(input_scaled)[0]

        return jsonify({
            'prediction': int(prediction),
            'status': 'Anomaly' if prediction == 1 else 'Normal'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
