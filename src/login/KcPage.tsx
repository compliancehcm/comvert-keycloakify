import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "./Template";
import Login from "./pages/Login";
import { initializeThemePreference } from "./themePreference";
import "./main.css";
const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

/* Aplica a escolha de tema no escopo de modulo, nao num effect: aqui roda depois de
   o CSS deste chunk estar aplicado e ANTES do primeiro render, o que evita o usuario
   ver um instante do tema errado. O darkMode vem da configuracao de realm em
   Realm Settings -> Themes -> Dark Mode; ele nao esta no tipo KcContext do
   keycloakify, mas o Keycloak 26 o entrega no contexto da pagina de login
   (verificado). Ausente conta como permitido. */
initializeThemePreference({
    darkModeAllowed:
        (window.kcContext as { darkMode?: boolean } | undefined)?.darkMode !== false
});

const doMakeUserConfirmPassword = true;

/* O tema traz sua própria camada de CSS (src/login/styles/*). Carregar PatternFly
   junto brigaria com as três regras absolutas do design: card sem sombra, foco só
   na borda e ausência de estado de press. As ~125 ClassKeys continuam disponíveis
   como gancho de estilo mesmo com false — ver o comentário em kc-base.css. */
const doUseDefaultCss = false;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        // Import estático, não lazy: é a página quente do tema, e um
                        // chunk separado custaria um round trip na única URL que importa.
                        return (
                            <Login
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={doUseDefaultCss}
                            />
                        );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={doUseDefaultCss}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
