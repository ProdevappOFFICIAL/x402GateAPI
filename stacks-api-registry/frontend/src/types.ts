export interface ApiConfig {
  apiName: string;
  allowedAgents: string;
  cooldownBlocks: number;
  verifyAgent: boolean;
}

export interface ApiData extends ApiConfig {
  owner: string;
  txid?: string;
}
