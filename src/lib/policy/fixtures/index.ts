import type { PolicyConfig } from "@/lib/types/domain";

/**
 * Golden fixtures for policy import/export round trips.
 *
 * Each entry represents a realistic policy configuration used to verify
 * that serializing and deserializing policy configs produces stable,
 * deterministic output. The companion test suite round-trips every valid
 * fixture through the policy schema and normalization pipeline, asserting
 * that re-exports match the original canonical representation.
 *
 * @see {@link ./import-export-roundtrip.test.ts}
 */

export interface PolicyFixture {
  readonly name: string;
  readonly description: string;
  readonly policy: PolicyConfig;
}

export interface InvalidPolicyFixture {
  readonly name: string;
  readonly description: string;
  readonly policy: unknown;
}

export const validFixtures: readonly PolicyFixture[] = [
  {
    name: "default-policy",
    description: "Baseline policy matching the built-in operational defaults.",
    policy: {
      allowedDomains: ["api.safe-research.ai", "tools.verified-data.dev", "workers.fortexa-demo.stellar"],
      blockedDomains: ["wallet-drainer.evil", "prompt-pwn.io", "untrusted-mirror.xyz"],
      allowedTools: ["research-pro", "market-feed", "settlement-worker"],
      blockedTools: ["shadow-shell", "autonomous-payout-bypass"],
      perTxCapXLM: 120,
      dailyCapXLM: 300,
      maxToolCallsPerDay: 8,
      riskThreshold: 78,
      allowedHours: { start: 6, end: 23 },
    },
  },
  {
    name: "strict-policy",
    description: "Conservative limits for high-trust operator environments.",
    policy: {
      allowedDomains: ["api.safe-research.ai"],
      blockedDomains: ["wallet-drainer.evil", "prompt-pwn.io", "untrusted-mirror.xyz"],
      allowedTools: ["research-pro"],
      blockedTools: ["shadow-shell", "autonomous-payout-bypass", "market-feed", "settlement-worker"],
      perTxCapXLM: 10,
      dailyCapXLM: 50,
      maxToolCallsPerDay: 2,
      riskThreshold: 50,
      allowedHours: { start: 8, end: 18 },
    },
  },
  {
    name: "permissive-policy",
    description: "Broader approval surface for research and analytics workflows.",
    policy: {
      allowedDomains: [
        "api.safe-research.ai",
        "tools.verified-data.dev",
        "workers.fortexa-demo.stellar",
        "analytics.fortexa-external.top",
        "integration-staging.fortexa.internal",
      ],
      blockedDomains: ["wallet-drainer.evil"],
      allowedTools: ["research-pro", "market-feed", "settlement-worker", "analytics-pro", "debug-helper"],
      blockedTools: ["shadow-shell"],
      perTxCapXLM: 500,
      dailyCapXLM: 2500,
      maxToolCallsPerDay: 50,
      riskThreshold: 90,
      allowedHours: { start: 0, end: 23 },
    },
  },
];

export const invalidFixtures: readonly InvalidPolicyFixture[] = [
  {
    name: "invalid-policy",
    description: "Missing allowedDomains and negative perTxCapXLM to verify clear validation errors.",
    policy: {
      blockedDomains: ["wallet-drainer.evil"],
      allowedTools: ["research-pro"],
      blockedTools: ["shadow-shell"],
      perTxCapXLM: -5,
      dailyCapXLM: 300,
      maxToolCallsPerDay: 8,
      riskThreshold: 78,
      allowedHours: { start: 6, end: 23 },
    },
  },
];
