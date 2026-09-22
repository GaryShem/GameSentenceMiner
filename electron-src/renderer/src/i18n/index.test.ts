import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { I18nProvider, SUPPORTED_LOCALES, useTranslation } from "./index";

describe("renderer locales", () => {
  it("offers Russian in the display-language selector", () => {
    expect(SUPPORTED_LOCALES).toContainEqual({ code: "ru", label: "Русский" });
  });

  it("resolves nested keys from the Russian renderer catalog", () => {
    function NestedTranslation() {
      const t = useTranslation();
      return createElement("span", null, t("settings.desktop.showYuzuLauncher"));
    }

    const markup = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { initialLocale: "ru" },
        createElement(NestedTranslation),
      ),
    );

    expect(markup).toContain("Показывать запуск Yuzu:");
    expect(markup).not.toContain("settings.desktop.showYuzuLauncher");
  });
});
