import type { Preview } from "@storybook/react-vite";
import { setStoryLanguageTag } from "../src/login/KcPageStory";

/* Dois seletores na toolbar do Storybook:

   - Idioma: escreve em kcContext.locale.currentLanguageTag via setStoryLanguageTag,
     porque o mock do keycloakify fixa "en" e o dropdown de idioma da própria tela
     aponta para URLs do Keycloak que não existem no Storybook.

   - Tema: escreve data-theme no <html>. O CSS do tema responde tanto a
     prefers-color-scheme quanto a [data-theme] (ver src/login/styles/tokens.css),
     e é o atributo que permite forçar um dos dois aqui. "Sistema" remove o
     atributo e devolve o controle ao prefers-color-scheme do SO. */

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    },
    globalTypes: {
        locale: {
            description: "Idioma da tela (kcContext.locale.currentLanguageTag)",
            toolbar: {
                title: "Idioma",
                icon: "globe",
                dynamicTitle: true,
                items: [
                    { value: "pt-BR", title: "Português (Brasil)" },
                    { value: "en", title: "English" },
                    { value: "es", title: "Español" },
                    { value: "fr", title: "Français" },
                    { value: "de", title: "Deutsch" }
                ]
            }
        },
        theme: {
            description: "Modo de cor",
            toolbar: {
                title: "Tema",
                icon: "paintbrush",
                dynamicTitle: true,
                items: [
                    { value: "claro", title: "Claro" },
                    { value: "escuro", title: "Escuro" },
                    { value: "sistema", title: "Sistema (prefers-color-scheme)" }
                ]
            }
        }
    },
    initialGlobals: {
        locale: "pt-BR",
        theme: "claro"
    },
    decorators: [
        (Story, context) => {
            const { locale, theme } = context.globals;

            setStoryLanguageTag(typeof locale === "string" ? locale : undefined);

            const root = document.documentElement;

            if (theme === "sistema") {
                root.removeAttribute("data-theme");
            } else if (typeof theme === "string") {
                root.setAttribute("data-theme", theme);
            }

            return Story();
        }
    ]
};

export default preview;
