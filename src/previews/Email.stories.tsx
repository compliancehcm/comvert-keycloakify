import type { Meta, StoryObj } from "../kc.gen";
import { renderEmailTemplate, sampleBodies } from "./renderEmailTemplate";

/* Pré-visualização dos e-mails.

   Renderizado dentro de um <iframe srcDoc> de propósito, por dois motivos:
   - isolamento de CSS. O e-mail traz seus próprios estilos e um <body> com fundo
     próprio; solto na página do Storybook ele contaminaria as outras stories;
   - fidelidade. Cliente de e-mail também renderiza o HTML num documento próprio.

   O que esta preview NÃO garante: como Gmail, Outlook e Apple Mail vão tratar o
   HTML. Cada um remove e reescreve coisas diferentes. Para isso, o teste é envio
   real -- foi assim que o ${.lang} resolvendo "en" apareceu. */

function EmailPreview(props: { body: string; largura?: number }) {
    const { body, largura = 700 } = props;

    return (
        <iframe
            title="Pré-visualização do e-mail"
            srcDoc={renderEmailTemplate({ body })}
            style={{
                width: "100%",
                maxWidth: largura,
                height: 620,
                border: "1px solid #e0e5f0",
                borderRadius: 8,
                background: "#ffffff",
                display: "block"
            }}
        />
    );
}

const meta = {
    title: "email/template.ftl",
    component: EmailPreview
} satisfies Meta<typeof EmailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/* args em vez de render: o body é prop obrigatória do componente, e assim o
   Storybook ainda oferece os controles para editar o corpo ao vivo. */

export const RedefinirSenha: Story = {
    args: { body: sampleBodies.passwordReset }
};

export const VerificarEmail: Story = {
    args: { body: sampleBodies.emailVerification }
};

export const AcoesObrigatorias: Story = {
    args: { body: sampleBodies.executeActions }
};

export const EventoSenhaAlterada: Story = {
    args: { body: sampleBodies.eventUpdatePassword }
};

/** Largura de celular, onde o card de 600px passa a ser fluido. */
export const Celular: Story = {
    args: { body: sampleBodies.passwordReset, largura: 380 }
};
