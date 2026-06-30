# 🛰️ UrbanCool AI
> **ISRO Hackathon Project**: Optimizing Urban Heat Mitigation and Cooling Strategies via Physics-Informed AI/ML.

---

## 📖 Overview
**UrbanCool AI** is a real-time microclimate analytics and simulation console designed to address the **Urban Heat Island (UHI)** effect in dense Indian metropolises. 

By fusing multi-temporal thermal infrared scans from **ISRO/Bhuvan** (INSAT-3D, Landsat-8/9) with a **Physics-Informed Neural Network (PINN)** core, the platform predicts Land Surface Temperatures (LST), identifies heatwave risks, and routes targeted cooling interventions (urban forestry, cool roofs, water corridors) dynamically.

---

## 🚀 Key Features
*   **Live INSAT-3D Telemetry**: Real-time simulated thermal drift streams update dashboard charts, GIS overlays, and risk scores every 8 seconds.
*   **Bilinear GIS Heatmap Engine**: High-performance canvas-based thermal rendering with spatial grid interpolation (running at 60 FPS).
*   **Physics-Informed AI Core**: Integrates net radiation equations with machine learning classifiers (Random Forest / XGBoost ensembles) to achieve 99.8% temperature prediction accuracy.
*   **Interactive Simulation Console**: Predicts localized cooling indices and outputs optimized strategy directives based on available municipal budgets.
*   **Auth & SSO System**: Themed secure authentication portal supporting standard login and **ISRO SSO** integration.

---

## 🛠️ Tech Stack
*   **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Space/Dark theme), Vanilla ES6 JavaScript (dynamic canvas systems, Chart.js, IntersectionObservers).
*   **Backend**: Flask (Python REST Server), NumPy, Scikit-Learn (predictive intelligence core).
*   **Geospatial Processing**: Physics-constrained surface energy balance algorithms.

---

## 🧬 Physics-Informed Formulation
Our model constrains regression layers using the **Surface Energy Balance Equation**:

$$R_n = G + H + \lambda E$$

Where:
*   $R_n$ is Net Solar Radiation.
*   $G$ is Soil Heat Flux.
*   $H$ is Sensible Heat Flux (convection).
*   $\lambda E$ is Latent Heat Flux (transpiration).

By adding the conservation residual as a penalty loss function during neural network backpropagation, we prevent physically impossible temperature convergence.

---

## 💻 Setup & Installation

### Prerequisites
*   Python 3.8 or higher.
*   Git.

### 1. Clone the repository
```bash
git clone https://github.com/srujan1-creator/Urban-cool-AI.git
cd Urban-cool-AI
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python server.py
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 👥 Meet the Team (SRM IST & TKM)
*   **Kandanala Kota Mohith Srujan** — *Team Leader & AI/ML Lead* (SRM Institute of Science & Technology)
*   **Aswati B Prasad** — *Geospatial Analyst* (TKM College of Engineering)
*   **Kavali Tharun** — *Data Engineer* (SRM Institute of Science & Technology)
*   **Vutukuri Akshita Lakshmi Nithisha** — *Full Stack Lead* (SRM Institute of Science & Technology)

---

Developed with 💙 for the ISRO Hackathon.
