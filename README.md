# 🩺 MediPredict — AI Disease Prediction System

An intelligent disease prediction system powered by Machine Learning that predicts diseases based on symptoms with **98.77% accuracy**. Built with Flask, scikit-learn, and a modern interactive UI.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.1-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [How It Works](#-how-it-works)
- [Model Performance](#-model-performance)
- [Dataset](#-dataset)
- [Technologies Used](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🎯 High Accuracy**: 98.77% accuracy on unseen test data using Gaussian Naive Bayes
- **🔍 Smart Search**: Real-time symptom search with autocomplete
- **💡 Intelligent Suggestions**: Dynamic related symptom recommendations based on current selection
- **📊 Top-5 Predictions**: Visual bar chart showing confidence scores for top 5 possible diseases
- **⚠️ Confidence Warnings**: Alerts when symptoms are too generic for reliable prediction
- **🎨 Modern UI**: Dark-themed, responsive interface with smooth animations
- **🏥 41 Diseases**: Covers a wide range of common and serious conditions
- **132 Symptoms**: Comprehensive symptom database for accurate predictions

---

## 🎬 Demo

**Live Demo**: Open `http://127.0.0.1:5000` after running the app

---

## 📁 Project Structure

```
disease_prediction_system/
│
├── app.py                      # Flask backend server
├── disease.ipynb               # Jupyter notebook with ML training & analysis
├── model_svc.pkl               # Trained Gaussian Naive Bayes model
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
│
├── Training.csv                # Training dataset (2,739 samples)
├── Testing.csv                 # Testing dataset (651 samples)
│
├── templates/
│   └── index.html              # Main web interface
│
└── static/
    ├── css/
    │   └── style.css           # UI styling
    └── js/
        └── app.js              # Frontend logic & interactivity
```

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/disease-prediction-system.git
cd disease-prediction-system
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies:**
- Flask 3.0.0
- pandas 2.3.3
- numpy 1.26.4
- scikit-learn 1.5.1
- gunicorn 21.2.0 (for production deployment)

### Step 3: Verify Installation

```bash
python -c "import flask, pandas, sklearn; print('All dependencies installed successfully!')"
```

---

## 💻 Usage

### Running the Application

1. **Start the Flask server:**

```bash
python app.py
```

2. **Open your browser and navigate to:**

```
http://127.0.0.1:5000
```

3. **Using the app:**
   - Search for symptoms using the search bar
   - Click symptoms to select them
   - Review selected symptoms in the right panel
   - Click "Predict Disease" to get results
   - View top 5 predictions with confidence scores

### Keyboard Shortcuts

- `/` — Focus search bar
- `Ctrl + Enter` — Predict disease (when symptoms are selected)
- `Esc` — Clear search

### Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## 🧠 How It Works

### 1. Data Collection & Preprocessing

- **Original Dataset**: 4,920 samples with 132 symptoms across 41 diseases
- **Problem**: Only 5-10 unique patterns per disease, 94% duplicates → 100% data leakage
- **Solution**: Dataset augmentation generating realistic symptom combinations

### 2. Data Augmentation

```python
# For each disease:
# 1. Extract all symptoms that appear in original patterns
# 2. Generate new valid combinations by random sampling
# 3. Ensure no test pattern exists in training set
# Result: 2,739 training samples, 651 test samples, 0% leakage
```

### 3. Model Training

Three models were compared:

| Model | Train Accuracy | Test Accuracy |
|-------|---------------|---------------|
| **Gaussian Naive Bayes** | 97.04% | **98.77%** ✅ |
| Random Forest | 98.14% | 97.24% |
| SVC (RBF kernel) | 96.97% | 96.93% |

**Winner**: Gaussian Naive Bayes (best generalization)

### 4. Prediction Pipeline

```
User Input (symptoms) 
    ↓
Binary Vector [0,0,1,0,1,...] (132 features)
    ↓
Gaussian Naive Bayes Model
    ↓
predict_proba() → Real probability scores
    ↓
Top-5 diseases with confidence percentages
```

### 5. Confidence Scoring

- **High Confidence**: Top prediction > 50% probability
- **Low Confidence**: Top prediction < 50% → Warning shown
- **Ambiguous**: Multiple diseases with similar probabilities

---

## 📊 Model Performance

### Confusion Matrix (Test Set)

```
Overall Accuracy: 98.77%
Precision (weighted): 98.81%
Recall (weighted): 98.77%
F1-Score (weighted): 98.78%
```

### Cross-Validation (10-Fold)

```
Mean Accuracy: 97.89%
Std Deviation: 0.82%
```

### Feature Importance (Top 10 Symptoms)

1. `muscle_pain` — 1.75%
2. `itching` — 1.74%
3. `chest_pain` — 1.58%
4. `vomiting` — 1.57%
5. `dark_urine` — 1.53%
6. `fatigue` — 1.51%
7. `high_fever` — 1.49%
8. `headache` — 1.47%
9. `nausea` — 1.45%
10. `abdominal_pain` — 1.43%

---

## 📚 Dataset

### Overview

- **Total Samples**: 3,390 (after augmentation)
- **Training Set**: 2,739 samples (80%)
- **Testing Set**: 651 samples (20%)
- **Features**: 132 binary symptom indicators
- **Target**: 41 disease classes

### Diseases Covered

<details>
<summary>Click to expand full disease list</summary>

1. Fungal infection
2. Allergy
3. GERD
4. Chronic cholestasis
5. Drug Reaction
6. Peptic ulcer disease
7. AIDS
8. Diabetes
9. Gastroenteritis
10. Bronchial Asthma
11. Hypertension
12. Migraine
13. Cervical spondylosis
14. Paralysis (brain hemorrhage)
15. Jaundice
16. Malaria
17. Chicken pox
18. Dengue
19. Typhoid
20. Hepatitis A
21. Hepatitis B
22. Hepatitis C
23. Hepatitis D
24. Hepatitis E
25. Alcoholic hepatitis
26. Tuberculosis
27. Common Cold
28. Pneumonia
29. Dimorphic hemorrhoids (piles)
30. Heart attack
31. Varicose veins
32. Hypothyroidism
33. Hyperthyroidism
34. Hypoglycemia
35. Osteoarthritis
36. Arthritis
37. Vertigo (Paroxysmal Positional)
38. Acne
39. Urinary tract infection
40. Psoriasis
41. Impetigo

</details>

### Data Augmentation Strategy

**Before Augmentation:**
- 5-10 unique patterns per disease
- 100% test-train leakage
- Artificial 100% accuracy

**After Augmentation:**
- 5-157 unique patterns per disease (avg ~80)
- 0% test-train leakage
- Real-world 98.77% accuracy

---

## 🛠️ Technologies Used

### Backend
- **Flask 3.0.0** — Web framework
- **scikit-learn 1.5.1** — Machine learning
- **pandas 2.3.3** — Data manipulation
- **NumPy 1.26.4** — Numerical computing

### Frontend
- **HTML5** — Structure
- **CSS3** — Styling (custom dark theme)
- **Vanilla JavaScript** — Interactivity (no frameworks)

### Machine Learning
- **Gaussian Naive Bayes** — Primary model
- **Label Encoding** — Target variable encoding
- **Stratified Train-Test Split** — Balanced class distribution

### Development Tools
- **Jupyter Notebook** — Model development & analysis
- **Matplotlib & Seaborn** — Data visualization
- **pickle** — Model serialization

---

## 🔬 Running the Jupyter Notebook

To explore the ML training process:

```bash
jupyter notebook disease.ipynb
```

**Notebook Contents:**
1. Data loading & exploration
2. Data cleaning & preprocessing
3. **Dataset augmentation** (new)
4. Model training & comparison
5. Cross-validation
6. Confusion matrix visualization
7. Feature importance analysis
8. Model saving

---

## 🚢 Deployment

### Local Development

```bash
python app.py
```

### Production (using Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Docker (Optional)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t medipredict .
docker run -p 5000:5000 medipredict
```

---

## ⚠️ Disclaimer

**This tool is for educational purposes only.**

- Not a substitute for professional medical advice
- Always consult a qualified healthcare provider for diagnosis and treatment
- Predictions are based on statistical patterns, not clinical expertise
- Do not use for self-diagnosis or treatment decisions

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Ideas for Contribution

- [ ] Add more diseases and symptoms
- [ ] Implement user authentication
- [ ] Add prediction history tracking
- [ ] Create mobile app version
- [ ] Add multi-language support
- [ ] Integrate with medical APIs
- [ ] Add symptom severity levels
- [ ] Implement ensemble voting model

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Muhammad Zeeshan**
- GitHub: [@zeeshanrana707](https://github.com/zeeshanrana707)
- Email: rh3783901@gmail.com

---

## 🙏 Acknowledgments

- Dataset source: [Kaggle Disease Symptom Prediction](https://www.kaggle.com/)
- Inspired by real-world medical diagnosis systems
- Built with ❤️ for healthcare innovation

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/zeeshanrana707/disease-prediction-system/issues) page
2. Create a new issue with detailed description
3. Contact via email: rh3783901@gmail.com

---

## 🔄 Changelog

### Version 2.0.0 (Current)
- ✅ Dataset augmentation (0% leakage)
- ✅ Real accuracy: 98.77%
- ✅ Gaussian Naive Bayes model
- ✅ Real probability scores
- ✅ Confidence warnings
- ✅ Feature importance analysis

### Version 1.0.0
- Initial release
- Basic SVC model
- 100% accuracy (data leakage)

---

## 📈 Future Roadmap

- [ ] **Q2 2026**: Add symptom duration tracking
- [ ] **Q3 2026**: Implement patient history
- [ ] **Q4 2026**: Mobile app (React Native)
- [ ] **2027**: Integration with EHR systems

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with 💙 by the MediPredict Team

</div>
