import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useScript } from "keycloakify/login/pages/LoginUsername.useScript";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Alert } from "../components/Alert";
import { enviarCpfSoComDigitos, textosDoLogin } from "../textosDoLogin";
import { CabecalhoDoLogin, CampoUsuario, ProvedoresSociais, RodapeDoLogin } from "./loginComum";

/* A etapa do usuário, antes da senha: é a primeira tela de login quando o realm tem
   Organizations ligado (o Keycloak descobre a organization pelo usuário). Mesmo
   design e mesmos textos por client do login.ftl -- inclusive os chips de "Entrar
   como" --, sem o campo de senha. Contrato do Keycloak preservado como no
   keycloakify/login/pages/LoginUsername: nomes de campo, ids, guarda de duplo POST e
   o bloco de WebAuthn conditional UI. Sem tabIndex positivo, como no Login. */
export default function LoginUsername(props: PageProps<Extract<KcContext, { pageId: "login-username.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { realm, url, usernameHidden, login, messagesPerField, enableWebAuthnConditionalUI, authenticators, message, isAppInitiatedAction } =
        kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({ webAuthnButtonId, kcContext, i18n });

    const hasFieldError = messagesPerField.existsError("username");

    const textos = textosDoLogin(kcContext, i18n);
    const { titulo, mascaraCpf, perfis, showRegistration, showLanguages } = textos;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
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
                                    erro={hasFieldError ? messagesPerField.getFirstError("username") : undefined}
                                />
                            )}

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

                            {/* Mesmo lugar do Login: logo acima do botão, e não junto do
                                erro do campo (senão a mensagem apareceria duplicada). */}
                            {!hasFieldError && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                                <Alert message={message} kcClsx={kcClsx} />
                            )}

                            <div id="kc-form-buttons">
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
