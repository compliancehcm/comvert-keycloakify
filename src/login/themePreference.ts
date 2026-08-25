/* Preferência de tema do usuário: sistema, claro ou escuro.

   O CSS do tema já responde a [data-theme="claro"] / [data-theme="escuro"] no <html>
   e, na ausência do atributo, ao prefers-color-scheme (ver src/login/styles/tokens.css).
   Aqui só se grava a escolha e se aplica o atributo.

   Nota sobre o que o Keycloakify faz: o tema de account dele segue apenas o
   prefers-color-scheme, sem escolha do usuário (src/account/colorScheme.ts). Esta
   camada é adição nossa; o "sistema" reproduz o comportamento dele. */

export const THEME_PREFERENCES = ["sistema", "claro", "escuro"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = "cvt.themePreference";

/** localStorage lança em navegação privada e com cookies bloqueados. A escolha de
 *  tema não vale derrubar a tela de login, então toda leitura e escrita é protegida
 *  e falha para "sistema". */
function readStorage(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStorage(value: ThemePreference): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // Sem persistência: a escolha vale só para esta página.
    }
}

function isThemePreference(value: string | null): value is ThemePreference {
    return value !== null && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function readThemePreference(): ThemePreference {
    const stored = readStorage();

    return isThemePreference(stored) ? stored : "sistema";
}

/** Aplica no <html>. "sistema" remove o atributo e devolve o controle ao
 *  prefers-color-scheme. */
export function applyThemePreference(preference: ThemePreference): void {
    const root = document.documentElement;

    if (preference === "sistema") {
        root.removeAttribute("data-theme");
        return;
    }

    root.setAttribute("data-theme", preference);
}

export function nextThemePreference(current: ThemePreference): ThemePreference {
    const i = THEME_PREFERENCES.indexOf(current);

    return THEME_PREFERENCES[(i + 1) % THEME_PREFERENCES.length];
}

export function setThemePreference(preference: ThemePreference): void {
    writeStorage(preference);
    applyThemePreference(preference);
}

/**
 * Aplica a escolha gravada o mais cedo possível, para o usuário não ver um instante
 * do tema errado. Chamado no escopo de módulo de KcPage.tsx: roda depois de o CSS do
 * chunk estar aplicado e antes do primeiro render do React.
 *
 * `darkModeAllowed` vem de kcContext.darkMode, a configuração de realm em
 * Realm Settings -> Themes -> Dark Mode. Quando o admin a desliga, o escuro não é
 * uma opção: força-se o claro e o botão não é exibido.
 */
export function initializeThemePreference(params: { darkModeAllowed: boolean }): void {
    const { darkModeAllowed } = params;

    if (!darkModeAllowed) {
        applyThemePreference("claro");
        return;
    }

    applyThemePreference(readThemePreference());
}
