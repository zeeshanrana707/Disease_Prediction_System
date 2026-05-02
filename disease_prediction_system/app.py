from flask import Flask, render_template, request, jsonify
import pandas as pd
import pickle
import warnings

warnings.filterwarnings("ignore")

app = Flask(__name__)

# Load and clean data
df = pd.read_csv("Training.csv")
df = df.loc[:, ~df.columns.str.contains("^Unnamed")]

X = df.drop("prognosis", axis=1)
y = df["prognosis"]

symptoms = list(X.columns)

# Load model
model = pickle.load(open("model_svc.pkl", "rb"))

# Label encoder mapping (SVC returns numeric classes)
# Build a mapping from encoded int -> disease name
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
le.fit(y)

# Disease info dictionary for descriptions
disease_info = {
    "Fungal infection": {"icon": "🍄", "severity": "Mild", "color": "#27ae60"},
    "Allergy": {"icon": "🤧", "severity": "Mild", "color": "#27ae60"},
    "GERD": {"icon": "🔥", "severity": "Moderate", "color": "#f39c12"},
    "Chronic cholestasis": {"icon": "🫀", "severity": "Moderate", "color": "#f39c12"},
    "Drug Reaction": {"icon": "💊", "severity": "Moderate", "color": "#f39c12"},
    "Peptic ulcer diseae": {"icon": "🫃", "severity": "Moderate", "color": "#f39c12"},
    "AIDS": {"icon": "🔴", "severity": "Severe", "color": "#e74c3c"},
    "Diabetes ": {"icon": "🩸", "severity": "Moderate", "color": "#f39c12"},
    "Diabetes": {"icon": "🩸", "severity": "Moderate", "color": "#f39c12"},
    "Gastroenteritis": {"icon": "🤢", "severity": "Mild", "color": "#27ae60"},
    "Bronchial Asthma": {"icon": "🫁", "severity": "Moderate", "color": "#f39c12"},
    "Hypertension ": {"icon": "❤️", "severity": "Moderate", "color": "#f39c12"},
    "Hypertension": {"icon": "❤️", "severity": "Moderate", "color": "#f39c12"},
    "Migraine": {"icon": "🧠", "severity": "Moderate", "color": "#f39c12"},
    "Cervical spondylosis": {"icon": "🦴", "severity": "Moderate", "color": "#f39c12"},
    "Paralysis (brain hemorrhage)": {"icon": "🧠", "severity": "Severe", "color": "#e74c3c"},
    "Jaundice": {"icon": "🟡", "severity": "Moderate", "color": "#f39c12"},
    "Malaria": {"icon": "🦟", "severity": "Severe", "color": "#e74c3c"},
    "Chicken pox": {"icon": "🔴", "severity": "Mild", "color": "#27ae60"},
    "Dengue": {"icon": "🦟", "severity": "Severe", "color": "#e74c3c"},
    "Typhoid": {"icon": "🌡️", "severity": "Severe", "color": "#e74c3c"},
    "hepatitis A": {"icon": "🫀", "severity": "Moderate", "color": "#f39c12"},
    "Hepatitis B": {"icon": "🫀", "severity": "Severe", "color": "#e74c3c"},
    "Hepatitis C": {"icon": "🫀", "severity": "Severe", "color": "#e74c3c"},
    "Hepatitis D": {"icon": "🫀", "severity": "Severe", "color": "#e74c3c"},
    "Hepatitis E": {"icon": "🫀", "severity": "Moderate", "color": "#f39c12"},
    "Alcoholic hepatitis": {"icon": "🍺", "severity": "Severe", "color": "#e74c3c"},
    "Tuberculosis": {"icon": "🫁", "severity": "Severe", "color": "#e74c3c"},
    "Common Cold": {"icon": "🤧", "severity": "Mild", "color": "#27ae60"},
    "Pneumonia": {"icon": "🫁", "severity": "Severe", "color": "#e74c3c"},
    "Dimorphic hemmorhoids(piles)": {"icon": "🩸", "severity": "Mild", "color": "#27ae60"},
    "Heart attack": {"icon": "💔", "severity": "Severe", "color": "#e74c3c"},
    "Varicose veins": {"icon": "🦵", "severity": "Mild", "color": "#27ae60"},
    "Hypothyroidism": {"icon": "🦋", "severity": "Moderate", "color": "#f39c12"},
    "Hyperthyroidism": {"icon": "🦋", "severity": "Moderate", "color": "#f39c12"},
    "Hypoglycemia": {"icon": "🩸", "severity": "Moderate", "color": "#f39c12"},
    "Osteoarthristis": {"icon": "🦴", "severity": "Moderate", "color": "#f39c12"},
    "Arthritis": {"icon": "🦴", "severity": "Moderate", "color": "#f39c12"},
    "(vertigo) Paroymsal  Positional Vertigo": {"icon": "💫", "severity": "Mild", "color": "#27ae60"},
    "Acne": {"icon": "😣", "severity": "Mild", "color": "#27ae60"},
    "Urinary tract infection": {"icon": "🚽", "severity": "Moderate", "color": "#f39c12"},
    "Psoriasis": {"icon": "🩹", "severity": "Mild", "color": "#27ae60"},
    "Impetigo": {"icon": "🩹", "severity": "Mild", "color": "#27ae60"},
}


@app.route("/")
def home():
    # Format symptom names for display
    formatted = [{"value": s, "label": s.replace("_", " ").title()} for s in symptoms]
    formatted.sort(key=lambda x: x["label"])
    return render_template("index.html", symptoms=formatted)


@app.route("/filter", methods=["POST"])
def filter_symptoms():
    data = request.get_json()
    selected = data.get("selected", [])

    filtered_df = df.copy()
    for symptom in selected:
        if symptom in filtered_df.columns:
            filtered_df = filtered_df[filtered_df[symptom] == 1]

    remaining = (
        filtered_df.drop("prognosis", axis=1)
        .sum()
        .loc[lambda x: x > 0]
        .index.tolist()
    )
    remaining = [s for s in remaining if s not in selected]
    remaining_formatted = [{"value": s, "label": s.replace("_", " ").title()} for s in remaining]
    remaining_formatted.sort(key=lambda x: x["label"])

    possible = filtered_df["prognosis"].value_counts().head(5).index.tolist()

    return jsonify({"symptoms": remaining_formatted, "diseases": possible})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        selected = data.get("selected", [])

        if not selected:
            return jsonify({"error": "Please select at least one symptom."})

        input_vector = [0] * len(X.columns)
        for symptom in selected:
            if symptom in X.columns:
                idx = list(X.columns).index(symptom)
                input_vector[idx] = 1

        pred_encoded = model.predict([input_vector])[0]
        pred_disease = le.inverse_transform([pred_encoded])[0].strip()

        # Get top-5 predictions using predict_proba (real probabilities)
        try:
            proba = model.predict_proba([input_vector])[0]
            top_indices = proba.argsort()[::-1][:5]

            top_prob = proba[top_indices[0]]
            low_confidence = bool(top_prob < 0.5)  # below 50% = ambiguous

            top_diseases = []
            for i, idx in enumerate(top_indices):
                name = le.inverse_transform([idx])[0].strip()
                pct  = round(float(proba[idx]) * 100, 1)
                info = disease_info.get(name, {"icon": "🏥", "severity": "Unknown", "color": "#95a5a6"})
                top_diseases.append({
                    "disease": name,
                    "score": pct,
                    "rank": i + 1,
                    "icon": info["icon"],
                    "severity": info["severity"],
                    "color": info["color"],
                })
        except Exception:
            # Fallback: decision_function for models without predict_proba
            try:
                scores    = model.decision_function([input_vector])[0]
                top_indices = scores.argsort()[::-1][:5]
                top_min   = scores[top_indices[-1]]
                top_max   = scores[top_indices[0]]
                top_range = top_max - top_min if top_max != top_min else 1.0
                low_confidence = bool((top_max - top_min) < 5.0)
                top_diseases = []
                for i, idx in enumerate(top_indices):
                    name = le.inverse_transform([idx])[0].strip()
                    normalized = round(20 + ((scores[idx] - top_min) / top_range) * 80, 1)
                    info = disease_info.get(name, {"icon": "🏥", "severity": "Unknown", "color": "#95a5a6"})
                    top_diseases.append({
                        "disease": name, "score": normalized, "rank": i + 1,
                        "icon": info["icon"], "severity": info["severity"], "color": info["color"],
                    })
            except Exception:
                low_confidence = False
                info = disease_info.get(pred_disease, {"icon": "🏥", "severity": "Unknown", "color": "#95a5a6"})
                top_diseases = [{"disease": pred_disease, "score": 100.0, "rank": 1,
                                 "icon": info["icon"], "severity": info["severity"], "color": info["color"]}]

        primary_info = disease_info.get(pred_disease, {"icon": "🏥", "severity": "Unknown", "color": "#95a5a6"})

        return jsonify({
            "disease": pred_disease,
            "icon": primary_info["icon"],
            "severity": primary_info["severity"],
            "color": primary_info["color"],
            "top_diseases": top_diseases,
            "symptom_count": len(selected),
            "low_confidence": low_confidence,
        })

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/symptoms/all")
def all_symptoms():
    formatted = [{"value": s, "label": s.replace("_", " ").title()} for s in symptoms]
    formatted.sort(key=lambda x: x["label"])
    return jsonify(formatted)


if __name__ == "__main__":
    app.run(debug=True)
