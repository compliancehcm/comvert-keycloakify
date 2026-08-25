import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { AlertCircleIcon, CheckIcon, InfoIcon } from "./Icons";

export type KcMessage = {
    type: "success" | "warning" | "error" | "info";
    summary: string;
};

type KcClsx = ReturnType<typeof getKcClsx>["kcClsx"];

/* Compartilhado entre Template.tsx e pages/Login.tsx: o Template desenha o alerta no
   topo do conteúdo, mas o design da tela de login o quer logo acima do botão Entrar,
   então o Login passa displayMessage={false} e renderiza este mesmo componente na
   posição correta. Um componente só evita as duas marcações divergirem. */
export function Alert(props: { message: KcMessage; kcClsx: KcClsx; className?: string }) {
    const { message, kcClsx, className } = props;

    const isAssertive = message.type === "error" || message.type === "warning";

    return (
        <div
            className={clsx(`alert-${message.type}`, kcClsx("kcAlertClass"), className)}
            role={isAssertive ? "alert" : "status"}
        >
            {message.type === "success" && <CheckIcon />}
            {message.type === "warning" && <AlertCircleIcon />}
            {message.type === "error" && <AlertCircleIcon />}
            {message.type === "info" && <InfoIcon />}
            <span
                className={kcClsx("kcAlertTitleClass")}
                dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
            />
        </div>
    );
}
