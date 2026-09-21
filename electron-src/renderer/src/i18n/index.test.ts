import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "./index";

describe("renderer locales", () => {
  it("offers Russian in the display-language selector", () => {
    expect(SUPPORTED_LOCALES).toContainEqual({ code: "ru", label: "Русский" });
  });
});
