import { clsx } from "keycloakify/tools/clsx";
import type { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { I18n } from "../i18n";

type KcClsx = ReturnType<typeof getKcClsx>["kcClsx"];

/* Seletor de idioma, compartilhado entre Template.tsx e pages/Login.tsx.

   O mockup traz três pílulas "Entrar como" (perfis), que não têm equivalente no
   Keycloak. A tentação era reaproveitar o desenho das pílulas para os idiomas, mas
   este tema habilita 30 locales: viraria uma parede de 30 chips. Dropdown escala.

   A classe "menu-button-links" é obrigatória: é por ela que o menu-button-links.js
   do Keycloak encontra o elemento e liga o comportamento de teclado. O estado
   FECHADO vem do CSS (.kcLocaleListClass{display:none}, sem !important — o script
   abre com style.display inline). */
export function LocaleDropdown(props: {
    i18n: I18n;
    kcClsx: KcClsx;
    className?: string;
}) {
    const { i18n, kcClsx, className } = props;
    const { msgStr, currentLanguage, enabledLanguages } = i18n;

    return (
        <div className={clsx(kcClsx("kcLocaleMainClass"), className)} id="kc-locale">
            <div id="kc-locale-wrapper" className={kcClsx("kcLocaleWrapperClass")}>
                <div
                    id="kc-locale-dropdown"
                    className={clsx("menu-button-links", kcClsx("kcLocaleDropDownClass"))}
                >
                    <button
                        id="kc-current-locale-link"
                        aria-label={msgStr("languages")}
                        aria-haspopup="true"
                        aria-expanded="false"
                        aria-controls="language-switch1"
                    >
                        {currentLanguage.label}
                    </button>
                    <ul
                        role="menu"
                        tabIndex={-1}
                        aria-labelledby="kc-current-locale-link"
                        aria-activedescendant=""
                        id="language-switch1"
                        className={kcClsx("kcLocaleListClass")}
                    >
                        {enabledLanguages.map(({ languageTag, label, href }, i) => (
                            <li
                                key={languageTag}
                                className={kcClsx("kcLocaleListItemClass")}
                                role="none"
                            >
                                <a
                                    role="menuitem"
                                    id={`language-${i + 1}`}
                                    className={kcClsx("kcLocaleItemClass")}
                                    href={href}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
