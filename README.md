# GOTE Frontend - Guardians of The Exoplanets

Modern web interface for exoplanet classification powered by Machine Learning. Built with Next.js 14 and real-time streaming capabilities.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Radix UI
- **3D Visualization**: Three.js + React Three Fiber
- **Charts**: Recharts
- **Animations**: Framer Motion

## 🌟 Features

### 🔭 Explorer Mode
*Simplified exoplanet classification for quick predictions*

- **Single/Batch Classification**: Manual input or CSV upload
- **Real-time Processing**: Live pipeline status with step-by-step tracking
- **3D Planet Visualization**: Interactive planet rendering with physical parameters
- **Dataset Support**: Kepler & TESS telescopes
- **Candidate History**: Track classification changes over time by object ID
- **Confidence Scores**: Probability distribution for each prediction
- **Results Export**: (Coming soon) CSV, PDF reports, and shareable links

#### Classification Categories
- **CONFIRMED**: Validated exoplanet
- **CANDIDATE**: Potential exoplanet requiring further analysis
- **FALSE POSITIVE**: Not an exoplanet

### 🧬 Researcher Mode
*Advanced ML analysis with hyperparameter tuning and performance metrics*

All Explorer features plus:

- **Hyperparameter Optimization**: Custom XGBoost configuration
  - Learning rate
  - Max depth
  - N estimators
  - Subsample ratio
  - Min child weight
  - Gamma
  - Colsample bytree
  
- **Model Comparison**: Baseline vs Optimized predictions side-by-side

- **Performance Analytics Dashboard**:
  - K-Fold Cross-Validation metrics (Accuracy, F1, Precision, Recall)
  - Test Set evaluation
  - Blind Test validation
  - Confusion matrices (Test & Blind)
  - Training time analysis
  - Feature importance visualization

- **Technical Pipeline Monitoring**:
  - Step-by-step execution breakdown (I/O, ETL, Model, Training, Inference)
  - Real-time duration tracking per step
  - Progress indicators and status badges

- **Batch CSV Analysis**: Statistical aggregation across multiple predictions

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gote-frontend.git
cd gote-frontend

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
gote-frontend/
├── app/                      # Next.js App Router
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/               # React components
│   ├── ui/                   # Shadcn UI primitives
│   ├── explorer-flow.tsx     # Explorer mode orchestration
│   ├── researcher-flow.tsx   # Researcher mode orchestration
│   ├── data-input-section.tsx # Data upload & manual input
│   ├── results-section.tsx   # Classification results display
│   ├── analytics-dashboard.tsx # Performance metrics
│   └── ...                   # Additional components
├── lib/                      # Utilities & contexts
│   ├── mode-context.tsx      # Mode switching (Explorer/Researcher)
│   ├── planet-data-context.tsx # Global state management
│   └── utils.ts              # Helper functions
└── public/                   # Static assets
```

## 🔄 Data Flow

1. **Input**: User uploads CSV or enters manual data
2. **Stream**: Real-time SSE connection to backend (`https://gote-backend.onrender.com`)
3. **Processing**: Backend pipeline (Read → Preprocess → Train/Load Model → Predict)
4. **Visualization**: Results rendered with charts, tables, and 3D visuals
5. **Export**: (Coming soon) Download results in multiple formats

## 🎨 UI Highlights

- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Real-time Updates**: SSE streaming for pipeline status
- **Smooth Animations**: Framer Motion transitions
- **Technical Aesthetics**: Minimalist, data-focused design

## 📊 Backend Integration

The frontend communicates with the GOTE backend via:
- **Upload endpoint**: `/upload/exoplanet` (multipart/form-data)
- **Classification endpoint**: `/classify` (Server-Sent Events stream)
- **Datasets**: Kepler (37+ features) & TESS (12+ features)

### Request Flow
```typescript
// Manual input with hyperparameters
POST /classify
{
  mode: "researcher",
  dataset: "kepler",
  data: { /* features */ },
  hyperparameters: {
    learning_rate: 0.1,
    max_depth: 4,
    // ...
  }
}

// Response (SSE Stream)
data: {"step": 1, "status": "Reading your manual data"}
data: {"step": 2, "status": "Preprocessing your data"}
data: {"step": 5, "status": "Training finished", "details": [...]}
data: {"step": 7, "status": "Done!", "predictions": [...]}
```

## 🚧 Roadmap

- [ ] Export functionality (CSV, PDF, Share links)
- [ ] Advanced filtering for batch results
- [ ] Model versioning and A/B testing
- [ ] API authentication
- [ ] Batch processing queue
- [ ] Collaborative workspaces

## 📄 License

This project is part of the GOTE (Guardians of The Exoplanets) research initiative.

---

**Built for space researchers, by space enthusiasts** 🌌

