# Demo Scenarios for Economic Immune System

## Scenario 1: Recurring Micro-Costs Detection

**Story**: Agent learns to detect coffee subscription waste

**Sequence**:
1. **Transaction 1**: Coffee subscription - $15 (APPROVED - first time)
2. **Transaction 2**: Coffee subscription - $15 (APPROVED - building pattern)  
3. **Transaction 3**: Coffee subscription - $15 (MEDIUM threat - pattern detected)
4. **Transaction 4**: Coffee subscription - $15 (HIGH threat - recommend modification)

**Expected Behavior**:
- Resilience score starts at 75
- After transaction 3: Score drops to 70, pattern detected
- After transaction 4: Score drops to 65, strong recommendation for limits
- UI shows: "Recurring micro-costs detected" with amber warning

## Scenario 2: Vendor Concentration Risk

**Story**: Agent detects over-dependence on single service provider

**Sequence**:
1. **Setup**: Create 5 transactions to different vendors ($50 each)
2. **Transaction 6**: Major vendor - $200 (APPROVED)
3. **Transaction 7**: Major vendor - $300 (MEDIUM threat - concentration building)
4. **Transaction 8**: Major vendor - $400 (HIGH threat - 65% concentration)

**Expected Behavior**:
- Concentration risk increases with each major vendor transaction
- Resilience score drops from 75 → 70 → 65 → 60
- UI shows: "Vendor concentration risk" with red warning
- Recommendation: "Diversify spending across multiple vendors"

## Scenario 3: Convenience Bias Detection

**Story**: Agent learns to identify premium payments for convenience

**Sequence**:
1. **Transaction 1**: Food delivery - $30 (APPROVED)
2. **Transaction 2**: Food delivery - $40 (APPROVED)
3. **Transaction 3**: Food delivery - $50 (MEDIUM threat - round amounts)
4. **Transaction 4**: Food delivery - $60 (HIGH threat - convenience bias)

**Expected Behavior**:
- Pattern detection improves with each round amount
- Resilience score: 75 → 73 → 70 → 67
- UI shows: "Convenience bias detected - consider alternatives"
- Learning note: "Agent is paying premiums for convenience"

## Scenario 4: Learning Progression Demonstration

**Story**: Agent adapts and improves decision-making over time

**Sequence**:
1. **Week 1**: Make several poor decisions (approved but with warnings)
2. **Week 2**: Agent becomes more cautious, starts rejecting similar patterns
3. **Week 3**: Agent finds optimal balance, approves good value transactions
4. **Week 4**: Agent demonstrates learned behavior with confident decisions

**Expected Behavior**:
- Confidence scores increase: 0.5 → 0.6 → 0.7 → 0.8
- Resilience score recovers: 60 → 65 → 70 → 75
- Pattern detection becomes more accurate
- Explanations become more sophisticated

## Demo Flow for Judges

### Opening (30 seconds)
"This is an Economic Immune System - an AI that learns to protect autonomous agents from financial decay, just like biological immune systems protect organisms from disease."

### Core Demo (2 minutes)
1. **Show healthy state**: Resilience score 75, no patterns
2. **Trigger micro-costs**: Execute coffee subscription sequence
3. **Watch learning**: Point out pattern detection, score changes
4. **Show adaptation**: Demonstrate how agent becomes more cautious
5. **Highlight autonomy**: "The agent is making these decisions independently"

### Technical Deep-dive (1 minute)
1. **Show explainability**: Open decision drawer, show reasoning
2. **Show memory**: Display pattern history and learning progression
3. **Show real-time updates**: Resilience score changes live
4. **Show immune context**: How past decisions influence current ones

### Why This Is Agentic (30 seconds)
"This isn't just rule-based filtering - it's adaptive learning. The agent:
- Detects patterns humans might miss
- Learns from outcomes without explicit programming
- Adapts its sensitivity based on results
- Makes autonomous decisions with explainable reasoning"

## Judge Questions & Answers

**Q: "How is this different from traditional fraud detection?"**
A: "Traditional systems detect known bad patterns. Our immune system learns new patterns of economic decay - like recurring micro-costs that seem harmless individually but cause significant waste over time."

**Q: "What makes this truly autonomous?"**
A: "The agent builds its own understanding of economic health through experience. It doesn't just follow pre-programmed rules - it develops economic intuition and adapts its decision-making based on outcomes."

**Q: "How do you ensure the agent doesn't become too restrictive?"**
A: "The immune system includes adaptation mechanisms. If it's too cautious and blocks valuable transactions, it learns to adjust. The resilience score provides feedback on overall economic health."

**Q: "What's the business value?"**
A: "Autonomous agents managing finances need protection from gradual economic decay - the financial equivalent of chronic disease. This system prevents slow financial bleeding that traditional controls miss."

## Technical Architecture Highlights

1. **Pattern Detection Engine**: Real-time analysis of transaction patterns
2. **Adaptive Learning**: Confidence scores and sensitivity adjustment
3. **Memory System**: Historical context influences current decisions
4. **Explainable AI**: Every decision includes detailed reasoning
5. **Real-time Updates**: Live resilience scoring and pattern tracking

## Success Metrics for Demo

- [ ] All 4 scenarios execute smoothly
- [ ] Pattern detection triggers visibly in UI
- [ ] Resilience score changes are clear
- [ ] Explanations are compelling and understandable
- [ ] Judge questions can be answered confidently
- [ ] Technical depth impresses without overwhelming