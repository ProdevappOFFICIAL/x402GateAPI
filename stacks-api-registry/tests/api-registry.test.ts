import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("API Registry Contract Tests", () => {
  it("should create a new API", () => {
    const { result } = simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not create duplicate API", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-2"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-2"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(409));
  });

  it("should get API configuration", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-3"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "api-registry",
      "get-api",
      [Cl.stringAscii("test-api-3")],
      deployer
    );
    
    expect(result).toBeOk(
      Cl.tuple({
        "allowed-agents": Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        "cooldown-blocks": Cl.uint(10),
        "verify-agent": Cl.bool(true),
        owner: Cl.principal(deployer),
      })
    );
  });

  it("should update API by owner", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-4"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "api-registry",
      "update-api",
      [
        Cl.stringAscii("test-api-4"),
        Cl.stringUtf8("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.uint(20),
        Cl.bool(false),
      ],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not update API by non-owner", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-5"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "api-registry",
      "update-api",
      [
        Cl.stringAscii("test-api-5"),
        Cl.stringUtf8("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.uint(20),
        Cl.bool(false),
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(403));
  });

  it("should delete API by owner", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-6"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "api-registry",
      "delete-api",
      [Cl.stringAscii("test-api-6")],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should not delete API by non-owner", () => {
    simnet.callPublicFn(
      "api-registry",
      "create-api",
      [
        Cl.stringAscii("test-api-7"),
        Cl.stringUtf8("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(10),
        Cl.bool(true),
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "api-registry",
      "delete-api",
      [Cl.stringAscii("test-api-7")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(403));
  });

  it("should get API count", () => {
    const { result } = simnet.callReadOnlyFn(
      "api-registry",
      "get-api-count",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.uint(0)); // Count depends on previous tests
  });
});
