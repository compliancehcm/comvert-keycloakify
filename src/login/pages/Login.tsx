import { useState, type JSX } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Alert } from "../components/Alert";
import { EyeIcon, EyeOffIcon, MonitorIcon } from "../components/Icons";
import { LocaleDropdown } from "../components/LocaleDropdown";
import { CLIENT_TEXT_KEYS, resolveClientName, resolveClientText } from "../clientText";

/* Reimplementação de keycloakify/login/pages/Login, remodelada para o design
   Compliance HCM. Todo o contrato do Keycloak é preservado — nomes de campo, ids,
   gates de realm, guarda de duplo POST e o bloco de WebAuthn conditional UI.

   Diferenças deliberadas em relação à implementação padrão do keycloakify:
   - nenhum tabIndex positivo: a ordem do DOM já é a ordem visual, e índice positivo
     faz qualquer elemento futuro cair depois de todos os numerados;
   - aria-pressed no botão do olho e aria-describedby no campo com erro;
   - o alerta de mensagem é renderizado aqui (displayMessage={false} no Template),
     porque o design o quer imediatamente acima do botão Entrar. */
export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const {
        social,
        realm,
        url,
        usernameHidden,
        login,
        auth,
        registrationDisabled,
        messagesPerField,
        enableWebAuthnConditionalUI,
        authenticators,
        message,
        isAppInitiatedAction,
        client
    } = kcContext;

    const { msg, msgStr, advancedMsgStr, currentLanguage, enabledLanguages } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({ webAuthnButtonId, kcContext, i18n });

    const hasFieldError = messagesPerField.existsError("username", "password");

    /* O design pede o rótulo "E-mail corporativo". Só é honesto usá-lo quando o realm
       de fato aceita e-mail no login; se o admin desligar isso, volta o rótulo do
       Keycloak, senão a tela pediria algo que o servidor não aceita. */
    const usesEmailLabel = realm.loginWithEmailAllowed;

    const showRegistration = realm.password && realm.registrationAllowed && !registrationDisabled;
    const showLanguages = enabledLanguages.length > 1;

    const socialProviders = realm.password && social?.providers !== undefined ? social.providers : [];

    /* Textos da coluna da direita: o client pode sobrescrever cada um por atributo,
       e sem atributo cai no padrao do tema. Ver src/login/clientText.ts. */
    const texto = (key: string, fallback: string) => resolveClientText({ client, key, languageTag: currentLanguage.languageTag, fallback });

    const eyebrow = texto(CLIENT_TEXT_KEYS.eyebrow, msgStr("cvtLoginEyebrow"));

    /* Título, em tres camadas: atributo cvt.title, depois o nome do client, depois o
       padrao do tema. O nome so e tratado como chave de mensagem na forma ${chave} --
       ver resolveClientName, que explica por que a forma sem chaves e armadilha. */
    const nomeDoClient = resolveClientName({ name: client?.name, advancedMsgStr });

    const titulo = texto(CLIENT_TEXT_KEYS.title, nomeDoClient ?? msgStr("loginAccountTitle"));
    const lead = texto(CLIENT_TEXT_KEYS.lead, msgStr("cvtLoginLead"));
    const notaRodape = texto(CLIENT_TEXT_KEYS.footerNote, msgStr("cvtLoginFooterNote"));

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
            /* O Template não desenha cabeçalho na página de login -- o título é
               renderizado aqui embaixo. Ainda assim passa o valor já resolvido, para
               não haver duas fontes de verdade se o Template passar a usá-lo. */
            headerNode={titulo}
            displayInfo={showRegistration || showLanguages}
            infoNode={
                <div className="cvt-login__footer">
                    {showLanguages && <LocaleDropdown i18n={i18n} kcClsx={kcClsx} className="cvt-login__locale" />}
                    {showRegistration && (
                        <div id="kc-registration-container">
                            <div id="kc-registration">
                                <span>
                                    {msg("noAccount")} <a href={url.registrationUrl}>{msg("doRegister")}</a>
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="cvt-login__note">{notaRodape}</div>
                </div>
            }
            socialProvidersNode={
                socialProviders.length !== 0 && (
                    <div id="kc-social-providers" className={clsx("cvt-login__social", kcClsx("kcFormSocialAccountSectionClass"))}>
                        <div className="cvt-divider">
                            <span className="cvt-divider__line" aria-hidden="true"></span>
                            <span className="cvt-divider__label">{msg("cvtOr")}</span>
                            <span className="cvt-divider__line" aria-hidden="true"></span>
                        </div>
                        <h2 className={kcClsx("kcSrOnlyClass")}>{msg("identity-provider-login-label")}</h2>
                        <ul className={kcClsx("kcFormSocialAccountListClass", socialProviders.length > 3 && "kcFormSocialAccountListGridClass")}>
                            {socialProviders.map((...[p, , providers]) => (
                                <li key={p.alias}>
                                    <a
                                        id={`social-${p.alias}`}
                                        className={kcClsx(
                                            "kcButtonClass",
                                            "kcButtonSecondaryClass",
                                            "kcButtonBlockClass",
                                            "kcButtonLargeClass",
                                            "kcFormSocialAccountListButtonClass",
                                            providers.length > 3 && "kcFormSocialAccountGridItem"
                                        )}
                                        href={p.loginUrl}
                                    >
                                        <MonitorIcon />
                                        <span
                                            className={kcClsx("kcFormSocialAccountNameClass")}
                                            dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }}
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        >
            <div className="cvt-eyebrow">{eyebrow}</div>

            {auth !== undefined && auth.showUsername && !auth.showResetCredentials ? (
                /* O design não tem slot para o "usuário já identificado", então esse
                   bloco toma o lugar do título e da linha de apoio. */
                <div id="kc-username">
                    <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                    <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                        <div className="kc-login-tooltip">
                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                        </div>
                    </a>
                </div>
            ) : (
                <>
                    <h1 id="kc-page-title" className="cvt-page__title">
                        {titulo}
                    </h1>
                    <p className="cvt-login__lead">{lead}</p>
                </>
            )}

            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            className="cvt-login__form"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            {!usernameHidden && (
                                <div className={kcClsx("kcFormGroupClass")}>
                                    <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                        {usesEmailLabel ? msg("cvtLoginIdLabel") : msg("username")}
                                    </label>
                                    <input
                                        id="username"
                                        className={kcClsx("kcInputClass")}
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        type="text"
                                        placeholder={usesEmailLabel ? msgStr("cvtLoginIdPlaceholder") : undefined}
                                        autoFocus
                                        autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                                        aria-invalid={hasFieldError}
                                        aria-describedby={hasFieldError ? "input-error" : undefined}
                                    />
                                    {hasFieldError && (
                                        <span
                                            id="input-error"
                                            className={kcClsx("kcInputErrorMessageClass")}
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            <div className={kcClsx("kcFormGroupClass")}>
                                <div className="cvt-label-row">
                                    <label htmlFor="password" className={kcClsx("kcLabelClass")}>
                                        {msg("password")}
                                    </label>
                                    {realm.resetPasswordAllowed && (
                                        <a className="cvt-forgot" href={url.loginResetCredentialsUrl}>
                                            {msg("doForgotPassword")}
                                        </a>
                                    )}
                                </div>
                                <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">
                                    <input
                                        id="password"
                                        className={kcClsx("kcInputClass")}
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        aria-invalid={hasFieldError}
                                        aria-describedby={usernameHidden && hasFieldError ? "input-error" : undefined}
                                    />
                                </PasswordWrapper>
                                {usernameHidden && hasFieldError && (
                                    <span
                                        id="input-error"
                                        className={kcClsx("kcInputErrorMessageClass")}
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                        }}
                                    />
                                )}
                            </div>

                            {realm.rememberMe && !usernameHidden && (
                                <div id="kc-form-options" className="cvt-login__remember">
                                    <div className="checkbox">
                                        <label>
                                            <input id="rememberMe" name="rememberMe" type="checkbox" defaultChecked={!!login.rememberMe} />{" "}
                                            {msg("rememberMe")}
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Mesma condição do Template, mais a supressão quando já existe
                                erro por campo (senão a mensagem apareceria duplicada). */}
                            {!hasFieldError && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                                <Alert message={message} kcClsx={kcClsx} />
                            )}

                            <div id="kc-form-buttons">
                                <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                                <input
                                    disabled={isLoginButtonDisabled}
                                    className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doLogIn")}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {enableWebAuthnConditionalUI && (
                <>
                    <form id="webauth" action={url.loginAction} method="post">
                        <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                        <input type="hidden" id="authenticatorData" name="authenticatorData" />
                        <input type="hidden" id="signature" name="signature" />
                        <input type="hidden" id="credentialId" name="credentialId" />
                        <input type="hidden" id="userHandle" name="userHandle" />
                        <input type="hidden" id="error" name="error" />
                    </form>
                    {authenticators !== undefined && authenticators.authenticators.length !== 0 && (
                        <form id="authn_select" className={kcClsx("kcFormClass")}>
                            {authenticators.authenticators.map((authenticator, i) => (
                                <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                            ))}
                        </form>
                    )}
                    {/* O useScript faz polling até este elemento existir: nunca remover
                        enquanto enableWebAuthnConditionalUI puder ser true. */}
                    <input
                        id={webAuthnButtonId}
                        type="button"
                        className={clsx(
                            "cvt-login__passkey",
                            kcClsx("kcButtonClass", "kcButtonSecondaryClass", "kcButtonBlockClass", "kcButtonLargeClass")
                        )}
                        value={msgStr("passkey-doAuthenticate")}
                    />
                </>
            )}
        </Template>
    );
}

function PasswordWrapper(props: { kcClsx: ReturnType<typeof getKcClsx>["kcClsx"]; i18n: I18n; passwordInputId: string; children: JSX.Element }) {
    const { kcClsx, i18n, passwordInputId, children } = props;

    const { msgStr } = i18n;

    /* Este hook faz assert(document.getElementById(passwordInputId) instanceof
       HTMLInputElement) num effect e LANÇA se falhar. Por isso ele vive num
       componente filho, montado só dentro do ramo realm.password. */
    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

    return (
        <div className={kcClsx("kcInputGroup")}>
            {children}
            <button
                type="button"
                className={kcClsx("kcFormPasswordVisibilityButtonClass")}
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                aria-pressed={isPasswordRevealed}
                onClick={toggleIsPasswordRevealed}
            >
                {isPasswordRevealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
}
