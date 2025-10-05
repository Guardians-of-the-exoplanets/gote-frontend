# 📚 Documentação Técnica - Guardians of The Exoplanets

## Índice

1. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
2. [API Reference](#api-reference)
3. [Componentes](#componentes)
4. [Hooks Customizados](#hooks-customizados)
5. [Schemas de Validação](#schemas-de-validação)
6. [Testes](#testes)
7. [Troubleshooting](#troubleshooting)

---

## 🛠️ Guia de Desenvolvimento

### Setup do Ambiente

\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/exolab.git
cd exolab

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local

# 4. Execute o servidor de desenvolvimento
npm run dev
\`\`\`

### Variáveis de Ambiente

\`\`\`bash
# .env.local

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Backend (quando disponível)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_id_here

# Feature Flags
NEXT_PUBLIC_ENABLE_RESEARCHER_MODE=true
NEXT_PUBLIC_ENABLE_VETTING=false
\`\`\`

### Estrutura de Branches

\`\`\`
main          → Produção (protegida)
develop       → Desenvolvimento
feature/*     → Novas features
bugfix/*      → Correções de bugs
hotfix/*      → Correções urgentes
\`\`\`

### Workflow de Desenvolvimento

\`\`\`bash
# 1. Crie uma branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nova-feature

# 2. Desenvolva e commite
git add .
git commit -m "feat: adiciona nova feature"

# 3. Push e abra PR
git push origin feature/nova-feature
\`\`\`

### Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas gerais
\`\`\`

---

## 🔌 API Reference

### Endpoints (Planejado)

#### Data Management

**Upload de Dados**

\`\`\`http
POST /api/data/upload
Content-Type: multipart/form-data

Body:
- file: File (CSV, JSON, FITS)
- source: string ('kepler' | 'tess' | 'k2')

Response:
{
  "dataset_id": "uuid",
  "name": "string",
  "num_samples": number,
  "status": "uploaded"
}
\`\`\`

**Validação de Dados**

\`\`\`http
GET /api/data/validate?dataset_id={uuid}

Response:
{
  "valid": boolean,
  "errors": string[],
  "warnings": string[],
  "schema": {
    "columns": string[],
    "types": object
  }
}
\`\`\`

**Pré-processamento**

\`\`\`http
POST /api/data/preprocess
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "options": {
    "normalize": boolean,
    "detect_events": boolean,
    "remove_outliers": boolean
  }
}

Response:
{
  "processed_dataset_id": "uuid",
  "num_events_detected": number,
  "processing_time_ms": number
}
\`\`\`

#### Model Operations

**Fazer Predições**

\`\`\`http
POST /api/model/predict
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "model_version": "latest" | "v1.0.0",
  "return_uncertainty": boolean
}

Response:
{
  "predictions": [
    {
      "target_id": "string",
      "classification": "planet" | "false_positive",
      "probability": number,
      "uncertainty": number
    }
  ],
  "model_version": "string",
  "inference_time_ms": number
}
\`\`\`

**Obter Métricas do Modelo**

\`\`\`http
GET /api/model/metrics?version={version}

Response:
{
  "version": "string",
  "accuracy": number,
  "precision": number,
  "recall": number,
  "f1_score": number,
  "auc_roc": number,
  "confusion_matrix": number[][],
  "trained_at": "ISO8601"
}
\`\`\`

**Explicabilidade (SHAP)**

\`\`\`http
POST /api/model/explain
Content-Type: application/json

Body:
{
  "prediction_id": "uuid"
}

Response:
{
  "feature_importance": {
    "orbital_period": number,
    "transit_duration": number,
    "planet_radius": number,
    "stellar_temp": number
  },
  "shap_values": number[],
  "base_value": number
}
\`\`\`

#### Vetting System

**Obter Fila de Vetting**

\`\`\`http
GET /api/vetting/queue?limit=10&offset=0

Response:
{
  "items": [
    {
      "vetting_id": "uuid",
      "prediction_id": "uuid",
      "target_id": "string",
      "classification": "string",
      "probability": number,
      "uncertainty": number,
      "votes_positive": number,
      "votes_negative": number,
      "light_curve_url": "string"
    }
  ],
  "total": number,
  "page": number
}
\`\`\`

**Submeter Voto**

\`\`\`http
POST /api/vetting/submit
Content-Type: application/json

Body:
{
  "vetting_id": "uuid",
  "vote": "planet" | "false_positive",
  "confidence": 1 | 2 | 3 | 4 | 5,
  "comment": "string (optional)"
}

Response:
{
  "success": boolean,
  "new_votes_positive": number,
  "new_votes_negative": number,
  "consensus_reached": boolean
}
\`\`\`

#### Export

**Exportar CSV**

\`\`\`http
POST /api/export/csv
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "include_predictions": boolean,
  "include_metrics": boolean
}

Response:
{
  "download_url": "string",
  "expires_at": "ISO8601"
}
\`\`\`

**Gerar PDF Report**

\`\`\`http
POST /api/export/pdf
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "include_charts": boolean,
  "include_explainability": boolean
}

Response:
{
  "download_url": "string",
  "expires_at": "ISO8601"
}
\`\`\`

---

## 🧩 Componentes

### DataInputSection

Seção para upload e entrada manual de dados.

**Props:**

\`\`\`typescript
interface DataInputSectionProps {
  onDataUploaded?: (datasetId: string) => void
  onManualDataSubmit?: (data: ManualDataInput) => void
}
\`\`\`

**Uso:**

\`\`\`tsx
import { DataInputSection } from '@/components/data-input-section'

export default function Page() {
  const handleDataUploaded = (datasetId: string) => {
    console.log('Dataset uploaded:', datasetId)
  }

  return <DataInputSection onDataUploaded={handleDataUploaded} />
}
\`\`\`

### ModelConfigSection

Configuração de hiperparâmetros do modelo.

**Props:**

\`\`\`typescript
interface ModelConfigSectionProps {
  onConfigChange?: (config: ModelConfig) => void
  defaultConfig?: Partial<ModelConfig>
}

interface ModelConfig {
  numTrees: number
  learningRate: number
  epochs: number
}
\`\`\`

**Uso:**

\`\`\`tsx
import { ModelConfigSection } from '@/components/model-config-section'

export default function Page() {
  const handleConfigChange = (config: ModelConfig) => {
    console.log('Config changed:', config)
  }

  return (
    <ModelConfigSection
      onConfigChange={handleConfigChange}
      defaultConfig={{ numTrees: 100, learningRate: 0.01, epochs: 50 }}
    />
  )
}
\`\`\`

### ResultsSection

Exibição de resultados de classificação.

**Props:**

\`\`\`typescript
interface ResultsSectionProps {
  predictions?: Prediction[]
  metrics?: ModelMetrics
  loading?: boolean
}

interface Prediction {
  id: string
  classification: 'Planeta' | 'Falso Positivo'
  probability: number
}

interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
}
\`\`\`

### ConfusionMatrix

Matriz de confusão interativa.

**Props:**

\`\`\`typescript
interface ConfusionMatrixProps {
  data: number[][] // [[TP, FP], [FN, TN]]
  labels?: string[]
}
\`\`\`

**Uso:**

\`\`\`tsx
import { ConfusionMatrix } from '@/components/confusion-matrix'

const data = [
  [850, 45], // [True Positives, False Positives]
  [32, 873], // [False Negatives, True Negatives]
]

export default function Page() {
  return <ConfusionMatrix data={data} labels={['Planeta', 'Falso Positivo']} />
}
\`\`\`

### ROCCurve

Curva ROC com AUC score.

**Props:**

\`\`\`typescript
interface ROCCurveProps {
  data: Array<{ fpr: number; tpr: number }>
  auc: number
}
\`\`\`

### FeatureImportance

Gráfico de importância de features.

**Props:**

\`\`\`typescript
interface FeatureImportanceProps {
  features: Array<{
    name: string
    importance: number
    color?: string
  }>
}
\`\`\`

---

## 🪝 Hooks Customizados

### useDataUpload

Hook para gerenciar upload de dados.

\`\`\`typescript
import { useDataUpload } from '@/hooks/use-data-upload'

function MyComponent() {
  const { upload, uploading, progress, error } = useDataUpload()

  const handleUpload = async (file: File) => {
    const result = await upload(file, {
      source: 'kepler',
      onProgress: (p) => console.log(`Progress: ${p}%`),
    })

    if (result.success) {
      console.log('Dataset ID:', result.datasetId)
    }
  }

  return (
    <div>
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
\`\`\`

### useModelPrediction

Hook para fazer predições.

\`\`\`typescript
import { useModelPrediction } from '@/hooks/use-model-prediction'

function MyComponent() {
  const { predict, predicting, predictions, error } = useModelPrediction()

  const handlePredict = async (datasetId: string) => {
    await predict(datasetId, {
      modelVersion: 'latest',
      returnUncertainty: true,
    })
  }

  return (
    <div>
      {predicting && <p>Predicting...</p>}
      {predictions && <ResultsTable data={predictions} />}
    </div>
  )
}
\`\`\`

### useVettingQueue

Hook para gerenciar fila de vetting.

\`\`\`typescript
import { useVettingQueue } from '@/hooks/use-vetting-queue'

function VettingComponent() {
  const { queue, loading, submitVote, refetch } = useVettingQueue()

  const handleVote = async (vettingId: string, vote: 'planet' | 'false_positive') => {
    await submitVote(vettingId, {
      vote,
      confidence: 4,
      comment: 'Clear transit signal',
    })
    refetch()
  }

  return (
    <div>
      {queue.map((item) => (
        <VettingCard key={item.vetting_id} item={item} onVote={handleVote} />
      ))}
    </div>
  )
}
\`\`\`

---

## ✅ Schemas de Validação

### Zod Schemas

\`\`\`typescript
// lib/validators.ts
import { z } from 'zod'

export const ManualDataSchema = z.object({
  orbitalPeriod: z.number().positive().min(0.1).max(10000),
  transitDuration: z.number().positive().min(0.1).max(24),
  planetRadius: z.number().positive().min(0.1).max(100),
  stellarTemp: z.number().int().min(2000).max(50000),
})

export const ModelConfigSchema = z.object({
  numTrees: z.number().int().min(10).max(500),
  learningRate: z.number().min(0.001).max(0.1),
  epochs: z.number().int().min(10).max(100),
})

export const VoteSchema = z.object({
  vettingId: z.string().uuid(),
  vote: z.enum(['planet', 'false_positive']),
  confidence: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

// Uso com React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function MyForm() {
  const form = useForm({
    resolver: zodResolver(ManualDataSchema),
    defaultValues: {
      orbitalPeriod: 365,
      transitDuration: 3,
      planetRadius: 1,
      stellarTemp: 5778,
    },
  })

  const onSubmit = (data: z.infer<typeof ManualDataSchema>) => {
    console.log('Valid data:', data)
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
\`\`\`

---

## 🧪 Testes

### Setup de Testes

\`\`\`bash
# Instalar dependências de teste
npm install -D @testing-library/react @testing-library/jest-dom vitest
\`\`\`

### Exemplo de Teste de Componente

\`\`\`typescript
// __tests__/components/confusion-matrix.test.tsx
import { render, screen } from '@testing-library/react'
import { ConfusionMatrix } from '@/components/confusion-matrix'

describe('ConfusionMatrix', () => {
  const mockData = [
    [850, 45],
    [32, 873],
  ]

  it('renders confusion matrix with correct values', () => {
    render(<ConfusionMatrix data={mockData} />)

    expect(screen.getByText('850')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('873')).toBeInTheDocument()
  })

  it('calculates accuracy correctly', () => {
    render(<ConfusionMatrix data={mockData} />)

    const accuracy = (850 + 873) / (850 + 45 + 32 + 873)
    expect(screen.getByText(`${(accuracy * 100).toFixed(1)}%`)).toBeInTheDocument()
  })
})
\`\`\`

### Exemplo de Teste de Hook

\`\`\`typescript
// __tests__/hooks/use-data-upload.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDataUpload } from '@/hooks/use-data-upload'

describe('useDataUpload', () => {
  it('uploads file successfully', async () => {
    const { result } = renderHook(() => useDataUpload())

    const file = new File(['content'], 'test.csv', { type: 'text/csv' })

    await act(async () => {
      await result.current.upload(file)
    })

    expect(result.current.uploading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
\`\`\`

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS ao fazer upload

**Problema:**

\`\`\`
Access to fetch at 'http://localhost:8000/api/data/upload' from origin 'http://localhost:3000' has been blocked by CORS policy
\`\`\`

**Solução:**

Adicione CORS middleware no backend:

\`\`\`python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

#### 2. Componentes shadcn/ui não renderizam

**Problema:**

\`\`\`
Module not found: Can't resolve '@/components/ui/button'
\`\`\`

**Solução:**

Verifique se o componente foi instalado:

\`\`\`bash
npx shadcn@latest add button
\`\`\`

#### 3. Erro de hidratação no Next.js

**Problema:**

\`\`\`
Error: Hydration failed because the initial UI does not match what was rendered on the server
\`\`\`

**Solução:**

Use `'use client'` para componentes com estado:

\`\`\`tsx
'use client'

import { useState } from 'react'

export function MyComponent() {
  const [count, setCount] = useState(0)
  // ...
}
\`\`\`

#### 4. Gráficos Recharts não aparecem

**Problema:**
Gráficos não renderizam ou aparecem em branco.

**Solução:**

Certifique-se de que os dados estão no formato correto e que o componente é client-side:

\`\`\`tsx
'use client'

import { LineChart, Line, XAxis, YAxis } from 'recharts'

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
]

export function MyChart() {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="x" />
      <YAxis />
      <Line type="monotone" dataKey="y" stroke="#8884d8" />
    </LineChart>
  )
}
\`\`\`

---

## 📞 Suporte

Se você encontrar problemas não listados aqui:

1. Verifique as [Issues no GitHub](https://github.com/seu-usuario/exolab/issues)
2. Abra uma nova issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs de erro
   - Versão do Node.js e npm
3. Entre em contato no Discord: [Link do servidor](#)

---

<div align="center">

**Documentação mantida pela comunidade Guardians of The Exoplanets**

[← Voltar ao README](README.md) • [Ver Arquitetura](ARCHITECTURE.md)

</div>
