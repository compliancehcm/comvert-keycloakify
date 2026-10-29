import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import {
    CLIENT_LOGIN_KEYS,
    CLIENT_TEXT_KEYS,
    PERFIS_CONHECIDOS,
    resolveClientName,
    resolveClientProfiles,
    resolveClientText
} from "./clientText";
import { digitosDoCpf } from "./cpf";

/* O que a tela de login e a etapa do usuário têm em comum. Com Organizations ligado
   no realm, o Keycloak pede o usuário numa página (login-username.ftl) antes da senha;
   sem ele, os dois vêm juntos (login.ftl). As duas são a "tela de login" do client:
   mesmo cabeçalho, mesmos textos por atributo, mesmos chips de "Entrar como". Os
   componentes estão em pages/loginComum.tsx. */

export type KcContextDoLogin = Extract<
    KcContext,
    { pageId: "login.ftl" | "login-username.ftl" }
>;

/** Os textos e o comportamento da tela que o client pode sobrescrever (src/login/clientText.ts). */
export function textosDoLogin(kcContext: KcContextDoLogin, i18n: I18n) {
    const { realm, client, social, registrationDisabled } = kcContext;
    const { msgStr, advancedMsgStr, currentLanguage, enabledLanguages } = i18n;

    /* O design pede o rótulo "E-mail corporativo". Só é honesto usá-lo quando o realm
       de fato aceita e-mail no login; se o admin desligar isso, volta o rótulo do
       Keycloak, senão a tela pediria algo que o servidor não aceita. */
    const usesEmailLabel = realm.loginWithEmailAllowed;

    /* Textos da coluna da direita: o client pode sobrescrever cada um por atributo,
       e sem atributo cai no padrao do tema. */
    const texto = (key: string, fallback: string) =>
        resolveClientText({
            client,
            key,
            languageTag: currentLanguage.languageTag,
            fallback
        });

    /* Título, em tres camadas: atributo cvt.title, depois o nome do client, depois o
       padrao do tema. O nome so e tratado como chave de mensagem na forma ${chave} --
       ver resolveClientName, que explica por que a forma sem chaves e armadilha. */
    const nomeDoClient = resolveClientName({ name: client?.name, advancedMsgStr });

    return {
        eyebrow: texto(CLIENT_TEXT_KEYS.eyebrow, msgStr("cvtLoginEyebrow")),
        titulo: texto(
            CLIENT_TEXT_KEYS.title,
            nomeDoClient ?? msgStr("loginAccountTitle")
        ),
        lead: texto(CLIENT_TEXT_KEYS.lead, msgStr("cvtLoginLead")),
        notaRodape: texto(CLIENT_TEXT_KEYS.footerNote, msgStr("cvtLoginFooterNote")),
        /* Campo de usuário por client: o candidato da pré-admissão entra com o CPF, e
           o rótulo "E-mail corporativo" do design não serve para ele. */
        rotuloUsuario: texto(
            CLIENT_LOGIN_KEYS.usernameLabel,
            usesEmailLabel ? msgStr("cvtLoginIdLabel") : msgStr("username")
        ),
        exemploUsuario: texto(
            CLIENT_LOGIN_KEYS.usernamePlaceholder,
            usesEmailLabel ? msgStr("cvtLoginIdPlaceholder") : ""
        ),
        mascaraCpf: client?.attributes?.[CLIENT_LOGIN_KEYS.usernameMask] === "cpf",
        /* "Entrar como": cada perfil é a tela de login de outro client. O rótulo dos
           perfis conhecidos vem do bundle, para trocar junto com o idioma. */
        perfis: resolveClientProfiles({
            client,
            rotuloDoPerfil: perfil => msgStr(PERFIS_CONHECIDOS[perfil])
        }),
        showRegistration:
            realm.password && realm.registrationAllowed && !registrationDisabled,
        showLanguages: enabledLanguages.length > 1,
        socialProviders:
            realm.password && social?.providers !== undefined ? social.providers : []
    };
}

/** O usuário no Keycloak é o CPF só com dígitos: a máscara é só para leitura na tela. */
export function enviarCpfSoComDigitos(form: HTMLFormElement) {
    const campo = form.elements.namedItem("username");
    if (campo instanceof HTMLInputElement) {
        campo.value = digitosDoCpf(campo.value);
    }
}
