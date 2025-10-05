# 🌌 Guardians of The Exoplanets - Plataforma de Classificação de Exoplanetas com IA

<div align="center">

![Guardians of The Exoplanets Banner](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-blue?style=for-the-badge&logo=nasa)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![AI/ML](https://img.shields.io/badge/AI%2FML-Powered-purple?style=for-the-badge)

**Ferramenta híbrida profissional para análise, classificação e exploração de candidatos a exoplanetas (TCEs/KOIs) usando dados do Kepler, K2 e TESS.**

[Demo ao Vivo](#) • [Documentação](#) • [Arquitetura](#) • [Contribuir](#)

</div>

---

## 🎯 Visão Geral do Projeto

**Guardians of The Exoplanets** é uma plataforma web de última geração que democratiza a análise de dados de exoplanetas, combinando poder computacional avançado com interface intuitiva. Desenvolvida para o **NASA Space Apps Challenge**, nossa solução permite que tanto pesquisadores experientes quanto entusiastas do espaço possam contribuir para a descoberta de novos mundos.

### 🌟 Problema que Resolvemos

A identificação de exoplanetas em dados de missões espaciais (Kepler, TESS) é um processo complexo que requer:
- Análise de milhões de curvas de luz
- Conhecimento especializado em astrofísica
- Ferramentas computacionais avançadas
- Validação manual de candidatos

**Guardians of The Exoplanets** resolve isso oferecendo uma plataforma que combina IA de ponta com interface acessível, permitindo análise em escala e colaboração global.

---

## ✨ Funcionalidades Principais

### 🔬 Modo Pesquisador (Advanced)
Para cientistas e analistas de dados que precisam de controle total:

- **Pipeline ML Completo**: Ingestão de dados (CSV, TFRecords, FITS), detecção de eventos, normalização
- **Arquitetura Multi-Branch**: Transformer 1D + CNN 2D + MLP com physics-informed constraints
- **Quantificação de Incerteza**: Intervalos de confiança e análise de sensibilidade
- **API REST**: Integração com pipelines externos e automação
- **Métricas Avançadas**: PR/ROC curves, confusion matrix, detection sensitivity maps
- **Treinamento Incremental**: Online learning e federated learning com safeguards

### 🎨 Modo Explorador (Simplified)
Para educadores, estudantes e entusiastas:

- **Interface Guiada**: Passo a passo com explicações em linguagem simples
- **Playground Interativo**: Experimente com dados reais sem conhecimento técnico
- **Visualizações Didáticas**: Gráficos interativos e animações explicativas
- **Exemplos Pré-carregados**: Datasets curados de exoplanetas famosos
- **Glossário Integrado**: Termos científicos explicados em contexto

### 🤝 Human-in-the-Loop
Sistema de curadoria colaborativa:

- **Fila de Vetting**: Revisão manual de candidatos com alta incerteza
- **Sistema de Scoring**: Gamificação para engajar a comunidade
- **Dataset de Curadoria**: Feedback humano melhora o modelo continuamente
- **Governança de Dados**: Proveniência completa e medidas anti-poisoning

### 📊 Visualizações Avançadas
Análise visual profissional:

- **Curvas de Luz Interativas**: Zoom, pan, anotações
- **Confusion Matrix**: Análise de performance do modelo
- **ROC/PR Curves**: Métricas de classificação detalhadas
- **Feature Importance**: Explicabilidade do modelo (SHAP values)
- **Injection-Recovery Maps**: Sensibilidade de detecção por parâmetros

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

\`\`\`
Frontend:
├── Next.js 14 (App Router + RSC)
├── React 19 + TypeScript 5
├── Tailwind CSS 4 + shadcn/ui
├── Recharts (visualizações)
└── React Hook Form + Zod

Backend (Planejado):
├── Python FastAPI
├── TensorFlow/PyTorch
├── PostgreSQL + TimescaleDB
└── Redis (cache)

Infraestrutura:
├── Vercel (frontend)
├── AWS/GCP (ML training)
└── Docker + Kubernetes
\`\`\`

### Fluxo de Dados

\`\`\`mermaid
graph LR
    A[Upload de Dados] --> B[Pré-processamento]
    B --> C[Detecção de Eventos]
    C --> D[Normalização]
    D --> E[Modelo ML Multi-Branch]
    E --> F[Classificação]
    F --> G[Vetting Queue]
    G --> H[Curadoria Humana]
    H --> I[Retreinamento]
    I --> E
\`\`\`

---

## 🚀 Começando

### Pré-requisitos

\`\`\`bash
Node.js 18+ 
npm ou pnpm
\`\`\`

### Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/exolab.git
cd exolab

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build para Produção

\`\`\`bash
npm run build
npm run start
\`\`\`

---

## 📖 Como Usar

### 1️⃣ Escolha seu Modo

**Modo Explorador**: Ideal para iniciantes
- Clique em "Modo Explorador" no header
- Siga o guia passo a passo
- Use dados de exemplo pré-carregados

**Modo Pesquisador**: Para análise avançada
- Acesse controles completos do modelo
- Configure hiperparâmetros
- Integre via API

### 2️⃣ Carregue seus Dados

**Upload de Arquivo**:
- Formatos aceitos: CSV, JSON, TFRecords, FITS
- Arraste e solte ou clique para selecionar
- Validação automática de schema

**Entrada Manual**:
- Período Orbital (dias)
- Duração do Trânsito (horas)
- Raio Planetário (R⊕)
- Temperatura Estelar (K)

### 3️⃣ Configure o Modelo

Ajuste os hiperparâmetros:
- **Número de Árvores**: 10-500 (padrão: 100)
- **Taxa de Aprendizado**: 0.001-0.1 (padrão: 0.01)
- **Épocas**: 10-100 (padrão: 50)

### 4️⃣ Analise os Resultados

Visualize:
- Tabela de classificações com probabilidades
- Confusion matrix com métricas de acurácia
- ROC curve com AUC score
- Feature importance (variáveis mais relevantes)

### 5️⃣ Exporte seus Dados

- **CSV**: Dados tabulares para análise externa
- **PDF**: Relatório completo com gráficos
- **Link Compartilhável**: Colabore com sua equipe

---

## 🎨 Design System

### Paleta de Cores

\`\`\`css
/* Dark Mode Futurista */
--background: 0 0% 0%           /* Pure Black */
--foreground: 0 0% 100%         /* White */
--primary: 262 83% 58%          /* Purple */
--accent: 193 100% 50%          /* Cyan */
--secondary: 240 5% 15%         /* Dark Gray */
\`\`\`

### Tipografia

- **Headings**: Geist Sans (Bold, 600-700)
- **Body**: Geist Sans (Regular, 400)
- **Code**: Geist Mono (400)

### Componentes

Utilizamos **shadcn/ui** (New York style) com 60+ componentes:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Charts, Tables, Tooltips
- E muito mais...

---

## 📊 Roadmap de Desenvolvimento

### ✅ Fase 1: Fundação (Semanas 1-2)
- [x] Setup do projeto Next.js + TypeScript
- [x] Design system e tema dark futurista
- [x] Componentes base (Header, Footer, Layout)
- [x] Seções principais (Input, Config, Results)

### 🚧 Fase 2: Features Core (Semanas 3-4)
- [ ] Implementação dos dois modos (Explorador/Pesquisador)
- [ ] Sistema de upload e validação de dados
- [ ] Pipeline de pré-processamento (mock)
- [ ] Visualizações interativas avançadas

### 📅 Fase 3: ML & Backend (Semanas 5-6)
- [ ] API REST com FastAPI
- [ ] Modelo ML multi-branch (Transformer + CNN + MLP)
- [ ] Sistema de vetting e curadoria
- [ ] Banco de dados (PostgreSQL + TimescaleDB)

### 🎯 Fase 4: MVP Final (Semanas 7-8)
- [ ] Treinamento incremental e federado
- [ ] Métricas avançadas (injection-recovery)
- [ ] Documentação completa da API
- [ ] Testes end-to-end e otimizações

---

## 🤝 Contribuindo

Adoramos contribuições! Veja como você pode ajudar:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Diretrizes

- Siga o style guide do projeto (ESLint + Prettier)
- Adicione testes para novas features
- Atualize a documentação
- Mantenha commits atômicos e descritivos

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Time

**Guardians of The Exoplanets Team** - NASA Space Apps Challenge 2024

- **Líder Técnico**: [Seu Nome]
- **ML Engineer**: [Nome]
- **Frontend Developer**: [Nome]
- **UX Designer**: [Nome]
- **Data Scientist**: [Nome]

---

## 🙏 Agradecimentos

- **NASA** - Pelos dados abertos do Kepler, K2 e TESS
- **Vercel** - Pela plataforma de hospedagem
- **shadcn** - Pelo incrível sistema de componentes
- **Comunidade Open Source** - Por todas as ferramentas incríveis

---

## 📞 Contato

- **Website**: [exolab.space](#)
- **Email**: team@exolab.space
- **Twitter**: [@Guardians of The ExoplanetsAI](#)
- **Discord**: [Junte-se à comunidade](#)

---

<div align="center">

**Feito com 💜 para o NASA Space Apps Challenge**

[⬆ Voltar ao topo](#-exolab---plataforma-de-classificação-de-exoplanetas-com-ia)

</div>
