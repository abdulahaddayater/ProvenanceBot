/**
 * Client config stubs for Soroban + wallet connect.
 * Values are read from NEXT_PUBLIC_* env vars; no business logic yet.
 */
export const publicConfig = {
  agentsApiUrl: process.env.NEXT_PUBLIC_AGENTS_API_URL ?? 'http://localhost:3001',
  sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
  provenanceContractId:
    process.env.NEXT_PUBLIC_PROVENANCE_CONTRACT_ID ??
    'CAB2CE4EYPPZ6WKNVNBR3OM2AQETZFUISXDV2AJATYZTWCTMJ64EHP32',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  walletNetwork: process.env.NEXT_PUBLIC_WALLET_NETWORK ?? 'TESTNET',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'ProvenanceBot',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  analyticsWriteKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY ?? '',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
};
