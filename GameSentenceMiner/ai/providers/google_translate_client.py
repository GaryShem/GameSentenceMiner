from __future__ import annotations

import time

from deep_translator import GoogleTranslator

from GameSentenceMiner.ai.contracts import AIRequest, AIResponse, AIError


class GoogleTranslateClient:
    def __init__(self, logger, target_lang: str = "en"):
        self.logger = logger
        self.target_lang = target_lang or "en"

    def generate(self, request: AIRequest) -> AIResponse:
        start_time = time.time()

        try:
            text_to_send = request.prompt.strip()

            if not text_to_send:
                raise AIError(
                    "Empty input to Google Translate",
                    transient=False,
                )


            target_lang = self.target_lang

            if request.metadata:
                target_lang = request.metadata.get(
                    "target_lang",
                    target_lang,
                )

            self.logger.debug(
                f"[GOOGLE TRANSLATE] Translating ja -> {target_lang}: {text_to_send[:100]}"
            )

            translated = GoogleTranslator(
                source="ja",
                target=target_lang,
            ).translate(text_to_send)

            if not translated:
                raise AIError(
                    "Google Translate returned an empty response",
                    transient=True,
                )

            latency_ms = int((time.time() - start_time) * 1000)

            self.logger.debug(
                f"[GOOGLE TRANSLATE] Result: {translated[:100]}"
            )

            return AIResponse(
                provider=request.provider,
                model="google-translate",
                text=translated,
                raw_text=translated,
                latency_ms=latency_ms,
                usage=None,
            )

        except AIError:
            raise

        except Exception as e:
            self.logger.exception(
                f"Google Translate processing failed: {e}"
            )
            raise AIError(
                f"Google Translate failed: {e}",
                transient=True,
            )
