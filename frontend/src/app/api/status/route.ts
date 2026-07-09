import { NextResponse } from 'next/server';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';

export async function GET() {
  ensureServerEnv();

  const { loadContractId } = await import('@provenancebot/agents/contract-id');
  const { getSorobanClient } = await import('@provenancebot/agents/soroban');
  const client = getSorobanClient();

  return NextResponse.json({
    service: 'provenancebot-agents',
    status: 'ok',
    network: 'testnet',
    contractId: loadContractId() || client.getContractId(),
    sorobanConfigured: client.isConfigured(),
    timestamp: new Date().toISOString(),
  });
}
