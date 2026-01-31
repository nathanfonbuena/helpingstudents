import "@testing-library/jest-dom";
import "whatwg-fetch";

// Polyfill for Web APIs needed by Next.js API routes
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill Response.json() static method (not in whatwg-fetch)
if (typeof Response.json !== "function") {
  Response.json = function (data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json"
      }
    });
  };
}
