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
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { CLIENT_LOGIN_KEYS, resolveClientUrl } from "../clientText";
import { enviarCpfSoComDigitos, textosDoLogin } from "../textosDoLogin";
import { CabecalhoDoLogin, CampoUsuario, ProvedoresSociais, RodapeDoLogin } from "./loginComum";

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
        realm,
        url,
        usernameHidden,
        login,
        auth,
        messagesPerField,
        enableWebAuthnConditionalUI,
        authenticators,
        message,
        isAppInitiatedAction,
        client
    } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({ webAuthnButtonId, kcContext, i18n });

    const hasFieldError = messagesPerField.existsError("username", "password");

    /* Textos, campo de usuário e chips: os mesmos da etapa do usuário (loginComum). */
    const textos = textosDoLogin(kcContext, i18n);
    const { titulo, mascaraCpf, perfis, showRegistration, showLanguages } = textos;

    /* "Esqueci minha senha" tratado fora do Keycloak, quando o client aponta para
       onde: vale mesmo com o reset do realm desligado (é o caso do candidato). */
    const urlEsqueciSenha = resolveClientUrl({ client, key: CLIENT_LOGIN_KEYS.forgotPasswordUrl });

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
            displayInfo={showRegistration || showLanguages || perfis.length !== 0}
            infoNode={
                <RodapeDoLogin
                    i18n={i18n}
                    kcClsx={kcClsx}
                    perfis={perfis}
                    showLanguages={showLanguages}
                    showRegistration={showRegistration}
                    registrationUrl={url.registrationUrl}
                    notaRodape={textos.notaRodape}
                />
            }
            socialProvidersNode={<ProvedoresSociais i18n={i18n} kcClsx={kcClsx} providers={textos.socialProviders} />}
        >
            <CabecalhoDoLogin kcContext={kcContext} i18n={i18n} eyebrow={textos.eyebrow} titulo={titulo} lead={textos.lead} />

            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            className="cvt-login__form"
                            onSubmit={event => {
                                if (mascaraCpf) {
                                    enviarCpfSoComDigitos(event.currentTarget);
                                }
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            {!usernameHidden && (
                                <CampoUsuario
                                    kcClsx={kcClsx}
                                    rotulo={textos.rotuloUsuario}
                                    exemplo={textos.exemploUsuario}
                                    mascaraCpf={mascaraCpf}
                                    valorInicial={login.username ?? ""}
                                    autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                                    erro={hasFieldError ? messagesPerField.getFirstError("username", "password") : undefined}
                                />
                            )}

                            <div className={kcClsx("kcFormGroupClass")}>
                                <div className="cvt-label-row">
                                    <label htmlFor="password" className={kcClsx("kcLabelClass")}>
                                        {msg("password")}
                                    </label>
                                    {(urlEsqueciSenha !== undefined || realm.resetPasswordAllowed) && (
                                        <a className="cvt-forgot" href={urlEsqueciSenha ?? url.loginResetCredentialsUrl}>
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
