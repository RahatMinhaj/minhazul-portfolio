import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "@/lib/http/same-origin";

describe("isSameOriginRequest", () => {
  it("accepts the URL origin directly", () => {
    const request = new Request("http://localhost:3000/api/chat", {
      headers: { origin: "http://localhost:3000" },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it("accepts the browser host when standalone uses an internal URL", () => {
    const request = new Request("http://0.0.0.0:3000/api/chat", {
      headers: {
        host: "10.33.158.252:3000",
        origin: "http://10.33.158.252:3000",
      },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it("accepts the public origin forwarded by a TLS proxy", () => {
    const request = new Request("http://0.0.0.0:3000/api/chat", {
      headers: {
        host: "localhost:3000",
        origin: "https://portfolio.example.com",
        "x-forwarded-host": "portfolio.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it("accepts the explicitly configured canonical origin", () => {
    const request = new Request("http://0.0.0.0:3000/api/chat", {
      headers: { origin: "https://portfolio.example.com" },
    });

    expect(
      isSameOriginRequest(request, "https://portfolio.example.com"),
    ).toBe(true);
  });

  it("rejects unrelated and malformed origins", () => {
    const unrelated = new Request("http://0.0.0.0:3000/api/chat", {
      headers: {
        host: "portfolio.example.com",
        origin: "https://attacker.example",
      },
    });
    const malformed = new Request("http://0.0.0.0:3000/api/chat", {
      headers: { origin: "not a URL" },
    });

    expect(isSameOriginRequest(unrelated)).toBe(false);
    expect(isSameOriginRequest(malformed)).toBe(false);
  });

  it("accepts requests without an Origin header", () => {
    expect(
      isSameOriginRequest(new Request("http://localhost:3000/api/chat")),
    ).toBe(true);
  });
});
