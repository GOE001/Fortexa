import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizePolicy } from "@/lib/storage/policy-store";
import { __resetDatabaseForTests } from "@/lib/storage/db";
import { policyConfigSchema } from "@/lib/validation/schemas";
import type { PolicyConfig } from "@/lib/types/domain";

const fixturePath = (name: string) =>
  path.join(import.meta.url.replace("file://", ""), "..", "fixtures", `${name}.json`).replace(/\\/g, "/");

const loadFixture = async (name: string): Promise<PolicyConfig> => {
  const raw = await fs.readFile(fixturePath(name), "utf8");
  return JSON.parse(raw) as PolicyConfig;
};

const serialize = (policy: PolicyConfig) => JSON.stringify(policy, null, 2);
const deserializeAndNormalize = (raw: string) => {
  const parsed = JSON.parse(raw);
  return normalizePolicy(policyConfigSchema.parse(parsed));
};

const VALID_NAMES = ["default-policy", "strict-policy", "permissive-policy"] as const;

describe("policy import/export round trips", () => {
  beforeEach(async () => {
    await __resetDatabaseForTests();
  });

  afterEach(async () => {
    await __resetDatabaseForTests();
  });

  it.each(VALID_NAMES)("round-trips %s deterministically", async (name) => {
    const fixture = await loadFixture(name);
    const exported = serialize(fixture);

    const firstPass = deserializeAndNormalize(exported);
    const reExported = serialize(firstPass);

    const secondPass = deserializeAndNormalize(reExported);
    const reReExported = serialize(secondPass);

    expect(reExported).toBe(reReExported);
  });

  it("validates each valid fixture against the policy schema", async () => {
    for (const name of VALID_NAMES) {
      const fixture = await loadFixture(name);
      const result = policyConfigSchema.safeParse(fixture);
      expect(result.success, `${name} should validate`).toBe(true);
    }
  });

  it("rejects invalid policy with clear validation errors", async () => {
    const invalid = await loadFixture("invalid-policy");
    const result = policyConfigSchema.safeParse(invalid as unknown);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten();
      const domainErrors = errors.fieldErrors.allowedDomains?.map((e) => e) ?? [];
      const capErrors = errors.fieldErrors.perTxCapXLM?.map((e) => e) ?? [];
      expect(domainErrors.length > 0 || capErrors.length > 0, "should report missing allowedDomains or invalid perTxCapXLM").toBe(true);
    }
  });
});
