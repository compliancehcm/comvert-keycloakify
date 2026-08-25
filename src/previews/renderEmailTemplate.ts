/* Renderiza o template de e-mail para pré-visualização no Storybook.

   O template real é FreeMarker e só o Keycloak sabe processá-lo de verdade. Em vez
   de reescrever o layout em JSX -- que criaria uma segunda fonte de verdade fadada a
   divergir -- esta função importa o PRÓPRIO src/email/html/template.ftl como texto e
   resolve as poucas construções que ele usa: comentários, a macro, o <#nested> e as
   interpolações ${...}.

   Ou seja: se alguém mexer no template.ftl, a preview acompanha sozinha. O que ela
   NÃO faz é validar sintaxe de FreeMarker -- para isso serve o envio real, que é
   como o bug do ${.lang} apareceu. */

import templateFtl from "../email/html/template.ftl?raw";

type Vars = Record<string, string>;

export function renderEmailTemplate(params: { body: string; vars?: Vars }): string {
    const { body, vars = {} } = params;

    const values: Vars = {
        realmName: "Compliance HCM",
        ...vars
    };

    let html = templateFtl;

    // Comentários FreeMarker <#-- ... --> (inclusive multilinha)
    html = html.replace(/<#--[\s\S]*?-->/g, "");

    // A macro que envolve tudo: só queremos o corpo dela
    html = html.replace(/<#macro\s+emailLayout>/g, "").replace(/<\/#macro>/g, "");

    // O ponto onde cada e-mail injeta o próprio conteúdo
    html = html.replace(/<#nested>/g, body);

    // Interpolações. Uma chave desconhecida vira um marcador visível em vez de
    // desaparecer calada, senão a preview esconderia um erro de nome.
    html = html.replace(/\$\{([^}]+)\}/g, (_match, expr: string) => {
        const key = expr.trim();
        return key in values ? values[key] : `«${key}»`;
    });

    return html.trim();
}

/* Corpos de exemplo. São o texto que o Keycloak injeta via msg(...) nos templates
   de cada evento -- copiados do bundle pt-BR para a preview ficar realista. */
export const sampleBodies = {
    passwordReset: `
        <p>Alguém acabou de solicitar a alteração das credenciais da sua conta
        Compliance HCM. Se foi você, clique no link abaixo para redefini-las.</p>
        <p><a href="#">Redefinir minha senha</a></p>
        <p>Este link expira em 5 minutos.</p>
        <p>Se você não deseja redefinir suas credenciais, ignore esta mensagem e
        nada será alterado.</p>
    `,
    emailVerification: `
        <p>Alguém criou uma conta Compliance HCM com este endereço de e-mail. Se foi
        você, clique no link abaixo para confirmar seu endereço.</p>
        <p><a href="#">Confirmar meu e-mail</a></p>
        <p>Este link expira em 5 minutos.</p>
        <p>Se não foi você que criou esta conta, ignore esta mensagem.</p>
    `,
    executeActions: `
        <p>Um administrador solicitou que você atualize sua conta Compliance HCM com
        a(s) seguinte(s) etapa(s): Atualizar Senha. Clique no link abaixo para
        iniciar o processo.</p>
        <p><a href="#">Atualizar minha conta</a></p>
        <p>Este link expira em 5 minutos.</p>
    `,
    eventUpdatePassword: `
        <p>Sua senha foi alterada em 25/08/2026 15:42. Se não foi você, entre em
        contato com o departamento pessoal.</p>
    `
} satisfies Record<string, string>;
