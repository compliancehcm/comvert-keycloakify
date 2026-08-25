import { useState } from "react";
import type { I18n } from "../i18n";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icons";
import {
    nextThemePreference,
    readThemePreference,
    setThemePreference,
    type ThemePreference
} from "../themePreference";

/* Botão discreto de tema, ciclando sistema -> claro -> escuro.

   Por que um botão que cicla e não três botões: o pedido era algo bem delicado, e
   três alvos numa tela cuja tarefa é digitar uma senha competem com o formulário.
   O custo é descoberta: um controle que cicla não anuncia sozinho os três estados.
   Compensado no rótulo, que sempre diz o estado atual, e no live region abaixo, que
   anuncia a mudança para leitor de tela.

   Não renderize este componente quando kcContext.darkMode === false: nesse caso o
   admin desligou o escuro no realm e não há escolha a oferecer. */

const ICONS: Record<ThemePreference, typeof SunIcon> = {
    sistema: MonitorIcon,
    claro: SunIcon,
    escuro: MoonIcon
};

const LABEL_KEYS = {
    sistema: "cvtThemeSystem",
    claro: "cvtThemeLight",
    escuro: "cvtThemeDark"
} as const;

export function ThemeToggle(props: { i18n: I18n; className?: string }) {
    const { i18n, className } = props;
    const { msgStr } = i18n;

    const [preference, setPreference] = useState<ThemePreference>(readThemePreference);

    const Icon = ICONS[preference];
    const rotuloAtual = msgStr(LABEL_KEYS[preference]);

    return (
        <>
            <button
                type="button"
                className={className}
                onClick={() => {
                    const proximo = nextThemePreference(preference);
                    setThemePreference(proximo);
                    setPreference(proximo);
                }}
                /* O nome acessível diz o estado atual, não a ação: é o que permite a
                   quem chega pelo teclado saber em que tema está. */
                aria-label={`${msgStr("cvtThemeToggle")}: ${rotuloAtual}`}
                title={rotuloAtual}
            >
                <Icon size={16} />
            </button>
            {/* Sem isto, quem usa leitor de tela clica e não recebe confirmação --
                o ícone muda mas o foco não sai do botão. */}
            <span aria-live="polite" className="kcSrOnlyClass">
                {rotuloAtual}
            </span>
        </>
    );
}
