/* Textos da tela de login sobrescritos por client.

   O Keycloak expõe `kcContext.client.attributes` -- um Record<string, string> de
   atributos arbitrários, verificado num Keycloak 26.7 real: os atributos definidos
   no client chegam intactos ao kcContext da página de login.

   Sobre client.name e client.description, que seriam editáveis pela interface do
   admin: os dois são reaproveitados pelo Keycloak em OUTROS lugares -- o `name`
   aparece na tela de consentimento (LoginOauthGrant monta "Conceder acesso a
   {name}"), no FrontchannelLogout e na lista "Aplicativos" do console de account;
   o `description` também aparece em Aplicativos.

   Isso NÃO impede usar o `name` como título da tela de login, desde que o título
   seja o nome da aplicação ("Portal do Departamento Pessoal"): aí o mesmo texto
   está correto nos dois lugares. É por isso que o título tem uma camada
   intermediária em client.name -- ganha-se edição pela interface sem quebrar nada.
   O que quebraria seria pôr uma frase de ação ali ("Entrar na área do departamento
   pessoal"), que faria o consentimento dizer "Conceder acesso a Entrar na área do
   departamento pessoal".

   Já o `description` fica fora de propósito: a linha de apoio da tela de login é
   copy de interface, e a descrição do client é metadado da aplicação. Reaproveitar
   uma como a outra amarra dois textos com propósitos diferentes.

   Duas limitações a ter em mente:
   - atributo de client NÃO é localizado. Você recebe uma string só. Para variar por
     idioma, o lugar certo continua sendo o bundle de i18n -- ou uma convenção de
     chave por idioma, com CHAVES.<tag>, que esta função suporta.
   - tudo em client.attributes fica visível no HTML da página de login para quem
     acessá-la. Nada sensível aqui.

   Não existe aba de Attributes para clients no admin console (só Settings, Roles,
   Client scopes, Sessions, Advanced, Events), então estes atributos se definem por
   Admin REST API ou import de realm JSON. */

/** Prefixo de todos os atributos que este tema lê, para não colidir com os
 *  atributos que o próprio Keycloak guarda no mesmo mapa. */
const PREFIX = "cvt.";

/** Coluna do formulário (direita). Só a página de login usa estes. */
export const CLIENT_TEXT_KEYS = {
    eyebrow: `${PREFIX}eyebrow`,
    title: `${PREFIX}title`,
    lead: `${PREFIX}lead`,
    footerNote: `${PREFIX}footerNote`
} as const;

/** Painel de marca (esquerda). Renderizado pelo Template, portanto vale para TODAS
 *  as páginas de autenticação, não só o login. */
export const CLIENT_BRAND_KEYS = {
    subtitle: `${PREFIX}brand.subtitle`,
    headline: `${PREFIX}brand.headline`,
    lead: `${PREFIX}brand.lead`,
    stat1Value: `${PREFIX}brand.stat1Value`,
    stat1Label: `${PREFIX}brand.stat1Label`,
    stat2Value: `${PREFIX}brand.stat2Value`,
    stat2Label: `${PREFIX}brand.stat2Label`,
    stat3Value: `${PREFIX}brand.stat3Value`,
    stat3Label: `${PREFIX}brand.stat3Label`,
    copyright: `${PREFIX}brand.copyright`
} as const;

/** Comportamento da página de login por client: o campo de usuário, o link de
 *  "Esqueci minha senha" e os perfis de "Entrar como". Mesma regra dos textos:
 *  ausente, vazio ou inválido, vale o padrão do tema. */
export const CLIENT_LOGIN_KEYS = {
    /** Rótulo do campo de usuário (ex.: "CPF"). Texto: aceita a variante por idioma. */
    usernameLabel: `${PREFIX}usernameLabel`,
    /** Exemplo dentro do campo (ex.: "000.000.000-00"). Texto: aceita a variante por idioma. */
    usernamePlaceholder: `${PREFIX}usernamePlaceholder`,
    /** Máscara do campo. Só `cpf`: formata 000.000.000-00 e envia só os dígitos. */
    usernameMask: `${PREFIX}usernameMask`,
    /** Endereço do "Esqueci minha senha" fora do Keycloak (a aplicação trata). */
    forgotPasswordUrl: `${PREFIX}forgotPasswordUrl`,
    /** JSON com os perfis de "Entrar como": [{"label","url","current"?}]. */
    profiles: `${PREFIX}profiles`
} as const;

/** Um perfil de "Entrar como": cada um é uma tela de login (um client). */
export type ClientProfile = {
    label: string;
    url: string;
    /** O perfil desta tela: aparece marcado, sem link. */
    current: boolean;
};

type ClientLike = {
    attributes?: Record<string, string>;
};

/**
 * Resolve o campo Name do client, tratando-o como chave de mensagem SOMENTE quando
 * vem na forma `${chave}`.
 *
 * O advancedMsgStr do keycloakify resolve chave com ou sem as chaves -- por design,
 * documentado: advancedMsgStr("access-denied") === advancedMsgStr("${access-denied}").
 * Num campo de texto livre como o nome do client isso vira armadilha: verificado num
 * Keycloak real, um client chamado literalmente "email" renderizava "Endereço de
 * e-mail", porque `email` é chave do bundle. Nomes como "password", "username" ou
 * "email" são plausíveis e o admin não tem como saber que colidem.
 *
 * Exigindo `${...}` explícito, a localização continua disponível para quem a quer e
 * um nome comum nunca é reinterpretado.
 */
export function resolveClientName(params: {
    name: string | undefined;
    advancedMsgStr: (key: string) => string;
}): string | undefined {
    const { name, advancedMsgStr } = params;

    if (name === undefined || name.trim() === "") {
        return undefined;
    }

    const match = /^\$\{(.+)\}$/.exec(name.trim());

    return match === null ? name : advancedMsgStr(match[1]);
}

/**
 * Resolve um texto na ordem: atributo do client para o idioma atual, atributo
 * genérico do client, e por último o padrão do tema (i18n).
 *
 * A variante por idioma usa a própria chave sufixada com a tag de idioma, então
 * `cvt.title` e `cvt.title.en` convivem:
 *
 *   cvt.title      -> "Entrar na área do departamento pessoal"
 *   cvt.title.en   -> "Sign in to the payroll area"
 *
 * Atributo vazio ou só com espaços conta como ausente: um campo em branco no
 * client não deve apagar o texto da tela.
 */
export function resolveClientText(params: {
    client: ClientLike | undefined;
    key: string;
    languageTag: string;
    fallback: string;
}): string {
    const { client, key, languageTag, fallback } = params;

    const attributes = client?.attributes;

    if (attributes === undefined) {
        return fallback;
    }

    for (const candidate of [`${key}.${languageTag}`, key]) {
        const value = attributes[candidate];

        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }
    }

    return fallback;
}

/** Só http(s): o atributo vira `href`, e `javascript:` ali seria script na tela de login. */
function urlSegura(valor: unknown): string | undefined {
    if (typeof valor !== "string") {
        return undefined;
    }
    try {
        const url = new URL(valor.trim());
        return url.protocol === "https:" || url.protocol === "http:"
            ? url.href
            : undefined;
    } catch {
        return undefined;
    }
}

/** Atributo de endereço do client, validado; `undefined` se ausente ou inválido. */
export function resolveClientUrl(params: {
    client: ClientLike | undefined;
    key: string;
}): string | undefined {
    const { client, key } = params;
    return urlSegura(client?.attributes?.[key]);
}

/**
 * Os perfis de "Entrar como", do JSON em `cvt.profiles`. Entrada sem `label` ou
 * com `url` inválida é descartada; JSON ilegível vira lista vazia (a tela segue
 * sem os perfis, em vez de quebrar o login inteiro por um erro de configuração).
 */
export function resolveClientProfiles(client: ClientLike | undefined): ClientProfile[] {
    const bruto = client?.attributes?.[CLIENT_LOGIN_KEYS.profiles];
    if (typeof bruto !== "string" || bruto.trim() === "") {
        return [];
    }

    let lista: unknown;
    try {
        lista = JSON.parse(bruto);
    } catch {
        return [];
    }
    if (!Array.isArray(lista)) {
        return [];
    }

    return lista.flatMap((item): ClientProfile[] => {
        if (typeof item !== "object" || item === null) {
            return [];
        }
        const { label, url, current } = item as Record<string, unknown>;
        const href = urlSegura(url);
        if (typeof label !== "string" || label.trim() === "" || href === undefined) {
            return [];
        }
        return [{ label: label.trim(), url: href, current: current === true }];
    });
}
