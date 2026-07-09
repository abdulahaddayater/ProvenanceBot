const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@provenancebot/agents'],
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['@stellar/stellar-sdk'],
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: false,
  disableLogger: true,
  automaticVercelMonitors: false,
});
