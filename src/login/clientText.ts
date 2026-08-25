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

export const CLIENT_TEXT_KEYS = {
    eyebrow: `${PREFIX}eyebrow`,
    title: `${PREFIX}title`,
    lead: `${PREFIX}lead`,
    footerNote: `${PREFIX}footerNote`
} as const;

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
