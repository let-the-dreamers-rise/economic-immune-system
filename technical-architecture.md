# Technical Architecture: Economic Immune System

## System Overview

The Economic Immune System is built as a layered architecture that combines real-time pattern detection, adaptive learning, and explainable AI decision-making.

## Core Components

### 1. Pattern Detection Engine
**Location**: `src/backend/services/immuneMemoryService.ts`

**Algorithms**:
- **Recurring Micro-Costs**: Groups transactions by recipient + purpose, analyzes frequency
- **Vendor Concentration**: Calculates spending concentration ratios per recipient
- **Convenience Bias**: Detects round payment amounts indicating premium pricing
- **Declining Value**: Tracks cost-effectiveness trends over time

**Implementation**:
```typescript
async detectPatterns(newTransaction: Transaction): Promise<EconomicPattern[]> {
  const detectedPatterns: EconomicPattern[] = [];
  
  // Real-time analysis of transaction against historical patterns
  const microCostPattern = this.detectRecurringMicroCosts(newTransaction, allTransactions);
  const concentrationPattern = this.detectVendorConcentration(newTransaction, allTransactions);
  // ... additional pattern detectors
  
  return detectedPatterns;
}
```

### 2. Immune Memory System
**Location**: `src/backend/services/immuneMemoryService.ts`

**Data Structures**:
- **ImmuneMemory**: Central memory store with patterns, recipients, signals
- **EconomicPattern**: Pattern definitions with confidence scores and impact metrics
- **RecipientProfile**: Historical analysis per transaction recipient
- **RiskSignal**: Active threats requiring attention

**Key Features**:
- Persistent pattern storage across sessions
- Confidence scoring for pattern reliability
- Adaptive threshold management
- Historical context for decision-making

### 3. Enhanced AI Decision Engine
**Location**: `services/geminiService.ts`

**Integration**:
- Gemini AI with Economic Immune System prompt
- Structured JSON response schema
- Immune context injection for historical awareness
- Confidence scoring and threat level assessment

**Response Schema**:
```typescript
interface ImmuneDecisionResponse extends EconomicDecision {
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  patterns_detected: string[];
  confidence_in_decision: number; // 0.0-1.0
  recommended_future_behavior: string;
  immune_memory_references: string[];
  resilience_impact: number; // -10 to +10
}
```

### 4. Real-Time Dashboard
**Location**: `src/components/dashboard/`

**Components**:
- **ImmuneStatusWidget**: Live resilience score and risk signals
- **DecisionTimeline**: Historical decisions with immune reasoning
- **ExplainabilityDrawer**: Detailed decision breakdowns
- **PaymentProposalForm**: Real-time evaluation with immune context

**State Management**:
- React hooks for real-time data fetching
- 30-second polling for balance updates
- 5-second polling for transaction status
- WebSocket-ready architecture for instant updates

## Data Flow Architecture

### 1. Transaction Evaluation Flow
```
User Input → PaymentProposalForm → API /evaluate → 
Pattern Detection → Immune Memory Lookup → 
Gemini AI (with context) → Decision Response → 
UI Update → Memory Update
```

### 2. Pattern Learning Flow
```
Transaction Execution → Memory Update → 
Pattern Detection → Confidence Adjustment → 
Resilience Score Update → Risk Signal Generation → 
UI Notification
```

### 3. Adaptation Flow
```
Decision Outcome → Outcome Analysis → 
Sensitivity Adjustment → Pattern Confidence Update → 
Threshold Modification → Improved Future Decisions
```

## API Architecture

### Core Endpoints
- `GET /api/immune-status` - Current resilience score and active signals
- `GET /api/patterns` - Historical pattern detection data
- `GET /api/resilience` - Resilience score history and trends
- `GET /api/memory` - Immune memory inspection for debugging
- `POST /api/evaluate` - Enhanced evaluation with immune context
- `POST /api/pay` - Transaction execution with memory updates

### Response Format
All immune system endpoints return structured data with:
- Timestamp for real-time updates
- Confidence scores for reliability assessment
- Historical context for decision traceability
- Adaptation metrics for learning verification

## Performance Optimizations

### 1. Memory Efficiency
- In-memory pattern storage with periodic persistence
- Efficient Map-based lookups for recipient profiles
- Lazy loading of historical transaction analysis
- Configurable memory limits for pattern retention

### 2. Real-Time Processing
- Asynchronous pattern detection
- Cached recipient profile calculations
- Optimized transaction grouping algorithms
- Background adaptation processing

### 3. Scalability Considerations
- Stateless API design for horizontal scaling
- Database-ready data structures for persistence
- Configurable pattern detection sensitivity
- Batch processing for historical analysis

## Security & Privacy

### 1. Data Protection
- No sensitive financial data in logs
- Encrypted storage for immune memory
- Configurable data retention policies
- Privacy-preserving pattern analysis

### 2. Decision Auditability
- Complete decision trail with reasoning
- Pattern detection provenance tracking
- Confidence score evolution history
- Human override capability maintenance

## Testing Strategy

### 1. Property-Based Testing
**Location**: `src/__tests__/properties/`

**Test Categories**:
- Pattern detection consistency
- Resilience score mathematical properties
- Memory persistence round-trip verification
- Decision reasoning completeness

### 2. Integration Testing
- End-to-end immune system operation
- Real-time UI update verification
- API endpoint functionality validation
- Cross-component data flow testing

### 3. Performance Testing
- Pattern detection algorithm efficiency
- Memory usage under load
- Real-time update responsiveness
- Concurrent decision processing

## Deployment Architecture

### Development Environment
- Frontend: Vite dev server (port 3000)
- Backend: tsx watch server (port 3001)
- Hot reload for rapid development
- In-memory data store for testing

### Production Considerations
- Database persistence for immune memory
- Redis caching for pattern lookups
- Load balancing for API endpoints
- Monitoring for decision accuracy

## Monitoring & Observability

### Key Metrics
- Pattern detection accuracy rates
- Decision confidence score trends
- Resilience score evolution
- API response time percentiles
- Memory usage and growth patterns

### Alerting
- Critical threat level detections
- Resilience score drops below thresholds
- Pattern detection failures
- API endpoint availability issues

## Future Enhancements

### 1. Advanced Pattern Detection
- Machine learning model integration
- Cross-agent pattern sharing
- Predictive threat modeling
- Behavioral anomaly detection

### 2. Enhanced Learning
- Reinforcement learning integration
- Multi-agent learning networks
- Federated pattern discovery
- Continuous model improvement

### 3. Scalability Improvements
- Distributed pattern processing
- Real-time streaming analytics
- Graph-based relationship analysis
- Blockchain integration for transparency

## Technology Stack Summary

**Backend**: Node.js + Express + TypeScript
**Frontend**: React 19 + TypeScript + Tailwind CSS
**AI Integration**: Google Gemini API with structured responses
**Testing**: Vitest + fast-check property testing
**Development**: Vite + tsx for hot reload
**External Services**: Circle SDK for USDC transactions

This architecture demonstrates how traditional financial systems can evolve into truly agentic economic intelligence through adaptive learning and pattern recognition.