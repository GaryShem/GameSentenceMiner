import json
import re
from pathlib import Path

from GameSentenceMiner.ui.config.i18n import load_localization
from GameSentenceMiner.util.config import configuration
from GameSentenceMiner.util.config.configuration import Config, Locale


def test_locale_accepts_desktop_locale_aliases():
    assert Locale.from_any("en") is Locale.English
    assert Locale.from_any("ja") is Locale.日本語
    assert Locale.from_any("ko") is Locale.한국어
    assert Locale.from_any("ukr") is Locale.Українська
    assert Locale.from_any("zh") is Locale.中文
    assert Locale.from_any("es") is Locale.Español
    assert Locale.from_any("ru") is Locale.Русский


def test_python_locale_files_exist_for_desktop_languages():
    root = Path(__file__).resolve().parents[3]
    locales_dir = root / "GameSentenceMiner" / "locales"
    locale_names = ("en_us", "ja_jp", "zh_cn", "es_es", "ko_kr", "ukr_ua", "ru_ru")

    for locale_name in locale_names:
        locale_path = locales_dir / f"{locale_name}.json"
        assert locale_path.exists()
        locale_data = json.loads(locale_path.read_text(encoding="utf-8"))
        assert locale_data["python"]["config"]["tabs"]["general"]["locale"]["label"]


def test_load_localization_supports_new_locales():
    assert load_localization(Locale.한국어)["tabs"]["general"]["locale"]["label"]
    assert load_localization(Locale.Українська)["tabs"]["general"]["locale"]["label"]
    assert load_localization(Locale.Русский)["tabs"]["general"]["locale"]["label"]


def test_russian_locale_matches_english_keys_and_placeholders():
    root = Path(__file__).resolve().parents[3] / "GameSentenceMiner" / "locales"
    english = json.loads((root / "en_us.json").read_text(encoding="utf-8"))
    russian = json.loads((root / "ru_ru.json").read_text(encoding="utf-8"))

    def flatten(value, prefix=""):
        if isinstance(value, dict):
            result = {}
            for key, child in value.items():
                child_prefix = f"{prefix}.{key}" if prefix else key
                result.update(flatten(child, child_prefix))
            return result
        if isinstance(value, list):
            result = {}
            for index, child in enumerate(value):
                result.update(flatten(child, f"{prefix}[{index}]"))
            return result
        return {prefix: value}

    english_values = flatten(english)
    russian_values = flatten(russian)
    assert russian_values.keys() == english_values.keys()

    placeholder_pattern = re.compile(r"\{[A-Za-z_][A-Za-z0-9_]*\}")
    for key, english_value in english_values.items():
        russian_value = russian_values[key]
        assert type(russian_value) is type(english_value), key
        if isinstance(english_value, str):
            assert sorted(placeholder_pattern.findall(russian_value)) == sorted(
                placeholder_pattern.findall(english_value)
            ), key


def test_load_config_reads_utf8_json_with_non_ascii_text(tmp_path, monkeypatch):
    config_path = tmp_path / "config.json"
    data = Config.new().to_dict()
    data["locale"] = "ukr_ua"
    data["configs"]["Default"]["scenes"] = ["もっと！", "Українська"]

    config_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    monkeypatch.setattr(configuration, "get_config_path", lambda: str(config_path))

    loaded = configuration.load_config()

    assert loaded.locale == "ukr_ua"
    assert loaded.configs["Default"].scenes == ["もっと！", "Українська"]
