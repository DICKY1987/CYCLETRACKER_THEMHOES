## Project Knowledge Evaluation

After reviewing all documentation, CycleSync is a well-conceived privacy-first period tracking app designed for men to support their partners. The project has:

### ✅ **Strong Foundation**
- Clear mission and ethical framework
- Comprehensive feature set from MVP to advanced AI
- Privacy-by-design architecture
- Adaptive prediction algorithms with confidence scoring
- Multi-partner support with appropriate boundaries

### ⚠️ **Gaps in Production Implementation Plan**
The cycletracker.md file needs enhancement in several critical areas to ensure AI agents can autonomously build a production-ready application:

1. **Concrete implementation details** (actual code, not just interfaces)
2. **Database schemas with migration scripts**
3. **API payload examples with validation rules**
4. **Deployment automation scripts**
5. **Specific test scenarios and data**
6. **Error handling patterns and recovery procedures**
7. **Third-party integration specifics**
8. **Mathematical models for predictions**

---

## Enhanced CycleSync Production Implementation Plan v2.0
*Complete Autonomous AI Agent Execution Blueprint with Concrete Implementation Details*

# 🎯 Executive Summary
**Objective**: Deliver production-ready CycleSync application through autonomous AI agent execution across 4 development phases, targeting 50,000+ active users within 12 months.

**Key Success Metrics**:
- 85%+ prediction accuracy for menstrual cycles  
- 90%+ user satisfaction on privacy/consent handling
- <2 second app response times
- 99.9% uptime in production
- Full GDPR/CCPA compliance certification

---

# 🗄️ Database Schema & Architecture

## Core Database Tables

```sql
-- Users table with privacy-first design
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    encryption_key_hash VARCHAR(255) NOT NULL, -- Client-side key reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft delete for GDPR
    consent_version VARCHAR(50) NOT NULL,
    data_residency VARCHAR(10) CHECK (data_residency IN ('EU', 'US', 'APAC')),
    INDEX idx_email (email),
    INDEX idx_deleted_at (deleted_at)
);

-- Partners table with consent tracking
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL ENCRYPTED,
    relationship_type VARCHAR(50) CHECK (relationship_type IN ('romantic_partner', 'daughter', 'friend', 'family')),
    consent_status VARCHAR(50) DEFAULT 'pending',
    consent_granted_at TIMESTAMPTZ,
    consent_token VARCHAR(255) UNIQUE, -- For consent verification
    age_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_user_partner (user_id, consent_status)
);

-- Cycle events with encrypted sensitive data
CREATE TABLE cycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('period_start', 'period_end', 'ovulation', 'symptom', 'mood')),
    event_date DATE NOT NULL,
    event_metadata JSONB ENCRYPTED, -- Stores flow intensity, symptoms, notes
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    source VARCHAR(50) CHECK (source IN ('manual', 'predicted', 'imported', 'wearable')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX idx_partner_events (partner_id, event_date DESC),
    INDEX idx_event_type_date (event_type, event_date)
);

-- Predictions with accuracy tracking
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_event VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    algorithm_version VARCHAR(20) NOT NULL,
    features_used JSONB, -- For ML model debugging
    actual_date DATE, -- Filled when prediction resolves
    accuracy_score DECIMAL(3,2), -- Calculated after resolution
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_partner_predictions (partner_id, prediction_date)
);

-- Consent audit log (immutable)
CREATE TABLE consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    signature_hash VARCHAR(255) NOT NULL, -- Cryptographic proof
    INDEX idx_partner_consent (partner_id, timestamp DESC)
) WITH (fillfactor = 100); -- Optimize for write-once

-- Support effectiveness tracking
CREATE TABLE support_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_date DATE NOT NULL,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT ENCRYPTED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_partner_actions (partner_id, action_date DESC)
);
```

## Migration Strategy

```javascript
// migrations/001_initial_schema.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    // Create tables with proper ordering for foreign keys
    await queryInterface.createTable('users', {...});
    await queryInterface.createTable('partners', {...});
    await queryInterface.createTable('cycle_events', {...});
    // ... remaining tables
    
    // Create partition for cycle_events by year for performance
    await queryInterface.sequelize.query(`
      CREATE TABLE cycle_events_2025 PARTITION OF cycle_events
      FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
    `);
  },
  
  down: async (queryInterface) => {
    // Reverse order for foreign key constraints
    await queryInterface.dropTable('support_actions');
    await queryInterface.dropTable('consent_logs');
    await queryInterface.dropTable('predictions');
    await queryInterface.dropTable('cycle_events');
    await queryInterface.dropTable('partners');
    await queryInterface.dropTable('users');
  }
};
```

---

# 🔌 API Implementation Details

## Authentication & Authorization

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RateLimiter } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiter({
  points: 100, // requests
  duration: 60, // per minute
  blockDuration: 60 * 5, // block for 5 minutes
});

export const authenticateUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'AUTH_TOKEN_MISSING',
        message: 'Authentication token required'
      });
    }
    
    // Rate limiting by IP + token
    const key = `${req.ip}_${token.substring(0, 10)}`;
    await rateLimiter.consume(key);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user still exists and is not deleted
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deleted_at: null
      }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'User account not found or deleted'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired'
      });
    }
    
    res.status(500).json({
      error: 'AUTH_ERROR',
      message: 'Authentication failed'
    });
  }
};
```

## Core API Endpoints with Request/Response Examples

```typescript
// src/controllers/cycle.controller.ts
import { z } from 'zod';

// Validation schemas
const ManualUpdateSchema = z.object({
  event_type: z.enum(['period_start', 'period_end', 'ovulation', 'symptom', 'mood']),
  event_date: z.string().datetime(),
  flow_intensity: z.enum(['light', 'moderate', 'heavy']).optional(),
  symptoms: z.array(z.string()).optional(),
  mood: z.enum(['happy', 'sad', 'anxious', 'irritable', 'calm']).optional(),
  notes: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1).default(1)
});

// POST /api/v1/cycles/events
export const logCycleEvent = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = ManualUpdateSchema.parse(req.body);
    const { partnerId } = req.params;
    
    // Verify user has permission to update this partner
    const partner = await prisma.partner.findFirst({
      where: {
        id: partnerId,
        user_id: req.user.id,
        consent_status: 'granted'
      }
    });
    
    if (!partner) {
      return res.status(403).json({
        error: 'PERMISSION_DENIED',
        message: 'No permission to update this partner'
      });
    }
    
    // Encrypt sensitive data
    const encryptedMetadata = await encryptData({
      flow_intensity: validatedData.flow_intensity,
      symptoms: validatedData.symptoms,
      mood: validatedData.mood,
      notes: validatedData.notes
    }, partner.encryption_key);
    
    // Create event
    const event = await prisma.cycleEvent.create({
      data: {
        partner_id: partnerId,
        event_type: validatedData.event_type,
        event_date: validatedData.event_date,
        event_metadata: encryptedMetadata,
        confidence_score: validatedData.confidence,
        source: 'manual',
        created_by: req.user.id
      }
    });
    
    // Trigger prediction recalculation
    await recalculatePredictions(partnerId);
    
    // Log to consent audit
    await logConsentAction({
      partner_id: partnerId,
      user_id: req.user.id,
      action: 'DATA_UPDATE',
      ip_address: req.ip
    });
    
    res.status(201).json({
      success: true,
      data: {
        event_id: event.id,
        event_type: event.event_type,
        event_date: event.event_date,
        confidence: event.confidence_score
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: error.errors
      });
    }
    
    logger.error('Cycle event creation failed', { error, userId: req.user.id });
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to log cycle event'
    });
  }
};

// GET /api/v1/cycles/:partnerId/predictions
export const getPredictions = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const { includeHistory = false } = req.query;
    
    // Verify permissions
    const hasPermission = await verifyPartnerAccess(req.user.id, partnerId);
    if (!hasPermission) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'No access to this partner data'
      });
    }
    
    // Get latest prediction
    const prediction = await calculatePrediction(partnerId);
    
    // Response structure
    const response = {
      partner_id: partnerId,
      predictions: {
        next_period: {
          date: prediction.nextPeriodDate,
          confidence: prediction.confidence,
          range: {
            earliest: prediction.earliestDate,
            latest: prediction.latestDate
          }
        },
        current_phase: {
          phase: prediction.currentPhase,
          day: prediction.phaseDay,
          typical_duration: prediction.phaseDuration
        },
        ovulation: {
          estimated_date: prediction.ovulationDate,
          confidence: prediction.ovulationConfidence,
          fertile_window: {
            start: prediction.fertileStart,
            end: prediction.fertileEnd
          }
        }
      },
      insights: {
        cycle_regularity: prediction.regularityScore,
        average_cycle_length: prediction.avgCycleLength,
        cycle_variance: prediction.cycleVariance,
        data_quality: prediction.dataQualityScore
      },
      support_recommendations: prediction.supportTips,
      last_updated: prediction.calculatedAt
    };
    
    if (includeHistory) {
      response.history = await getPredictionHistory(partnerId, 6);
    }
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    logger.error('Prediction retrieval failed', { error, partnerId });
    res.status(500).json({
      error: 'PREDICTION_ERROR',
      message: 'Failed to calculate predictions'
    });
  }
};
```

---

# 🧮 Prediction Algorithm Implementation

```python
# src/ml/prediction_engine.py
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd
from typing import Dict, List, Tuple

class CyclePredictionEngine:
    def __init__(self):
        self.cycle_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.confidence_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def prepare_features(self, cycle_history: List[Dict]) -> np.ndarray:
        """Extract features from cycle history"""
        features = []
        
        # Basic cycle statistics
        cycle_lengths = [c['length'] for c in cycle_history[-12:]]
        features.extend([
            np.mean(cycle_lengths) if cycle_lengths else 28,
            np.std(cycle_lengths) if len(cycle_lengths) > 1 else 2,
            np.min(cycle_lengths) if cycle_lengths else 26,
            np.max(cycle_lengths) if cycle_lengths else 30,
            len(cycle_lengths)  # Data points available
        ])
        
        # Trend analysis
        if len(cycle_lengths) >= 3:
            recent_trend = np.polyfit(range(len(cycle_lengths[-6:])), 
                                    cycle_lengths[-6:], 1)[0]
            features.append(recent_trend)
        else:
            features.append(0)
        
        # Seasonal patterns (simplified)
        current_month = pd.Timestamp.now().month
        features.extend([
            np.sin(2 * np.pi * current_month / 12),
            np.cos(2 * np.pi * current_month / 12)
        ])
        
        # Regularity score
        if len(cycle_lengths) >= 3:
            regularity = 1 / (1 + np.std(cycle_lengths))
        else:
            regularity = 0.5
        features.append(regularity)
        
        # Days since last period
        if cycle_history:
            last_period = pd.to_datetime(cycle_history[-1]['start_date'])
            days_since = (pd.Timestamp.now() - last_period).days
            features.append(min(days_since, 60))  # Cap at 60 days
        else:
            features.append(28)
        
        return np.array(features).reshape(1, -1)
    
    def calculate_confidence(self, 
                            cycle_history: List[Dict],
                            manual_updates: int,
                            data_quality: float) -> float:
        """Calculate prediction confidence score"""
        base_confidence = 0.5
        
        # Historical data bonus
        history_bonus = min(len(cycle_history) * 0.05, 0.25)
        
        # Regularity bonus
        if len(cycle_history) >= 3:
            cycle_lengths = [c['length'] for c in cycle_history[-12:]]
            variance = np.var(cycle_lengths)
            regularity_bonus = max(0, 0.3 - variance * 0.01)
        else:
            regularity_bonus = 0
        
        # Manual update bonus
        update_bonus = min(manual_updates * 0.02, 0.15)
        
        # Data quality bonus
        quality_bonus = data_quality * 0.1
        
        confidence = base_confidence + history_bonus + regularity_bonus + update_bonus + quality_bonus
        
        return min(max(confidence, 0.3), 0.95)
    
    def predict_next_period(self, 
                          partner_data: Dict) -> Dict:
        """Main prediction method"""
        
        cycle_history = partner_data['cycle_history']
        features = self.prepare_features(cycle_history)
        
        # Get base prediction
        if len(cycle_history) >= 3:
            scaled_features = self.scaler.fit_transform(features)
            predicted_length = self.cycle_model.predict(scaled_features)[0]
        else:
            # Fallback for insufficient data
            predicted_length = 28
        
        # Calculate dates
        last_period_start = pd.to_datetime(cycle_history[-1]['start_date'])
        predicted_date = last_period_start + pd.Timedelta(days=int(predicted_length))
        
        # Calculate confidence
        confidence = self.calculate_confidence(
            cycle_history,
            partner_data.get('manual_updates', 0),
            partner_data.get('data_quality', 0.5)
        )
        
        # Calculate prediction range based on confidence
        uncertainty = (1 - confidence) * 5  # Max 5 days uncertainty
        earliest = predicted_date - pd.Timedelta(days=uncertainty)
        latest = predicted_date + pd.Timedelta(days=uncertainty)
        
        # Determine current phase
        days_since_last = (pd.Timestamp.now() - last_period_start).days
        current_phase = self.determine_phase(days_since_last, predicted_length)
        
        return {
            'next_period_date': predicted_date.isoformat(),
            'confidence': confidence,
            'earliest_date': earliest.isoformat(),
            'latest_date': latest.isoformat(),
            'current_phase': current_phase['phase'],
            'phase_day': current_phase['day'],
            'predicted_cycle_length': predicted_length,
            'algorithm_version': '2.0.0'
        }
    
    def determine_phase(self, day: int, cycle_length: float) -> Dict:
        """Determine current cycle phase"""
        # Standard phase timing (adjustable based on cycle length)
        ovulation_day = int(cycle_length - 14)
        
        if day <= 5:
            return {'phase': 'menstruation', 'day': day}
        elif day <= ovulation_day - 5:
            return {'phase': 'follicular', 'day': day - 5}
        elif day <= ovulation_day + 1:
            return {'phase': 'ovulation', 'day': day - (ovulation_day - 5)}
        else:
            return {'phase': 'luteal', 'day': day - ovulation_day - 1}
```

---

# 📱 Mobile App State Management

```typescript
// src/store/store.ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';

// Encryption transformer for sensitive data
const encryptor = encryptTransform({
  secretKey: process.env.REDUX_ENCRYPTION_KEY!,
  onError: (error) => {
    console.error('Redux encryption error:', error);
  }
});

// Partner slice
const partnerSlice = createSlice({
  name: 'partners',
  initialState: {
    partners: [] as Partner[],
    activePartnerId: null as string | null,
    loading: false,
    error: null as string | null
  },
  reducers: {
    setPartners: (state, action: PayloadAction<Partner[]>) => {
      state.partners = action.payload;
      state.error = null;
    },
    addPartner: (state, action: PayloadAction<Partner>) => {
      state.partners.push(action.payload);
    },
    updatePartner: (state, action: PayloadAction<Partner>) => {
      const index = state.partners.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.partners[index] = action.payload;
      }
    },
    setActivePartner: (state, action: PayloadAction<string>) => {
      state.activePartnerId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// Predictions slice
const predictionsSlice = createSlice({
  name: 'predictions',
  initialState: {
    predictions: {} as Record<string, Prediction>,
    lastUpdated: {} as Record<string, string>,
    confidenceThreshold: 0.6
  },
  reducers: {
    setPrediction: (state, action: PayloadAction<{partnerId: string, prediction: Prediction}>) => {
      const { partnerId, prediction } = action.payload;
      state.predictions[partnerId] = prediction;
      state.lastUpdated[partnerId] = new Date().toISOString();
    },
    clearPredictions: (state) => {
      state.predictions = {};
      state.lastUpdated = {};
    },
    setConfidenceThreshold: (state, action: PayloadAction<number>) => {
      state.confidenceThreshold = action.payload;
    }
  }
});

// Offline queue for syncing
const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState: {
    queue: [] as OfflineAction[],
    isSyncing: false
  },
  reducers: {
    addToQueue: (state, action: PayloadAction<OfflineAction>) => {
      state.queue.push({
        ...action.payload,
        id: `${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString()
      });
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(item => item.id !== action.payload);
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.isSyncing = false;
    }
  }
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [encryptor],
  whitelist: ['partners', 'predictions', 'offlineQueue'],
  blacklist: ['ui', 'network']
};

// Root reducer
const rootReducer = combineReducers({
  partners: partnerSlice.reducer,
  predictions: predictionsSlice.reducer,
  offlineQueue: offlineQueueSlice.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

// Export actions
export const { setPartners, addPartner, updatePartner } = partnerSlice.actions;
export const { setPrediction, clearPredictions } = predictionsSlice.actions;
export const { addToQueue, removeFromQueue } = offlineQueueSlice.actions;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

# 🚀 CI/CD Pipeline Configuration

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'
  PYTHON_VERSION: '3.10'

jobs:
  # Security scanning
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run TruffleHog OSS
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          path: '.'
          format: 'HTML'
          args: '--enableRetired --enableExperimental'

  # Unit and integration tests
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: cyclesync_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run migrate:test
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/cyclesync_test
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/cyclesync_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

  # Mobile app testing
  test-mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: |
          cd mobile
          npm ci
      
      - name: Run Jest tests
        run: |
          cd mobile
          npm run test -- --coverage
      
      - name: Setup iOS Simulator
        run: |
          xcrun simctl create "iPhone 14" "iPhone 14" iOS16.2
          xcrun simctl boot "iPhone 14"
      
      - name: Run Detox E2E tests
        run: |
          cd mobile
          npm run e2e:ios

  # Build and push Docker images
  build-and-push:
    needs: [security-scan, test-backend, test-mobile]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1
        env:
          AWS_REGION: us-east-1
      
      - name: Build and push API image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.ECR_REGISTRY }}/cyclesync-api:${{ github.sha }}
            ${{ secrets.ECR_REGISTRY }}/cyclesync-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push ML service image
        uses: docker/build-push-action@v4
        with:
          context: ./ml-service
          push: true
          tags: |
            ${{ secrets.ECR_REGISTRY }}/cyclesync-ml:${{ github.sha }}
            ${{ secrets.ECR_REGISTRY }}/cyclesync-ml:latest

  # Deploy to production
  deploy-production:
    needs: [build-and-push]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.cyclesync.io
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to ECS
        run: |
          # Update task definition with new image
          aws ecs register-task-definition \
            --family cyclesync-api \
            --task-definition-file ./deploy/ecs-task-definition.json
          
          # Update service with new task definition
          aws ecs update-service \
            --cluster cyclesync-production \
            --service cyclesync-api-service \
            --task-definition cyclesync-api
          
          # Wait for deployment to complete
          aws ecs wait services-stable \
            --cluster cyclesync-production \
            --services cyclesync-api-service
      
      - name: Run smoke tests
        run: |
          npm run test:smoke
        env:
          API_URL: https://api.cyclesync.io
      
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

# 🧪 Testing Scenarios & Data

```typescript
// tests/fixtures/test-data.ts
export const TEST_USERS = {
  regularCycle: {
    id: 'test-user-1',
    email: 'regular@test.com',
    partners: [
      {
        id: 'partner-1',
        name: 'Sarah',
        cycleHistory: [
          { start: '2025-01-10', end: '2025-01-15', length: 28 },
          { start: '2025-02-07', end: '2025-02-12', length: 28 },
          { start: '2025-03-07', end: '2025-03-12', length: 28 },
          { start: '2025-04-04', end: '2025-04-09', length: 28 },
          { start: '2025-05-02', end: '2025-05-07', length: 28 }
        ]
      }
    ]
  },
  irregularCycle: {
    id: 'test-user-2',
    email: 'irregular@test.com',
    partners: [
      {
        id: 'partner-2',
        name: 'Emma',
        cycleHistory: [
          { start: '2025-01-10', end: '2025-01-15', length: 26 },
          { start: '2025-02-05', end: '2025-02-10', length: 32 },
          { start: '2025-03-09', end: '2025-03-14', length: 28 },
          { start: '2025-04-06', end: '2025-04-11', length: 35 },
          { start: '2025-05-11', end: '2025-05-16', length: 30 }
        ]
      }
    ]
  },
  newUser: {
    id: 'test-user-3',
    email: 'new@test.com',
    partners: []
  }
};

// tests/integration/prediction.test.ts
describe('Prediction Engine Integration Tests', () => {
  describe('Regular Cycle Predictions', () => {
    it('should predict with high confidence for regular cycles', async () => {
      const user = TEST_USERS.regularCycle;
      const partner = user.partners[0];
      
      const prediction = await predictionEngine.predict(partner);
      
      expect(prediction.confidence).toBeGreaterThan(0.75);
      expect(prediction.nextPeriodDate).toBe('2025-05-30');
      expect(prediction.cycleLength).toBe(28);
      expect(prediction.currentPhase).toBe('follicular');
    });
  });
  
  describe('Irregular Cycle Predictions', () => {
    it('should have lower confidence for irregular cycles', async () => {
      const user = TEST_USERS.irregularCycle;
      const partner = user.partners[0];
      
      const prediction = await predictionEngine.predict(partner);
      
      expect(prediction.confidence).toBeLessThan(0.65);
      expect(prediction.dateRange.days).toBeGreaterThan(5);
      expect(prediction.supportTips).toContain('Consider checking in more frequently');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle missing cycle data gracefully', async () => {
      const prediction = await predictionEngine.predict({ cycleHistory: [] });
      
      expect(prediction.confidence).toBe(0.3);
      expect(prediction.cycleLength).toBe(28); // Default
      expect(prediction.error).toBeUndefined();
    });
    
    it('should detect and flag anomalies', async () => {
      const anomalousData = {
        cycleHistory: [
          { start: '2025-01-10', length: 28 },
          { start: '2025-02-07', length: 28 },
          { start: '2025-05-10', length: 92 } // Anomaly
        ]
      };
      
      const prediction = await predictionEngine.predict(anomalousData);
      
      expect(prediction.anomalyDetected).toBe(true);
      expect(prediction.recommendedActions).toContain('Consult healthcare provider');
    });
  });
});
```

---

# 🔒 Privacy & Compliance Implementation

```typescript
// src/compliance/gdpr.service.ts
export class GDPRComplianceService {
  async handleDataExportRequest(userId: string): Promise<Buffer> {
    const userData = await this.collectAllUserData(userId);
    const encryptedArchive = await this.createEncryptedArchive(userData);
    
    // Log export request for compliance
    await this.logDataRequest({
      user_id: userId,
      request_type: 'EXPORT',
      timestamp: new Date(),
      data_categories: Object.keys(userData)
    });
    
    return encryptedArchive;
  }
  
  async handleDataDeletionRequest(userId: string): Promise<void> {
    // Verify user identity
    await this.verifyUserIdentity(userId);
    
    // Create deletion record before actual deletion
    const deletionRecord = await this.createDeletionRecord(userId);
    
    // Perform cascading soft delete
    await prisma.$transaction(async (tx) => {
      // Soft delete user and related data
      await tx.user.update({
        where: { id: userId },
        data: { 
          deleted_at: new Date(),
          email: `deleted_${userId}@cyclesync.io`, // Anonymize
          personal_data: null // Clear PII
        }
      });
      
      // Anonymize partner data
      await tx.partner.updateMany({
        where: { user_id: userId },
        data: {
          name: 'DELETED',
          deleted_at: new Date()
        }
      });
      
      // Remove sensitive cycle data
      await tx.cycleEvent.updateMany({
        where: { 
          partner: { user_id: userId }
        },
        data: {
          event_metadata: null,
          deleted_at: new Date()
        }
      });
    });
    
    // Schedule hard delete after retention period
    await this.scheduleHardDelete(userId, 30); // 30 days
    
    // Notify user
    await this.sendDeletionConfirmation(userId);
  }
  
  private async collectAllUserData(userId: string): Promise<UserDataExport> {
    const [user, partners, cycles, predictions, consent, support] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }}),
      prisma.partner.findMany({ where: { user_id: userId }}),
      prisma.cycleEvent.findMany({ 
        where: { partner: { user_id: userId }},
        orderBy: { event_date: 'desc' }
      }),
      prisma.prediction.findMany({ 
        where: { partner: { user_id: userId }}
      }),
      prisma.consentLog.findMany({ 
        where: { user_id: userId },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.supportAction.findMany({ 
        where: { partner: { user_id: userId }}
      })
    ]);
    
    return {
      user: this.sanitizeUserData(user),
      partners: partners.map(p => this.decryptPartnerData(p)),
      cycle_events: cycles.map(c => this.decryptCycleData(c)),
      predictions,
      consent_history: consent,
      support_actions: support,
      export_date: new Date().toISOString(),
      format_version: '1.0.0'
    };
  }
}
```

---

# 📊 Monitoring & Alerting Configuration

```yaml
# monitoring/datadog-monitors.yml
monitors:
  - name: API Response Time P95
    type: metric
    query: "avg(last_5m):p95:trace.express.request.duration{service:cyclesync-api} > 200"
    message: |
      API response time P95 is {{value}}ms (threshold: 200ms)
      Service: {{service.name}}
      Environment: {{env}}
      @slack-cyclesync-alerts @pagerduty
    thresholds:
      critical: 500
      warning: 200
    
  - name: Prediction Accuracy Drop
    type: metric
    query: "avg(last_1h):avg:cyclesync.prediction.accuracy{*} < 0.7"
    message: |
      Prediction accuracy dropped to {{value}} (threshold: 0.70)
      This may indicate model drift or data quality issues
      @ml-team @slack-cyclesync-ml
    thresholds:
      critical: 0.6
      warning: 0.7
  
  - name: Privacy Consent Rate
    type: metric
    query: "avg(last_1d):avg:cyclesync.consent.grant_rate{*} < 0.75"
    message: |
      Consent grant rate is {{value}} (threshold: 0.75)
      Review privacy UX and consent flow
      @product-team
    thresholds:
      critical: 0.6
      warning: 0.75
  
  - name: Failed Login Attempts Spike
    type: anomaly
    query: "avg(last_5m):sum:cyclesync.auth.failed_attempts{*} by {ip}"
    message: |
      Unusual spike in failed login attempts detected
      IP: {{ip}}
      Count: {{value}}
      @security-team @pagerduty
    thresholds:
      critical: 50
      warning: 20
  
  - name: Database Connection Pool Exhaustion
    type: metric
    query: "avg(last_5m):avg:cyclesync.db.pool.available{*} < 5"
    message: |
      Database connection pool nearly exhausted
      Available connections: {{value}}
      @backend-team @pagerduty
    thresholds:
      critical: 2
      warning: 5

# Custom metrics to track
custom_metrics:
  - cyclesync.user.daily_active
  - cyclesync.prediction.calculations_per_minute
  - cyclesync.consent.updates_per_hour
  - cyclesync.privacy.data_export_requests
  - cyclesync.ml.model_inference_time
  - cyclesync.support.tip_effectiveness_rating
```

---

# 🚨 Error Handling & Recovery

```typescript
// src/utils/error-handler.ts
export enum ErrorCode {
  // Authentication errors (1xxx)
  AUTH_TOKEN_MISSING = 1001,
  AUTH_TOKEN_EXPIRED = 1002,
  AUTH_TOKEN_INVALID = 1003,
  AUTH_PERMISSION_DENIED = 1004,
  
  // Validation errors (2xxx)
  VALIDATION_FAILED = 2001,
  INVALID_DATE_FORMAT = 2002,
  INVALID_CYCLE_DATA = 2003,
  
  // Business logic errors (3xxx)
  CONSENT_NOT_GRANTED = 3001,
  PARTNER_NOT_FOUND = 3002,
  PREDICTION_FAILED = 3003,
  INSUFFICIENT_DATA = 3004,
  
  // Privacy errors (4xxx)
  PRIVACY_VIOLATION = 4001,
  DATA_EXPORT_FAILED = 4002,
  ENCRYPTION_FAILED = 4003,
  
  // System errors (5xxx)
  DATABASE_ERROR = 5001,
  EXTERNAL_SERVICE_ERROR = 5002,
  RATE_LIMIT_EXCEEDED = 5003
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error instanceof AppError ? error.code : 'UNKNOWN'
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id
    }
  });
  
  // Handle specific error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }
  
  // Handle database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
  
  // Default error response
  res.status(500).json({
    error: {
      code: ErrorCode.SYSTEM_ERROR,
      message: 'An unexpected error occurred'
    }
  });
};

// Recovery strategies
export class RecoveryService {
  async handlePredictionFailure(partnerId: string, error: Error): Promise<Prediction> {
    logger.warn(`Prediction failed for partner ${partnerId}, using fallback`, { error });
    
    // Try simpler algorithm
    try {
      return await this.simplePrediction(partnerId);
    } catch (fallbackError) {
      // Return safe default
      return {
        nextPeriodDate: null,
        confidence: 0,
        error: 'Unable to calculate prediction',
        requiresManualUpdate: true
      };
    }
  }
  
  async handleDatabaseFailure<T>(
    operation: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        
        // Try read replica if available
        if (i === 1) {
          await this.switchToReadReplica();
        }
      }
    }
    throw new Error('Database operation failed after retries');
  }
}
```

---

# 📈 Launch Readiness Checklist

## Technical Readiness
- [ ] **Infrastructure**
  - [ ] Production environment deployed and tested
  - [ ] Auto-scaling configured and tested under load
  - [ ] Backup and disaster recovery tested
  - [ ] CDN configured for global performance
  - [ ] SSL certificates installed and verified

- [ ] **Security**
  - [ ] Penetration testing completed
  - [ ] OWASP Top 10 vulnerabilities addressed
  - [ ] Encryption at rest and in transit verified
  - [ ] Security headers configured (CSP, HSTS, etc.)
  - [ ] Rate limiting tested

- [ ] **Performance**
  - [ ] Load testing at 10x expected capacity
  - [ ] API response times < 200ms (P95)
  - [ ] Mobile app launch time < 3 seconds
  - [ ] Database queries optimized
  - [ ] Caching strategy implemented

## Business Readiness
- [ ] **Legal & Compliance**
  - [ ] Privacy policy reviewed by legal
  - [ ] Terms of service finalized
  - [ ] GDPR compliance verified
  - [ ] CCPA compliance verified
  - [ ] Data processing agreements signed

- [ ] **Support**
  - [ ] Customer support team trained
  - [ ] Documentation complete
  - [ ] FAQ prepared
  - [ ] Support ticket system configured
  - [ ] Escalation procedures defined

- [ ] **Marketing**
  - [ ] App store listings approved
  - [ ] Marketing website live
  - [ ] Social media accounts created
  - [ ] Launch announcement prepared
  - [ ] Press kit ready

## Operational Readiness
- [ ] **Monitoring**
  - [ ] All critical metrics tracked
  - [ ] Alerting configured and tested
  - [ ] On-call rotation scheduled
  - [ ] Runbooks documented
  - [ ] Incident response plan tested

- [ ] **Data & Analytics**
  - [ ] Analytics tracking implemented
  - [ ] KPI dashboards configured
  - [ ] User behavior tracking setup
  - [ ] A/B testing framework ready
  - [ ] Data retention policies implemented

---

This enhanced implementation plan provides AI agents with concrete, actionable specifications including:

1. **Complete database schemas** with indexes and constraints
2. **Actual code implementations** for critical components
3. **Specific API examples** with request/response structures
4. **Detailed CI/CD pipelines** with security scanning
5. **Comprehensive testing scenarios** with test data
6. **Error handling patterns** with recovery strategies
7. **Monitoring configurations** with specific thresholds
8. **Privacy compliance implementations** with GDPR/CCPA handlers
9. **Launch readiness checklists** for systematic validation

This document now serves as a complete blueprint that autonomous AI agents can execute to build a production-ready CycleSync application.