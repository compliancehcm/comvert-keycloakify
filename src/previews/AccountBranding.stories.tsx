import type { Meta, StoryObj } from "../kc.gen";

/* Pré-visualização da MARCA aplicada à Account Console.

   Seja explícito sobre o que isto é e o que não é:

   NÃO é a Account Console. Aquela é um SPA que precisa de token OIDC e da API REST
   do Keycloak para desenhar qualquer coisa; fora de um servidor real ela não passa
   do spinner. Para ver a console de verdade, subir o Keycloak com o JAR montado.

   É o CSS de marca -- src/account/brand.css, o mesmo arquivo que vai para o JAR --
   aplicado sobre componentes reais do PatternFly v5. Serve para conferir a paleta,
   o masthead, a régua âmbar, os botões, os campos e os alertas sem depender de um
   servidor. Se a marca estiver errada aqui, está errada na console.

   Roda num iframe para o CSS do PatternFly (1,5 MB de regras globais, incluindo
   estilos de body) não vazar para as outras stories -- exatamente o problema que
   nos fez tirar o PatternFly do tema de login. */

import patternflyCssUrl from "@patternfly/patternfly/patternfly.min.css?url";
import brandCssUrl from "../account/brand.css?url";

const MARKUP = /* html */ `
<div class="pf-v5-c-page">

  <header class="pf-v5-c-masthead">
    <div class="pf-v5-c-masthead__main">
      <span class="pf-v5-c-masthead__brand" style="font-weight:700; letter-spacing:-0.02em; font-size:18px;">
        Compliance HCM
      </span>
    </div>
    <div class="pf-v5-c-masthead__content" style="margin-left:auto;">
      <span style="font-size:14px;">teste.dp</span>
    </div>
  </header>

  <div class="pf-v5-c-page__sidebar" style="position:static; grid-area:auto; transform:none;">
    <div class="pf-v5-c-page__sidebar-body">
      <nav class="pf-v5-c-nav">
        <ul class="pf-v5-c-nav__list">
          <li class="pf-v5-c-nav__item">
            <a class="pf-v5-c-nav__link pf-m-current" href="#" aria-current="page">Informações pessoais</a>
          </li>
          <!-- Grupo expansível, como na navegação real do console: "Segurança da
               conta" é um <button> com um subnav aninhado, não um link simples.
               A preview precisa da mesma estrutura, senão não exercita o divisor
               do primeiro filho do grupo. -->
          <li class="pf-v5-c-nav__item pf-m-expandable pf-m-expanded">
            <button class="pf-v5-c-nav__link" type="button" aria-expanded="true">
              Segurança da conta
              <span class="pf-v5-c-nav__toggle"></span>
            </button>
            <section class="pf-v5-c-nav__subnav">
              <ul class="pf-v5-c-nav__list">
                <li class="pf-v5-c-nav__item">
                  <a class="pf-v5-c-nav__link" href="#">Entrando</a>
                </li>
                <li class="pf-v5-c-nav__item">
                  <a class="pf-v5-c-nav__link" href="#">Atividade do dispositivo</a>
                </li>
              </ul>
            </section>
          </li>
          <li class="pf-v5-c-nav__item">
            <a class="pf-v5-c-nav__link" href="#">Aplicativos</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <main class="pf-v5-c-page__main" style="padding:24px;">

    <h1 class="pf-v5-c-title pf-m-2xl" style="margin-bottom:4px;">Informações pessoais</h1>
    <p class="pf-v5-u-color-200" style="margin:0 0 24px;">Gerencie suas informações básicas</p>

    <div class="pf-v5-c-card" style="margin-bottom:24px;">
      <div class="pf-v5-c-card__title"><h2 class="pf-v5-c-title pf-m-lg">Geral</h2></div>
      <div class="pf-v5-c-card__body">

        <div class="pf-v5-c-form__group" style="margin-bottom:16px;">
          <label class="pf-v5-c-form__label" for="p-username">
            <span class="pf-v5-c-form__label-text">Nome de usuário</span>
            <span class="pf-v5-c-form__label-required" aria-hidden="true">&nbsp;*</span>
          </label>
          <input class="pf-v5-c-form-control" id="p-username" type="text" value="teste.dp" readonly>
        </div>

        <div class="pf-v5-c-form__group" style="margin-bottom:16px;">
          <label class="pf-v5-c-form__label" for="p-email">
            <span class="pf-v5-c-form__label-text">E-mail</span>
          </label>
          <input class="pf-v5-c-form-control" id="p-email" type="text" value="teste.dp@compliancesolucoes.com.br">
        </div>

        <div class="pf-v5-c-form__group">
          <label class="pf-v5-c-form__label" for="p-first">
            <span class="pf-v5-c-form__label-text">Primeiro nome</span>
          </label>
          <input class="pf-v5-c-form-control" id="p-first" type="text" placeholder="Maria">
        </div>

      </div>
      <div class="pf-v5-c-card__footer">
        <button class="pf-v5-c-button pf-m-primary" type="button">Salvar</button>
        <button class="pf-v5-c-button pf-m-link" type="button">Cancelar</button>
      </div>
    </div>

    <div class="pf-v5-c-card" style="margin-bottom:24px;">
      <div class="pf-v5-c-card__title"><h2 class="pf-v5-c-title pf-m-lg">Botões e estados</h2></div>
      <div class="pf-v5-c-card__body">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
          <button class="pf-v5-c-button pf-m-primary" type="button">Primário</button>
          <button class="pf-v5-c-button pf-m-secondary" type="button">Secundário</button>
          <button class="pf-v5-c-button pf-m-tertiary" type="button">Terciário</button>
          <button class="pf-v5-c-button pf-m-link" type="button">Link</button>
          <button class="pf-v5-c-button pf-m-primary" type="button" disabled>Desabilitado</button>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <span class="pf-v5-c-label pf-m-blue"><span class="pf-v5-c-label__content">Informação</span></span>
          <span class="pf-v5-c-label pf-m-green"><span class="pf-v5-c-label__content">Sucesso</span></span>
          <span class="pf-v5-c-label pf-m-orange"><span class="pf-v5-c-label__content">Atenção</span></span>
          <span class="pf-v5-c-label pf-m-red"><span class="pf-v5-c-label__content">Erro</span></span>
        </div>
      </div>
    </div>

    <div class="pf-v5-c-alert pf-m-danger" style="margin-bottom:12px;">
      <div class="pf-v5-c-alert__title">Não foi possível salvar as alterações.</div>
    </div>
    <div class="pf-v5-c-alert pf-m-success" style="margin-bottom:12px;">
      <div class="pf-v5-c-alert__title">Informações atualizadas.</div>
    </div>
    <div class="pf-v5-c-alert pf-m-warning" style="margin-bottom:12px;">
      <div class="pf-v5-c-alert__title">Autenticação em duas etapas não configurada.</div>
    </div>
    <div class="pf-v5-c-alert pf-m-info">
      <div class="pf-v5-c-alert__title">Sua sessão expira em 5 minutos.</div>
    </div>

  </main>
</div>
`;

function AccountBrandingPreview(props: { comMarca?: boolean }) {
    const { comMarca = true } = props;

    const srcDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="${patternflyCssUrl}">
  ${comMarca ? `<link rel="stylesheet" href="${brandCssUrl}">` : ""}
  <style>body { margin: 0; }</style>
</head>
<body class="pf-v5-c-page__body">${MARKUP}</body>
</html>`;

    return (
        <iframe
            title={
                comMarca
                    ? "Account com a marca Compliance"
                    : "Account no PatternFly padrão"
            }
            srcDoc={srcDoc}
            style={{
                width: "100%",
                height: 900,
                border: "1px solid #e0e5f0",
                borderRadius: 8,
                display: "block"
            }}
        />
    );
}

const meta = {
    title: "account/marca",
    component: AccountBrandingPreview
} satisfies Meta<typeof AccountBrandingPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Com src/account/brand.css aplicado: é assim que a console fica. */
export const ComMarca: Story = {
    render: () => <AccountBrandingPreview comMarca />
};

/** Sem o brand.css, para comparar: o PatternFly padrão (azul Red Hat). */
export const PatternFlyPadrao: Story = {
    render: () => <AccountBrandingPreview comMarca={false} />
};
