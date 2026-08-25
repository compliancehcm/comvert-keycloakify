import { useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { Alert } from "./components/Alert";
import { LocaleDropdown } from "./components/LocaleDropdown";
import { CLIENT_BRAND_KEYS, resolveClientText } from "./clientText";
import logoUrl from "./assets/logo-compliance-branco.png";

/** Páginas que se auto-submetem e nunca são realmente vistas: um painel de marketing
 *  ali não faz sentido. Recebem um shell mínimo. */
const BARE_SHELL_PAGE_IDS = new Set<string>(["saml-post-form.ftl"]);

/** Páginas de conteúdo largo (formulário de perfil, QR code, grade de códigos de
 *  recuperação, textarea): mantêm o split-screen, mas com a coluna mais larga, para
 *  o leiaute não esmagar o conteúdo. */
const WIDE_CONTENT_PAGE_IDS = new Set<string>([
    "register.ftl",
    "login-update-profile.ftl",
    "idp-review-user-profile.ftl",
    "login-config-totp.ftl",
    "login-recovery-authn-code-config.ftl",
    "login-oauth-grant.ftl",
    "code.ftl",
    "delete-credential.ftl",
    "webauthn-register.ftl",
    "webauthn-authenticate.ftl"
]);

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

    const { realm, auth, url, message, isAppInitiatedAction, pageId, client } = kcContext;

    /* Painel de marca: cada texto pode vir de um atributo do client, caindo no padrão
       do tema quando ausente. Ver src/login/clientText.ts e docs/atributos-do-client.md.

       Nota: o Template envolve as 36 páginas, e em algumas o `client` vem reduzido --
       error.ftl, por exemplo, declara apenas { baseUrl }. Nessas o painel cai no
       padrão do tema, que é o comportamento correto: melhor o texto institucional que
       um painel vazio. O resolveClientText já trata client/attributes ausentes. */
    const marca = (key: string, fallback: string) =>
        resolveClientText({
            client,
            key,
            languageTag: currentLanguage.languageTag,
            fallback
        });

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", realm.displayName);
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    const isLoginPage = pageId === "login.ftl";

    /* O login desenha o próprio cabeçalho e o próprio alerta, na posição que o
       design pede (o erro fica logo acima do botão, não no topo). */
    const content = (
        <>
            {!isLoginPage && (
                <header>
                    {enabledLanguages.length > 1 && <LocaleDropdown {...{ i18n, kcClsx }} />}
                    {(() => {
                        const node = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                            <h1 id="kc-page-title" className="cvt-page__title">
                                {headerNode}
                            </h1>
                        ) : (
                            <div id="kc-username" className={kcClsx("kcFormGroupClass")}>
                                <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                                <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                                    <div className="kc-login-tooltip">
                                        <i className={kcClsx("kcResetFlowIcon")}></i>
                                        <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                    </div>
                                </a>
                            </div>
                        );

                        if (displayRequiredFields) {
                            return (
                                <div className={kcClsx("kcContentWrapperClass")}>
                                    <div className={clsx(kcClsx("kcLabelWrapperClass"), "subtitle")}>
                                        <span className="subtitle">
                                            <span className="required">*</span>
                                            {msg("requiredFields")}
                                        </span>
                                    </div>
                                    <div>{node}</div>
                                </div>
                            );
                        }

                        return node;
                    })()}
                </header>
            )}
            <div id="kc-content" className={isLoginPage ? undefined : "cvt-page__body"}>
                <div id="kc-content-wrapper">
                    {/* Ações iniciadas pela aplicação não devem mostrar o aviso de "conclua a ação". */}
                    {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                        <Alert {...{ message, kcClsx }} />
                    )}
                    {children}
                    {auth !== undefined && auth.showTryAnotherWayLink && (
                        <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                            <div className={kcClsx("kcFormGroupClass")}>
                                <input type="hidden" name="tryAnotherWay" value="on" />
                                <a
                                    href="#"
                                    id="try-another-way"
                                    onClick={() => {
                                        document.forms["kc-select-try-another-way-form" as never].submit();
                                        return false;
                                    }}
                                >
                                    {msg("doTryAnotherWay")}
                                </a>
                            </div>
                        </form>
                    )}
                    {socialProvidersNode}
                    {displayInfo && (
                        <div id="kc-info" className={kcClsx("kcSignUpClass")}>
                            <div id="kc-info-wrapper" className={kcClsx("kcInfoAreaWrapperClass")}>
                                {infoNode}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    if (BARE_SHELL_PAGE_IDS.has(pageId)) {
        return (
            <div className={clsx("cvt-bare", kcClsx("kcLoginClass"))}>
                <div className="cvt-split__inner">{content}</div>
            </div>
        );
    }

    return (
        <div className={clsx("cvt-split", kcClsx("kcLoginClass"))}>
            <section className="cvt-split__brand">
                <div className="cvt-blob cvt-blob--top" aria-hidden="true"></div>
                <div className="cvt-blob cvt-blob--bottom" aria-hidden="true"></div>
                <div id="kc-header" className={clsx("cvt-brand__header", kcClsx("kcHeaderClass"))}>
                    <div id="kc-header-wrapper" className={kcClsx("kcHeaderWrapperClass")}>
                        <img className="cvt-brand__logo" src={logoUrl} alt={msgStr("cvtBrandAlt")} />
                    </div>
                    <div className="cvt-brand__subtitle">{marca(CLIENT_BRAND_KEYS.subtitle, msgStr("cvtBrandSubtitle"))}</div>
                </div>
                <div className="cvt-brand__body">
                    <div className="cvt-rule" aria-hidden="true"></div>
                    <h2 className="cvt-brand__headline">{marca(CLIENT_BRAND_KEYS.headline, msgStr("cvtBrandHeadline"))}</h2>
                    <p className="cvt-brand__lead">{marca(CLIENT_BRAND_KEYS.lead, msgStr("cvtBrandLead"))}</p>
                    <div className="cvt-stats">
                        <div className="cvt-stat">
                            <div className="cvt-stat__value">{marca(CLIENT_BRAND_KEYS.stat1Value, msgStr("cvtStat1Value"))}</div>
                            <div className="cvt-stat__label">{marca(CLIENT_BRAND_KEYS.stat1Label, msgStr("cvtStat1Label"))}</div>
                        </div>
                        <div className="cvt-stat">
                            <div className="cvt-stat__value">{marca(CLIENT_BRAND_KEYS.stat2Value, msgStr("cvtStat2Value"))}</div>
                            <div className="cvt-stat__label">{marca(CLIENT_BRAND_KEYS.stat2Label, msgStr("cvtStat2Label"))}</div>
                        </div>
                        <div className="cvt-stat">
                            <div className="cvt-stat__value">{marca(CLIENT_BRAND_KEYS.stat3Value, msgStr("cvtStat3Value"))}</div>
                            <div className="cvt-stat__label">{marca(CLIENT_BRAND_KEYS.stat3Label, msgStr("cvtStat3Label"))}</div>
                        </div>
                    </div>
                </div>
                <div className="cvt-brand__footer">{marca(CLIENT_BRAND_KEYS.copyright, msgStr("cvtCopyright"))}</div>
            </section>
            <section className="cvt-split__form">
                <div className={clsx("cvt-split__inner", WIDE_CONTENT_PAGE_IDS.has(pageId) && "cvt-split__inner--wide")}>{content}</div>
            </section>
        </div>
    );
}
