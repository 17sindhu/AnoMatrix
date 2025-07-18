# 🚨 WiFi Anomaly Detection System 🔐

A real-time anomaly detection web application that identifies suspicious WiFi traffic using Machine Learning and displays live results on an interactive dashboard.

---

## 🧠 ML Model

We trained an **XGBoost Classifier** on the [CSE-CIC-IDS 2018 dataset](https://www.kaggle.com/datasets/solarmainframe/ids-intrusion-csv), specifically on one day's worth of WiFi traffic (`02-15-2018.csv`) due to dataset size (~6GB+).

### ✅ Model Highlights:
- Algorithm: **XGBoost**
- Accuracy: **99.67%**
- Binary Classification: `Normal (0)` vs `Anomaly (1)`
- Features Used: Flow Duration, Packet Stats, IAT Mean/Std, etc.

---

## 🧰 Tech Stack

| Layer         | Tools Used                        |
|---------------|-----------------------------------|
| 🧠 Model      | Python, Scikit-learn, XGBoost     |
| 🌐 Backend   | Flask (REST API)                  |
| 📊 Dashboard | HTML/CSS, JS (optional extension) |

---

