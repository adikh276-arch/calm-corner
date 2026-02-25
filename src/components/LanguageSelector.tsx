import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import en from '../locales/en.json';

// ─── Feature flag ─────────────────────────────────────────────────────────────
// Set VITE_TRANSLATE_ENABLED=true in your environment to enable live translation.
// While false the dropdown is hidden and the app always runs in English.
const TRANSLATE_ENABLED =
    import.meta.env.VITE_TRANSLATE_ENABLED === 'true';

// ─── Language list ────────────────────────────────────────────────────────────
const LANGS: Array<[string, string]> = [
    ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어'], ['ar', 'العربية'],
    ['ru', 'Русский'], ['pt', 'Português'], ['hi', 'हिन्दी'], ['bn', 'বাংলা'],
    ['pa', 'ਪੰਜਾਬੀ'], ['vi', 'Tiếng Việt'], ['it', 'Italiano'], ['nl', 'Nederlands'],
    ['sv', 'Svenska'], ['no', 'Norsk'], ['da', 'Dansk'], ['fi', 'Suomi'],
    ['tr', 'Türkçe'], ['pl', 'Polski'], ['ro', 'Română'], ['cs', 'Čeština'],
    ['el', 'Ελληνικά'], ['he', 'עברית'], ['th', 'ไทย'],
    ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function flatten(obj: any, prefix = ''): [string[], string[]] {
    const keys: string[] = [];
    const vals: string[] = [];
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object') {
            const [subKeys, subVals] = flatten(v, path);
            keys.push(...subKeys);
            vals.push(...subVals);
        } else {
            keys.push(path);
            vals.push(String(v));
        }
    }
    return [keys, vals];
}

function unflatten(keys: string[], vals: string[]) {
    const out: any = {};
    keys.forEach((k, i) => {
        const parts = k.split('.');
        let cur = out;
        for (let j = 0; j < parts.length; j++) {
            const p = parts[j];
            if (j === parts.length - 1) cur[p] = vals[i];
            else {
                cur[p] = cur[p] || {};
                cur = cur[p];
            }
        }
    });
    return out;
}

// ─── Component ────────────────────────────────────────────────────────────────
const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [value, setValue] = useState(i18n.language || 'en');
    const [loading, setLoading] = useState(false);

    // If the feature is disabled we render a plain "disabled" badge and stop.
    if (!TRANSLATE_ENABLED) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 12,
                    right: 12,
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 13,
                    color: '#888',
                    userSelect: 'none',
                }}
                title="Live translation is not yet available. The app runs in English."
            >
                🌐 Translate <span style={{ opacity: 0.6 }}>(disabled)</span>
            </div>
        );
    }

    // ── Active (TRANSLATE_ENABLED=true) path ────────────────────────────────
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const lang = searchParams.get('lang');
        if (lang) {
            setValue(lang);
            changeLanguage(lang).catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function changeLanguage(next: string) {
        if (next === 'en') {
            i18n.addResourceBundle('en', 'translation', en, true, true);
            await i18n.changeLanguage('en');
            return;
        }

        if (i18n.hasResourceBundle(next, 'translation')) {
            await i18n.changeLanguage(next);
            return;
        }

        setLoading(true);
        try {
            const [keys, vals] = flatten(en);
            const PROXY = import.meta.env.VITE_TRANSLATE_PROXY_URL || '';
            const proxyBase = PROXY ? PROXY.replace(/\/$/, '') : '';
            const url = proxyBase ? `${proxyBase}/translate` : '/translate';

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: vals, target: next, source: 'en' }),
            });
            const json = await resp.json();
            const translations = json.translations || json.data?.translations || json;
            const translatedVals: string[] = Array.isArray(translations)
                ? translations.map((t: any) => t?.translatedText || t)
                : [];

            const resource = unflatten(keys, translatedVals.length ? translatedVals : vals);
            i18n.addResourceBundle(next, 'translation', resource, true, true);
            await i18n.changeLanguage(next);
        } catch (err) {
            console.error('Translation proxy error', err);
        } finally {
            setLoading(false);
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const next = e.target.value;
        setValue(next);
        changeLanguage(next).catch(() => { });
        const url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        navigate(`${url.pathname}${url.search}${url.hash}`);
    };

    return (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 999 }}>
            <label style={{ marginRight: 8 }}>
                <span style={{ marginRight: 6 }}>{i18n.t('app.language')}</span>
            </label>
            <select value={value} onChange={onChange} aria-label="Select language">
                {LANGS.map(([code, name]) => (
                    <option key={code} value={code}>{`${name} (${code.toUpperCase()})`}</option>
                ))}
            </select>
            {loading && <span style={{ marginLeft: 8 }}>Translating…</span>}
        </div>
    );
};

export default LanguageSelector;
