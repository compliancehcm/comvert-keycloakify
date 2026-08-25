# Textos do tema por client

O tema tem textos padrão (definidos em [`src/login/i18n.ts`](../src/login/i18n.ts)) e permite que **cada client sobrescreva** os que quiser, sem rebuild do tema.

Um client que não define nada continua exibindo os padrões. Nenhum client existente muda de comportamento ao se adotar isto.

## Como funciona

O Keycloak expõe `kcContext.client.attributes` na página de login — um mapa livre de `string -> string` que você define por client. O tema lê as chaves com prefixo `cvt.` e cai no padrão quando a chave está ausente, vazia ou só com espaços.

Ordem de resolução de cada texto:

1. `cvt.<campo>.<idioma>` — ex. `cvt.eyebrow.en`
2. `cvt.<campo>` — genérico, vale para todos os idiomas
3. só o título: o campo **Name** do client
4. o padrão do tema, no bundle de i18n

## Atributos

### Coluna do formulário (direita) — só na página de login

| Atributo         | O que controla                              | Padrão do tema                                        |
| ---------------- | ------------------------------------------- | ----------------------------------------------------- |
| `cvt.eyebrow`    | A linha em maiúsculas âmbar acima do título | `Acesso profissional`                                 |
| `cvt.title`      | O `<h1>` da tela                            | `Entrar na área do departamento pessoal`              |
| `cvt.lead`       | A linha de apoio sob o título               | `Processos de folha, admissões e fechamento`          |
| `cvt.footerNote` | A nota no rodapé, sob o link de cadastro    | `Acesso monitorado e registrado em log de auditoria.` |

### Painel de marca (esquerda) — vale para **todas** as páginas de autenticação

| Atributo               | O que controla              | Padrão do tema                                              |
| ---------------------- | --------------------------- | ----------------------------------------------------------- |
| `cvt.brand.subtitle`   | A linha logo abaixo do logo | `Compliance HCM · Folha de pagamento`                       |
| `cvt.brand.headline`   | O título grande do painel   | `Seu RH, resolvido em poucos cliques.`                      |
| `cvt.brand.lead`       | O parágrafo sob o título    | `Férias, ponto, holerites e vagas internas...`              |
| `cvt.brand.stat1Value` | O número do 1º bloco        | `+1.200`                                                    |
| `cvt.brand.stat1Label` | A legenda do 1º bloco       | `colaboradores ativos`                                      |
| `cvt.brand.stat2Value` | O número do 2º bloco        | `99,9%`                                                     |
| `cvt.brand.stat2Label` | A legenda do 2º bloco       | `de disponibilidade`                                        |
| `cvt.brand.stat3Value` | O número do 3º bloco        | `ISO 27001`                                                 |
| `cvt.brand.stat3Label` | A legenda do 3º bloco       | `segurança certificada`                                     |
| `cvt.brand.copyright`  | A linha no pé do painel     | `© 2026 Compliance Soluções · Todos os direitos reservados` |

> O painel esquerdo é renderizado pelo Template, que envolve as 36 páginas de autenticação — o texto sobrescrito aparece também em "esqueci a senha", OTP, cadastro etc.
>
> Exceção: em algumas páginas o Keycloak entrega o `client` reduzido (a `error.ftl`, por exemplo, só traz `baseUrl`). Nessas o painel cai no padrão do tema.
>
> O painel é escondido abaixo de 900px de largura, então em celular esses textos não aparecem.

## Variação por idioma

Atributo de client **não é traduzido** pelo Keycloak — é uma string só. Para variar por idioma, sufixe a chave com a tag do locale:

```
cvt.eyebrow        -> Acesso da folha        (usado em pt-BR e em qualquer idioma sem variante)
cvt.eyebrow.en     -> Payroll access         (usado quando o idioma da tela é en)
```

A tag tem de casar exatamente com a do Keycloak (`pt-BR`, `en`, `es`...).

Alternativa, se você mantém muitos idiomas: em vez de atributos, use o campo **Name** com `${chave}` (ver abaixo) ou adicione a chave no bundle do tema.

## O título e o campo Name

O `<h1>` tem uma camada extra: se não houver `cvt.title`, o tema usa o campo **Name** do client. É a única via **editável pela interface do admin** (Client → Settings → Name).

Isso é correto porque o título da tela é o nome da aplicação — o mesmo texto fica certo na tela de login, na tela de consentimento ("Conceder acesso a ...") e na lista Aplicativos do console de account.

O Name aceita chave de mensagem para ficar localizado:

```
Name = ${cvtPortalDp}
```

e no bundle do tema (`src/login/i18n.ts`):

```ts
"pt-BR": { cvtPortalDp: "Portal do Departamento Pessoal" },
en:      { cvtPortalDp: "Payroll Portal" }
```

> **Só a forma `${chave}` é interpretada.** Um Name comum é usado literalmente. Isso é uma proteção deliberada do tema: o `advancedMsgStr` do Keycloakify resolve chave com ou sem as chaves, e sem essa proteção um client chamado literalmente `email` exibia o título **"Endereço de e-mail"**, porque `email` é chave do bundle.

## Como definir os atributos

Não existe aba de Attributes para clients no admin console (as abas são Settings, Roles, Client scopes, Sessions, Advanced e Events). Então os atributos se definem por **Admin REST API** ou **import de realm JSON**.

### Por curl

Requer [`jq`](https://jqlang.github.io/jq/) para mesclar o JSON (`winget install jqlang.jq` no Windows, `apt install jq`, `brew install jq`).

O `PUT` de client **substitui a representação inteira**. Nunca envie só os atributos: faça `GET`, mescle e devolva o objeto completo, senão você apaga configuração do client.

> Fluxo validado num Keycloak 26.7: os três passos abaixo retornam `PUT 204` e os atributos aparecem no `kcContext` da tela de login.

```bash
# --- ajuste estas 4 linhas ---
KC=http://localhost:8080
REALM=master
CLIENT_ID=portal-dp
ADMIN_USER=admin; ADMIN_PASS=admin

# 1. token de admin
TOKEN=$(curl -s -X POST "$KC/realms/master/protocol/openid-connect/token" \
  -d "grant_type=password" -d "client_id=admin-cli" \
  -d "username=$ADMIN_USER" -d "password=$ADMIN_PASS" | jq -r .access_token)

# 2. UUID interno do client (diferente do clientId)
UUID=$(curl -s "$KC/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# 3. GET, mescla os atributos, PUT de volta
curl -s "$KC/admin/realms/$REALM/clients/$UUID" -H "Authorization: Bearer $TOKEN" \
| jq '.attributes += {
    "cvt.eyebrow":           "Acesso da folha",
    "cvt.lead":              "Fechamento, admissões e eSocial",
    "cvt.footerNote":        "Sessão auditada.",
    "cvt.brand.subtitle":    "Compliance HCM · Departamento Pessoal",
    "cvt.brand.headline":    "A folha fechada sem sobressaltos.",
    "cvt.brand.stat1Value":  "+3.400",
    "cvt.brand.stat1Label":  "colaboradores na folha",
    "cvt.brand.stat2Value":  "12 anos",
    "cvt.brand.stat2Label":  "de operação contínua"
  }' \
| curl -s -o /dev/null -w "PUT %{http_code}\n" \
    -X PUT "$KC/admin/realms/$REALM/clients/$UUID" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data-binary @-
```

`PUT 204` significa sucesso. Para conferir o que ficou gravado:

```bash
curl -s "$KC/admin/realms/$REALM/clients/$UUID" -H "Authorization: Bearer $TOKEN" \
  | jq '.attributes | with_entries(select(.key | startswith("cvt.")))'
```

Para **remover** um atributo e voltar ao padrão do tema, use `del`:

```bash
curl -s "$KC/admin/realms/$REALM/clients/$UUID" -H "Authorization: Bearer $TOKEN" \
| jq 'del(.attributes["cvt.eyebrow"])' \
| curl -s -o /dev/null -w "PUT %{http_code}\n" \
    -X PUT "$KC/admin/realms/$REALM/clients/$UUID" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data-binary @-
```

### Por import de realm

No JSON do realm, dentro do client:

```json
{
    "clientId": "portal-dp",
    "name": "Portal do Departamento Pessoal",
    "attributes": {
        "cvt.eyebrow": "Acesso da folha",
        "cvt.brand.stat1Value": "+3.400"
    }
}
```

## Antes de usar, saiba

- **Tudo em `client.attributes` fica visível no HTML da página de login**, para qualquer um que a acesse. Nada de sensível aqui.
- **Não há validação.** Um texto longo demais quebra o leiaute; um número no `stat1Value` com muitos caracteres estoura a linha. Os padrões do tema são curtos por isso.
- **Atributo em branco conta como ausente.** Um campo vazio no client não apaga o texto da tela — cai no padrão. Para "esvaziar" de fato um texto, hoje não há como; o caminho é remover o bloco no tema.
- **Os números do painel são afirmação pública.** Se um client anunciar uma certificação, alguém precisa responder por ela.

## Onde isto está implementado

- [`src/login/clientText.ts`](../src/login/clientText.ts) — resolução e a lista de chaves
- [`src/login/pages/Login.tsx`](../src/login/pages/Login.tsx) — a coluna do formulário
- [`src/login/Template.tsx`](../src/login/Template.tsx) — o painel de marca
- Stories no Storybook: `WithClientTextOverrides`, `WithClientNameAsTitle`, `WithBlankClientAttribute`

---

# Escolha de tema pelo usuário

A tela tem um botão discreto no canto superior direito que cicla entre três estados:

| Estado       | Ícone   | O que faz                                                                 |
| ------------ | ------- | ------------------------------------------------------------------------- |
| `do sistema` | monitor | Remove o atributo e segue o `prefers-color-scheme` do sistema operacional |
| `claro`      | sol     | Força o tema claro                                                        |
| `escuro`     | lua     | Força o tema escuro                                                       |

A escolha é gravada em `localStorage` sob a chave `cvt.themePreference` e sobrevive a recarregamentos. Se o `localStorage` estiver indisponível (navegação privada, cookies bloqueados), a escolha vale só para aquela página — a leitura e a escrita são protegidas para não derrubar a tela de login.

O botão aparece em **todas** as páginas de autenticação, inclusive no celular, onde o painel de marca é escondido.

## A configuração de realm manda

Em _Realm Settings → Themes → **Dark Mode**_, se o administrador desligar:

- o tema é forçado em claro, **mesmo que o usuário já tivesse escolhido escuro** antes;
- o botão não é exibido, porque não há escolha a oferecer.

Verificado num Keycloak 26.7: com `darkMode=false` no realm e `escuro` gravado no navegador, a tela renderiza clara e sem o botão.

> Comportamento diferente do padrão do Keycloakify: o tema de account dele segue apenas o `prefers-color-scheme`, sem escolha do usuário. O estado "do sistema" reproduz esse comportamento; os outros dois são acréscimo deste tema.

## Onde isto está implementado

- [`src/login/themePreference.ts`](../src/login/themePreference.ts) — leitura, gravação e aplicação
- [`src/login/components/ThemeToggle.tsx`](../src/login/components/ThemeToggle.tsx) — o botão
- [`src/login/KcPage.tsx`](../src/login/KcPage.tsx) — aplica a escolha antes do primeiro render, para não haver piscada de tema errado
- [`src/login/styles/tokens.css`](../src/login/styles/tokens.css) — as paletas, selecionadas por `[data-theme]` **e** por `prefers-color-scheme`
