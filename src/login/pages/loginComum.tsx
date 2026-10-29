import type { FormEvent } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { clsx } from "keycloakify/tools/clsx";
import type { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { I18n } from "../i18n";
import { MonitorIcon } from "../components/Icons";
import { LocaleDropdown } from "../components/LocaleDropdown";
import type { ClientProfile } from "../clientText";
import { formatarCpf } from "../cpf";
import type { KcContextDoLogin, textosDoLogin } from "../textosDoLogin";

/* Os componentes da tela de login e da etapa do usuário (ver src/login/textosDoLogin.ts). */

type KcClsx = ReturnType<typeof getKcClsx>["kcClsx"];

/** A linha âmbar, e o título com a linha de apoio -- ou o usuário já identificado. */
export function CabecalhoDoLogin(props: { kcContext: KcContextDoLogin; i18n: I18n; eyebrow: string; titulo: string; lead: string }) {
    const { kcContext, i18n, eyebrow, titulo, lead } = props;
    const { auth, url } = kcContext;
    const { msg, msgStr } = i18n;

    return (
        <>
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
        </>
    );
}

/** O campo de usuário, com a máscara de CPF quando o client pede. */
export function CampoUsuario(props: {
    kcClsx: KcClsx;
    rotulo: string;
    exemplo: string;
    mascaraCpf: boolean;
    valorInicial: string;
    autoComplete: string;
    erro: string | undefined;
}) {
    const { kcClsx, rotulo, exemplo, mascaraCpf, valorInicial, autoComplete, erro } = props;

    return (
        <div className={kcClsx("kcFormGroupClass")}>
            <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                {rotulo}
            </label>
            <input
                id="username"
                className={kcClsx("kcInputClass")}
                name="username"
                defaultValue={mascaraCpf ? formatarCpf(valorInicial) : valorInicial}
                type="text"
                placeholder={exemplo || undefined}
                {...(mascaraCpf && {
                    inputMode: "numeric" as const,
                    maxLength: 14,
                    onInput: (evento: FormEvent<HTMLInputElement>) => {
                        evento.currentTarget.value = formatarCpf(evento.currentTarget.value);
                    }
                })}
                autoFocus
                autoComplete={autoComplete}
                aria-invalid={erro !== undefined}
                aria-describedby={erro !== undefined ? "input-error" : undefined}
            />
            {erro !== undefined && (
                <span
                    id="input-error"
                    className={kcClsx("kcInputErrorMessageClass")}
                    aria-live="polite"
                    dangerouslySetInnerHTML={{ __html: kcSanitize(erro) }}
                />
            )}
        </div>
    );
}

/** O rodapé: os chips de "Entrar como", o idioma, o cadastro e a nota. */
export function RodapeDoLogin(props: {
    i18n: I18n;
    kcClsx: KcClsx;
    perfis: ClientProfile[];
    showLanguages: boolean;
    showRegistration: boolean;
    registrationUrl: string;
    notaRodape: string;
}) {
    const { i18n, kcClsx, perfis, showLanguages, showRegistration, registrationUrl, notaRodape } = props;
    const { msg, msgStr } = i18n;

    return (
        <div className="cvt-login__footer">
            {perfis.length !== 0 && (
                <nav className="cvt-profiles" aria-label={msgStr("cvtSignInAs")}>
                    <span className="cvt-profiles__label">{msg("cvtSignInAs")}</span>
                    <ul className="cvt-profiles__list">
                        {perfis.map(perfil => (
                            <li key={perfil.url}>
                                {perfil.current ? (
                                    <span className="cvt-profiles__chip cvt-profiles__chip--current" aria-current="page">
                                        {perfil.label}
                                    </span>
                                ) : (
                                    <a className="cvt-profiles__chip" href={perfil.url}>
                                        {perfil.label}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
            {showLanguages && <LocaleDropdown i18n={i18n} kcClsx={kcClsx} className="cvt-login__locale" />}
            {showRegistration && (
                <div id="kc-registration-container">
                    <div id="kc-registration">
                        <span>
                            {msg("noAccount")} <a href={registrationUrl}>{msg("doRegister")}</a>
                        </span>
                    </div>
                </div>
            )}
            <div className="cvt-login__note">{notaRodape}</div>
        </div>
    );
}

/** Os provedores de identidade externos, depois do divisor "ou". */
export function ProvedoresSociais(props: { i18n: I18n; kcClsx: KcClsx; providers: ReturnType<typeof textosDoLogin>["socialProviders"] }) {
    const { i18n, kcClsx, providers } = props;
    const { msg } = i18n;

    if (providers.length === 0) {
        return null;
    }

    return (
        <div id="kc-social-providers" className={clsx("cvt-login__social", kcClsx("kcFormSocialAccountSectionClass"))}>
            <div className="cvt-divider">
                <span className="cvt-divider__line" aria-hidden="true"></span>
                <span className="cvt-divider__label">{msg("cvtOr")}</span>
                <span className="cvt-divider__line" aria-hidden="true"></span>
            </div>
            <h2 className={kcClsx("kcSrOnlyClass")}>{msg("identity-provider-login-label")}</h2>
            <ul className={kcClsx("kcFormSocialAccountListClass", providers.length > 3 && "kcFormSocialAccountListGridClass")}>
                {providers.map(p => (
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
    );
}
