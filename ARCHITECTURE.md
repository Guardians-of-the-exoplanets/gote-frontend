# 🏗️ Arquitetura do Guardians of The Exoplanets

## Visão Geral

Guardians of The Exoplanets é uma aplicação web full-stack moderna construída com arquitetura modular e escalável, seguindo princípios de Clean Architecture e Domain-Driven Design.

---

## 📐 Diagrama de Arquitetura

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 App Router                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Pages      │  │  Components  │  │   Hooks     │ │ │
│  │  │  (RSC/CSR)   │  │  (shadcn/ui) │  │  (Custom)   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                         API LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  FastAPI (Python)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│ │
│  │  │ Auth     │  │ Data     │  │ Model    │  │ Export ││ │
│  │  │ Routes   │  │ Routes   │  │ Routes   │  │ Routes ││ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              ML Pipeline & Services                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│ │
│  │  │ Data     │  │ Feature  │  │ Model    │  │ Vetting││ │
│  │  │ Ingestion│  │ Engineer │  │ Training │  │ Service││ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ TimescaleDB  │  │ Redis Cache  │     │
│  │ (Metadata)   │  │ (Time Series)│  │ (Sessions)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🎯 Camadas da Aplicação

### 1. Frontend Layer (Next.js 14)

#### Estrutura de Diretórios

\`\`\`
app/
├── (routes)/
│   ├── page.tsx                 # Home page
│   ├── explorer/                # Modo Explorador
│   │   └── page.tsx
│   ├── researcher/              # Modo Pesquisador
│   │   └── page.tsx
│   ├── api/                     # API Routes (Next.js)
│   │   ├── upload/
│   │   └── export/
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles

components/
├── ui/                          # shadcn/ui components (60+)
├── sections/                    # Page sections
│   ├── header.tsx
│   ├── data-input-section.tsx
│   ├── model-config-section.tsx
│   ├── results-section.tsx
│   ├── explainability-section.tsx
│   ├── export-section.tsx
│   └── bonus-section.tsx
├── charts/                      # Recharts components
│   ├── confusion-matrix.tsx
│   ├── roc-curve.tsx
│   └── feature-importance.tsx
└── forms/                       # Form components
    ├── file-upload.tsx
    └── manual-data-form.tsx

lib/
├── utils.ts                     # Utility functions
├── api-client.ts                # API client (fetch wrapper)
└── validators.ts                # Zod schemas

hooks/
├── use-mobile.ts                # Mobile detection
├── use-toast.ts                 # Toast notifications
└── use-data-upload.ts           # Data upload logic
\`\`\`

#### Padrões de Componentes

**Server Components (RSC)**:
- Páginas principais
- Layouts
- Componentes estáticos

**Client Components**:
- Formulários interativos
- Gráficos e visualizações
- Componentes com estado

**Exemplo de Componente**:

\`\`\`tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function DataUpload() {
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleUpload = async () => {
    if (!file) return
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      toast({
        title: 'Sucesso!',
        description: 'Arquivo enviado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar arquivo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  )
}
\`\`\`

---

### 2. API Layer (FastAPI - Planejado)

#### Estrutura de Rotas

\`\`\`python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Guardians of The Exoplanets API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers import data, model, vetting, export

app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(model.router, prefix="/api/model", tags=["model"])
app.include_router(vetting.router, prefix="/api/vetting", tags=["vetting"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
\`\`\`

#### Endpoints Principais

\`\`\`
POST   /api/data/upload          # Upload de dados (CSV/JSON/FITS)
GET    /api/data/validate        # Validação de schema
POST   /api/data/preprocess      # Pré-processamento

POST   /api/model/train          # Treinar modelo
POST   /api/model/predict        # Fazer predições
GET    /api/model/metrics        # Obter métricas
GET    /api/model/explain        # Explicabilidade (SHAP)

GET    /api/vetting/queue        # Fila de vetting
POST   /api/vetting/submit       # Submeter voto
GET    /api/vetting/stats        # Estatísticas

POST   /api/export/csv           # Exportar CSV
POST   /api/export/pdf           # Gerar PDF
POST   /api/export/share         # Criar link compartilhável
\`\`\`

---

### 3. Business Logic Layer (ML Pipeline)

#### Pipeline de Dados

\`\`\`python
# services/data_pipeline.py

class DataPipeline:
    def __init__(self):
        self.preprocessor = Preprocessor()
        self.feature_engineer = FeatureEngineer()
        self.validator = DataValidator()
    
    def process(self, raw_data: pd.DataFrame) -> ProcessedData:
        # 1. Validação
        validated = self.validator.validate(raw_data)
        
        # 2. Detecção de eventos
        events = self.detect_transit_events(validated)
        
        # 3. Normalização
        normalized = self.preprocessor.normalize(events)
        
        # 4. Feature engineering
        features = self.feature_engineer.extract(normalized)
        
        return ProcessedData(features=features, metadata=...)
    
    def detect_transit_events(self, data):
        # Box Least Squares (BLS) algorithm
        pass
\`\`\`

#### Arquitetura do Modelo ML

\`\`\`python
# models/multi_branch_model.py

import tensorflow as tf

class MultiBranchExoplanetClassifier(tf.keras.Model):
    def __init__(self):
        super().__init__()
        
        # Branch 1: Transformer 1D (time series)
        self.transformer_branch = TransformerEncoder(
            num_layers=4,
            d_model=128,
            num_heads=8,
            dff=512
        )
        
        # Branch 2: CNN 2D (folded light curves)
        self.cnn_branch = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, 3, activation='relu'),
            tf.keras.layers.MaxPooling2D(),
            tf.keras.layers.Conv2D(64, 3, activation='relu'),
            tf.keras.layers.GlobalAveragePooling2D()
        ])
        
        # Branch 3: MLP (scalar features)
        self.mlp_branch = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu')
        ])
        
        # Fusion layer
        self.fusion = tf.keras.layers.Dense(256, activation='relu')
        
        # Output with uncertainty
        self.output_layer = tf.keras.layers.Dense(2)  # [mean, std]
    
    def call(self, inputs):
        time_series, folded_lc, scalars = inputs
        
        # Process each branch
        t_out = self.transformer_branch(time_series)
        c_out = self.cnn_branch(folded_lc)
        m_out = self.mlp_branch(scalars)
        
        # Concatenate and fuse
        combined = tf.concat([t_out, c_out, m_out], axis=-1)
        fused = self.fusion(combined)
        
        # Output with uncertainty quantification
        output = self.output_layer(fused)
        mean, log_std = tf.split(output, 2, axis=-1)
        
        return mean, tf.exp(log_std)
\`\`\`

---

### 4. Data Layer

#### Schema do Banco de Dados

\`\`\`sql
-- PostgreSQL Schema

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'explorer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de datasets
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    source VARCHAR(50), -- 'kepler', 'tess', 'k2'
    file_path TEXT,
    num_samples INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de predições
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES datasets(id),
    model_version VARCHAR(50),
    target_id VARCHAR(100), -- KOI/TIC ID
    classification VARCHAR(50), -- 'planet', 'false_positive', 'uncertain'
    probability FLOAT,
    uncertainty FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vetting (curadoria)
CREATE TABLE vetting_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES predictions(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    votes_positive INTEGER DEFAULT 0,
    votes_negative INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de votos
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vetting_id UUID REFERENCES vetting_queue(id),
    user_id UUID REFERENCES users(id),
    vote VARCHAR(20), -- 'planet', 'false_positive'
    confidence INTEGER, -- 1-5
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vetting_id, user_id)
);

-- TimescaleDB: Tabela de métricas (time series)
CREATE TABLE model_metrics (
    time TIMESTAMPTZ NOT NULL,
    model_version VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value FLOAT,
    metadata JSONB
);

SELECT create_hypertable('model_metrics', 'time');
\`\`\`

---

## 🔄 Fluxos de Dados

### Fluxo de Upload e Classificação

\`\`\`
1. Usuário faz upload de arquivo (CSV/JSON/FITS)
   ↓
2. Frontend valida formato e tamanho
   ↓
3. POST /api/data/upload
   ↓
4. Backend salva arquivo e retorna dataset_id
   ↓
5. POST /api/data/preprocess com dataset_id
   ↓
6. Pipeline de pré-processamento:
   - Detecção de eventos (BLS)
   - Normalização
   - Feature engineering
   ↓
7. POST /api/model/predict
   ↓
8. Modelo ML faz predições com incerteza
   ↓
9. Resultados salvos no banco de dados
   ↓
10. Frontend exibe resultados com visualizações
\`\`\`

### Fluxo de Vetting (Human-in-the-Loop)

\`\`\`
1. Predições com alta incerteza vão para vetting_queue
   ↓
2. GET /api/vetting/queue retorna candidatos pendentes
   ↓
3. Usuário visualiza curva de luz e dados
   ↓
4. Usuário vota: 'planet' ou 'false_positive' (1-5 confiança)
   ↓
5. POST /api/vetting/submit
   ↓
6. Sistema agrega votos (weighted by user reputation)
   ↓
7. Se consenso atingido (>70% agreement):
   - Atualiza classificação
   - Adiciona ao dataset de curadoria
   ↓
8. Dataset de curadoria usado para retreinamento
\`\`\`

---

## 🔐 Segurança

### Autenticação e Autorização

\`\`\`typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!)
    req.user = decoded
    return NextResponse.next()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
\`\`\`

### Rate Limiting

\`\`\`python
# middleware/rate_limit.py
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/model/predict")
@limiter.limit("10/minute")
async def predict(request: Request):
    # ...
\`\`\`

---

## 📊 Monitoramento e Observabilidade

### Métricas Coletadas

- **Performance**: Latência de API, tempo de inferência
- **Uso**: Requests por endpoint, usuários ativos
- **ML**: Acurácia, drift de dados, distribuição de predições
- **Erros**: Taxa de erro, stack traces

### Ferramentas

- **Frontend**: Vercel Analytics
- **Backend**: Prometheus + Grafana
- **Logs**: CloudWatch / Datadog
- **APM**: Sentry

---

## 🚀 Deploy

### Frontend (Vercel)

\`\`\`bash
# Automático via GitHub integration
git push origin main
\`\`\`

### Backend (Docker + Kubernetes)

\`\`\`yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exolab-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: exolab-api
  template:
    metadata:
      labels:
        app: exolab-api
    spec:
      containers:
      - name: api
        image: exolab/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
\`\`\`

---

## 📈 Escalabilidade

### Estratégias

1. **Horizontal Scaling**: Múltiplas instâncias da API
2. **Caching**: Redis para sessões e resultados frequentes
3. **CDN**: Assets estáticos via Vercel Edge Network
4. **Database Sharding**: Particionar por dataset source (Kepler/TESS)
5. **Async Processing**: Celery para tarefas longas (treinamento)

---

## 🔧 Manutenção

### Versionamento de Modelos

\`\`\`python
# models/registry.py
class ModelRegistry:
    def __init__(self):
        self.models = {}
    
    def register(self, version: str, model: tf.keras.Model):
        self.models[version] = {
            'model': model,
            'created_at': datetime.now(),
            'metrics': {}
        }
    
    def get(self, version: str = 'latest'):
        if version == 'latest':
            return max(self.models.items(), key=lambda x: x[1]['created_at'])
        return self.models.get(version)
\`\`\`

### Rollback Strategy

1. Manter últimas 3 versões do modelo em produção
2. Canary deployment: 10% tráfego para novo modelo
3. Monitorar métricas por 24h
4. Rollback automático se degradação > 5%

---

<div align="center">

**Arquitetura projetada para escala e manutenibilidade**

[← Voltar ao README](README.md)

</div>
