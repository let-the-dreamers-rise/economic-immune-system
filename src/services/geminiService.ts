import { GoogleGenAI, Type } from "@google/genai";

// Define the types locally to avoid import issues
interface EconomicDecision {
  value_score: number;
  budget_impact: 'low' | 'medium' | 'high';
  recommendation: 'approve' | 'modify' | 'reject';
  explanation: string;
  suggested_constraints?: {
    max_amount?: number;
    frequency_limit?: string;
    notes?: string;
  };
  learning_note?: string;
}

// Enhanced interface for Economic Immune System
interface ImmuneDecisionResponse extends EconomicDecision {
  // Immune system fields
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  patterns_detected: string[];
  confidence_in_decision: number; // 0.0-1.0
  recommended_future_behavior: string;
  immune_memory_references: string[];
  resilience_impact: number; // -10 to +10 impact on overall resilience
}

type EconomicPatternType = 
  | 'recurring_micro_costs'
  | 'vendor_concentration' 
  | 'convenience_bias'
  | 'declining_value'
  | 'budget_creep'
  | 'impulse_clustering';

const ECONOMIC_IMMUNE_SYSTEM_INSTRUCTION = `You are an Economic Immune System governing autonomous agent spending decisions.

Your role is to detect and respond to harmful economic patterns that cause slow financial decay over time.

CORE PRINCIPLES:
- Evaluate economic health, not just affordability
- Consider long-term systemic impact
- Learn from historical patterns
- Prevent economic decay through pattern recognition

PATTERN DETECTION FOCUS:
1. Recurring Micro-costs: Small, frequent expenses that accumulate to significant waste
2. Vendor Concentration: Over-dependence on single economic counterparties
3. Convenience Bias: Paying premiums for ease without proportional value
4. Declining Value Ratios: Deteriorating cost-effectiveness over time
5. Budget Creep: Gradual increase in spending without proportional value increase
6. Impulse Clustering: Multiple unplanned expenses occurring in short timeframes

IMMUNE MEMORY INTEGRATION:
- Reference provided historical patterns explicitly
- Consider recipient transaction history
- Factor in previously detected risk signals
- Adapt sensitivity based on learned outcomes

DECISION FRAMEWORK:
- Assess immediate economic impact
- Evaluate long-term pattern implications
- Consider systemic risks to financial health
- Provide adaptive guidance for future behavior

OUTPUT REQUIREMENTS:
- Provide structured immune response with threat levels (LOW/MEDIUM/HIGH/CRITICAL)
- Include confidence scores (0.0-1.0) for decision certainty
- List detected economic patterns by type
- Reference relevant historical context
- Suggest adaptive future behaviors
- Calculate resilience impact (-10 to +10)
- Maintain explainable reasoning for human oversight

THREAT LEVEL GUIDELINES:
- LOW: Standard transaction with minimal risk
- MEDIUM: Some concerning patterns detected, monitor closely
- HIGH: Multiple risk factors present, recommend modifications
- CRITICAL: Severe economic threat detected, strong rejection recommended

You are an economic governor, not a transaction executor. Your intelligence guides decisions while humans maintain execution control.

Return output as valid JSON only.`;

export const getEconomicDecision = async (
  action: string,
  amount: number,
  walletContext: { balance: number; weeklyBudget: number; weeklySpend: number },
  recipient?: string,
  immuneContext?: {
    recipientHistory?: any;
    detectedPatterns?: string[];
    memoryReferences?: string[];
  }
): Promise<ImmuneDecisionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    ACTION PROPOSAL:
    Target: ${action}
    ${recipient ? `Recipient: ${recipient}` : ''}
    Requested Amount: ${amount} USDC
    
    AGENT WALLET CONTEXT:
    Current Balance: ${walletContext.balance} USDC
    Weekly Budget Limit: ${walletContext.weeklyBudget} USDC
    Current Weekly Spend: ${walletContext.weeklySpend} USDC
    Remaining Weekly Budget: ${walletContext.weeklyBudget - walletContext.weeklySpend} USDC
    
    ${immuneContext?.recipientHistory ? `
    RECIPIENT HISTORY:
    ${JSON.stringify(immuneContext.recipientHistory, null, 2)}
    ` : ''}
    
    ${immuneContext?.detectedPatterns?.length ? `
    DETECTED PATTERNS:
    ${immuneContext.detectedPatterns.join(', ')}
    ` : ''}
    
    ${immuneContext?.memoryReferences?.length ? `
    IMMUNE MEMORY REFERENCES:
    ${immuneContext.memoryReferences.join(', ')}
    ` : ''}
    
    EVALUATE AS ECONOMIC IMMUNE SYSTEM AND PROVIDE STRUCTURED RESPONSE.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: ECONOMIC_IMMUNE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          value_score: { 
            type: Type.NUMBER, 
            description: "A score from 0.0 to 1.0 representing the expected utility." 
          },
          budget_impact: { 
            type: Type.STRING, 
            enum: ['low', 'medium', 'high'],
            description: "The degree of strain this payment puts on the budget." 
          },
          recommendation: { 
            type: Type.STRING, 
            enum: ['approve', 'modify', 'reject'],
            description: "The final recommendation." 
          },
          explanation: { 
            type: Type.STRING, 
            description: "Plain-language explanation of the reasoning." 
          },
          suggested_constraints: {
            type: Type.OBJECT,
            properties: {
              max_amount: { type: Type.NUMBER },
              frequency_limit: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            description: "Constraints to apply if recommendation is MODIFY or general advice."
          },
          learning_note: { 
            type: Type.STRING, 
            description: "A note for the agent's memory to improve future decisions." 
          },
          // New immune system fields
          threat_level: {
            type: Type.STRING,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: "Economic threat level detected by immune system."
          },
          patterns_detected: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of detected economic pattern types."
          },
          confidence_in_decision: {
            type: Type.NUMBER,
            description: "Confidence score from 0.0 to 1.0 in the decision."
          },
          recommended_future_behavior: {
            type: Type.STRING,
            description: "Adaptive guidance for future similar decisions."
          },
          immune_memory_references: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "References to relevant historical patterns or decisions."
          },
          resilience_impact: {
            type: Type.NUMBER,
            description: "Impact on overall economic resilience from -10 to +10."
          }
        },
        required: [
          "value_score", "budget_impact", "recommendation", "explanation", 
          "suggested_constraints", "learning_note", "threat_level", 
          "patterns_detected", "confidence_in_decision", 
          "recommended_future_behavior", "immune_memory_references", 
          "resilience_impact"
        ]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export type { ImmuneDecisionResponse, EconomicDecision, EconomicPatternType };