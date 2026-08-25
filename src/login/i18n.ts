/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        "pt-BR": {
            // --- Painel de marca (sem equivalente no kcContext) ---
            cvtBrandAlt: "Compliance Soluções",
            cvtBrandSubtitle: "Compliance HCM · Folha de pagamento",
            cvtBrandHeadline: "Seu RH, resolvido em poucos cliques.",
            cvtBrandLead:
                "Férias, ponto, holerites e vagas internas em um só lugar — 100% cloud, disponível quando você precisar.",
            // Os três números são afirmação pública de negócio, embutida no JAR do tema.
            // Se precisarem variar por ambiente, migrar para kcContext.properties
            // (KcEnvName no vite.config.ts) em vez de tradução.
            cvtStat1Value: "+1.200",
            cvtStat1Label: "colaboradores ativos",
            cvtStat2Value: "99,9%",
            cvtStat2Label: "de disponibilidade",
            cvtStat3Value: "ISO 27001",
            cvtStat3Label: "segurança certificada",
            cvtCopyright: "© 2026 Compliance Soluções · Todos os direitos reservados",

            // --- Página de login (variante "Departamento Pessoal" do mockup) ---
            // loginAccountTitle é a chave que o Keycloak usa como título de login.ftl;
            // sobrescrever aqui é o lugar certo para a copy da variante escolhida.
            loginAccountTitle: "Entrar na área do departamento pessoal",
            cvtLoginEyebrow: "Acesso profissional",
            cvtLoginLead: "Processos de folha, admissões e fechamento",
            cvtLoginIdLabel: "E-mail corporativo",
            cvtLoginIdPlaceholder: "nome@compliancesolucoes.com.br",
            cvtLoginFooterNote: "Acesso monitorado e registrado em log de auditoria.",
            cvtOr: "ou",

            // --- Lacuna do keycloakify ---
            // showPassword/hidePassword existem em messages_defaultSet/en.js e estão
            // AUSENTES de pt-BR.js. Sem estes dois, o aria-label do botão do olho sai
            // em inglês num realm pt-BR.
            showPassword: "Mostrar senha",
            hidePassword: "Ocultar senha"
        },
        en: {
            cvtBrandAlt: "Compliance Soluções",
            cvtBrandSubtitle: "Compliance HCM · Payroll",
            cvtBrandHeadline: "HR, sorted in a few clicks.",
            cvtBrandLead:
                "Time off, attendance, payslips and internal openings in one place — 100% cloud, available whenever you need it.",
            cvtStat1Value: "+1,200",
            cvtStat1Label: "active employees",
            cvtStat2Value: "99.9%",
            cvtStat2Label: "uptime",
            cvtStat3Value: "ISO 27001",
            cvtStat3Label: "certified security",
            cvtCopyright: "© 2026 Compliance Soluções · All rights reserved",

            loginAccountTitle: "Sign in to the payroll area",
            cvtLoginEyebrow: "Staff access",
            cvtLoginLead: "Payroll, onboarding and period close",
            cvtLoginIdLabel: "Work email",
            cvtLoginIdPlaceholder: "name@compliancesolucoes.com.br",
            cvtLoginFooterNote: "Access is monitored and recorded in the audit log.",
            cvtOr: "or",

            showPassword: "Show password",
            hidePassword: "Hide password"
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
