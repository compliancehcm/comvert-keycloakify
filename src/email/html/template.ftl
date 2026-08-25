<#--
  This file has been claimed for ownership from @keycloakify/email-native version 260007.0.0.
  To relinquish ownership and restore this file to its original content, run the following command:

  $ npx keycloakify own --path "email/html/template.ftl" --revert
-->

<#--
  Layout de marca para todos os e-mails do Keycloak. Cada template (password-reset,
  email-verification, executeActions, event-*, org-invite...) injeta o próprio corpo
  aqui via <#nested>.

  Por que este arquivo não se parece com o resto do tema:

  - CSS em atributo style, não em folha. Gmail, Outlook e clientes móveis removem
    <style> e <link>, e NENHUM suporta custom properties -- var(--primary) sairia
    vazio. Por isso os hexes do design system estão escritos à mão aqui. Ao mudar
    uma cor em src/login/styles/tokens.css, mudar também aqui.
  - Tabelas em vez de flex/grid. O Outlook no Windows renderiza com o motor do Word,
    que não implementa nenhum dos dois.
  - Sem <img> do logo. E-mail é enviado por SMTP, não servido pelo tema: não existe
    resourcesUrl aqui, e a maioria dos clientes bloqueia imagem remota por padrão.
    A marca vai como texto, que sempre aparece.
  - Fonte do sistema. Webfont não carrega em cliente de e-mail; a pilha cai direto
    no equivalente local da Inter.
-->

<#macro emailLayout>
<!DOCTYPE html>
<#--
  Sem atributo lang de propósito. O ${.lang} do FreeMarker resolve para "en" aqui
  (verificado num e-mail real), porque o Keycloak não amarra o locale do FreeMarker
  ao idioma do destinatário -- ele resolve as mensagens pelo próprio bundle. O
  resultado era lang="en" num corpo em pt-BR, o que é pior para leitor de tela do
  que não declarar idioma nenhum.
-->
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${realmName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb;">

    <!-- Faixa de marca -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb;">
        <tr>
            <td align="center" style="padding:32px 16px;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

                    <!-- Cabeçalho navy -->
                    <tr>
                        <td style="background-color:#2b4587; border-radius:12px 12px 0 0; padding:28px 32px;">
                            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:20px; font-weight:700; letter-spacing:-0.02em; color:#ffffff; line-height:1.2;">
                                Compliance HCM
                            </div>
                            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:13px; font-weight:500; color:#c7d2ef; padding-top:6px;">
                                ${realmName}
                            </div>
                            <!-- Régua âmbar, o mesmo detalhe do painel da tela de login -->
                            <div style="width:48px; height:3px; background-color:#f5a623; border-radius:999px; margin-top:18px;"></div>
                        </td>
                    </tr>

                    <!-- Corpo -->
                    <tr>
                        <td style="background-color:#ffffff; border-left:1px solid #e0e5f0; border-right:1px solid #e0e5f0; padding:32px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:1.55; color:#101a33;">
                            <#nested>
                        </td>
                    </tr>

                    <!-- Rodapé -->
                    <tr>
                        <td style="background-color:#ffffff; border:1px solid #e0e5f0; border-top:none; border-radius:0 0 12px 12px; padding:20px 32px 28px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:13px; line-height:1.5; color:#5b6784;">
                            <div style="border-top:1px solid #e0e5f0; padding-top:18px;">
                                Esta mensagem foi enviada automaticamente pelo ${realmName}. Se você não
                                reconhece esta solicitação, ignore este e-mail e avise o departamento pessoal.
                            </div>
                            <div style="padding-top:14px; color:#96a1bb;">
                                &copy; Compliance Soluções
                            </div>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
</#macro>
