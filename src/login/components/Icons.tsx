/* Ícones Lucide inline.
   Com doUseDefaultCss={false} não há FontAwesome nem pficon carregados, então os
   ícones do Keycloak precisam vir do markup. Convenção do design system: viewBox
   24x24, fill none, stroke currentColor, stroke-width 2, cantos e junções redondos.

   Arquivo separado de propósito: assim Login.tsx e Template.tsx exportam apenas o
   componente, e a regra react-refresh/only-export-components nunca dispara. */

type IconProps = {
    size?: number;
    className?: string;
};

function svgProps(size: number) {
    return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        "aria-hidden": true,
        focusable: false
    };
}

export function EyeIcon({ size = 18, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export function EyeOffIcon({ size = 18, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
            <path d="m3 3 18 18" />
        </svg>
    );
}

export function MonitorIcon({ size = 18, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 18v3" />
        </svg>
    );
}

export function AlertCircleIcon({ size = 16, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

export function InfoIcon({ size = 16, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}

export function CheckIcon({ size = 16, className }: IconProps) {
    return (
        <svg {...svgProps(size)} className={className}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
