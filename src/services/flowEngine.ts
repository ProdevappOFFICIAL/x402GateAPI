import prisma from '../configs/database';

/**
 * Flow Engine Service - MVP Implementation
 * 
 * Executes automation flows in response to API events.
 * Supports PAYMENT_SUCCESS and API_REQUEST triggers.
 * 
 * Requirements: Flow automation integration, price safety
 */

export interface FlowEvent {
  apiId: string;
  events: string[];
  context: {
    payment?: {
      amount: number;
      payer: string;
    };
    request?: {
      success: boolean;
      responseMs: number;
    };
  };
}

/**
 * Clamp price between min and max to prevent runaway automation
 */
function clampPrice(price: number, min: number = 1, max: number = 1000): number {
  return Math.max(min, Math.min(max, price));
}

/**
 * Trigger flow engine for API events
 * 
 * MVP Implementation:
 * - Synchronous execution (inline)
 * - Simple trigger matching
 * - Basic action execution (price updates)
 * - Console logging for debugging
 */
export async function triggerFlowEngine(event: FlowEvent): Promise<void> {
  try {
    console.log(`🤖 Flow engine triggered for API ${event.apiId}`);
    console.log(`📊 Events: ${event.events.join(', ')}`);
    
    // Load all enabled flows for this API
    const flows = await prisma.flow.findMany({
      where: {
        apiId: event.apiId,
        enabled: true
      },
      include: {
        nodes: true
      }
    });
    
    if (flows.length === 0) {
      console.log('ℹ️ No enabled flows found for this API');
      return;
    }
    
    console.log(`🔍 Found ${flows.length} enabled flow(s)`);
    
    // Execute each flow
    for (const flow of flows) {
      try {
        await executeFlow(flow, event);
      } catch (error) {
        console.error(`❌ Error executing flow ${flow.id}:`, error);
        // Continue with other flows
      }
    }
    
  } catch (error) {
    console.error('❌ Flow engine error:', error);
    throw error;
  }
}

/**
 * Execute a single flow
 */
async function executeFlow(flow: any, event: FlowEvent): Promise<void> {
  console.log(`▶️ Executing flow: ${flow.name} (${flow.id})`);
  
  // Find trigger nodes
  const triggerNodes = flow.nodes.filter((node: any) => node.type === 'TRIGGER');
  
  if (triggerNodes.length === 0) {
    console.log('⚠️ No trigger nodes found in flow');
    return;
  }
  
  // Check if any trigger matches the event
  let shouldExecute = false;
  for (const trigger of triggerNodes) {
    const triggerType = trigger.config?.triggerType;
    if (event.events.includes(triggerType)) {
      console.log(`✅ Trigger matched: ${triggerType}`);
      shouldExecute = true;
      break;
    }
  }
  
  if (!shouldExecute) {
    console.log('ℹ️ No matching triggers for this event');
    return;
  }
  
  // Execute flow nodes sequentially
  const actionNodes = flow.nodes.filter((node: any) => 
    node.type === 'ACTION' || node.type === 'AI'
  );
  
  for (const node of actionNodes) {
    try {
      await executeNode(node, event, flow.apiId);
    } catch (error) {
      console.error(`❌ Error executing node ${node.id}:`, error);
      // Continue with other nodes
    }
  }
  
  console.log(`✅ Flow execution completed: ${flow.name}`);
}

/**
 * Execute a single flow node
 */
async function executeNode(node: any, event: FlowEvent, apiId: string): Promise<void> {
  console.log(`🔧 Executing node: ${node.label} (${node.type})`);
  
  const config = node.config || {};
  
  // Handle different action types
  if (node.type === 'ACTION') {
    const actionType = config.actionType;
    
    switch (actionType) {
      case 'UPDATE_PRICE':
        await handlePriceUpdate(config, event, apiId);
        break;
        
      case 'SEND_NOTIFICATION':
        console.log(`📧 Notification: ${config.message || 'Event occurred'}`);
        break;
        
      default:
        console.log(`⚠️ Unknown action type: ${actionType}`);
    }
  } else if (node.type === 'AI') {
    // AI nodes could make intelligent decisions
    console.log(`🤖 AI node: ${node.label}`);
    // For MVP, just log
  }
}

/**
 * Handle price update action with safety bounds
 */
async function handlePriceUpdate(config: any, event: FlowEvent, apiId: string): Promise<void> {
  try {
    // Load current API config
    const api = await prisma.api.findUnique({
      where: { id: apiId }
    }) as any;
    
    if (!api) {
      console.error('❌ API not found for price update');
      return;
    }
    
    let newPrice = api.pricePerRequest;
    
    // Calculate new price based on config
    if (config.priceChange === 'INCREASE') {
      const increaseAmount = config.amount || 0.1;
      newPrice = api.pricePerRequest + increaseAmount;
    } else if (config.priceChange === 'DECREASE') {
      const decreaseAmount = config.amount || 0.1;
      newPrice = api.pricePerRequest - decreaseAmount;
    } else if (config.priceChange === 'SET') {
      newPrice = config.amount || api.pricePerRequest;
    } else if (config.priceChange === 'MULTIPLY') {
      const multiplier = config.multiplier || 1.1;
      newPrice = api.pricePerRequest * multiplier;
    }
    
    // Apply safety bounds (default to 1 and 1000 if not set)
    const minPrice = api.minPrice ?? 1;
    const maxPrice = api.maxPrice ?? 1000;
    const clampedPrice = clampPrice(newPrice, minPrice, maxPrice);
    
    if (clampedPrice !== newPrice) {
      console.log(`⚠️ Price clamped from ${newPrice} to ${clampedPrice}`);
    }
    
    // Update price in database
    await prisma.api.update({
      where: { id: apiId },
      data: { pricePerRequest: clampedPrice }
    });
    
    // Log the decision
    await prisma.agentDecision.create({
      data: {
        apiId,
        reason: `Flow automation: ${config.priceChange || 'UPDATE'}`,
        oldPrice: api.pricePerRequest,
        newPrice: clampedPrice
      }
    });
    
    console.log(`💰 Price updated: ${api.pricePerRequest} → ${clampedPrice}`);
    
  } catch (error) {
    console.error('❌ Failed to update price:', error);
    throw error;
  }
}
