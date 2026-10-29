import type { Meta, StoryObj } from "../../kc.gen";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-username.ftl" });

const meta = {
    title: "login/login-username.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    loginWithEmailAllowed: true,
                    registrationEmailAsUsername: true
                }
            }}
        />
    )
};

/**
 * A etapa do usuário é a primeira tela de login com Organizations ligado no realm
 * (o fluxo do departamento pessoal e do funcionário no Comvert Portal). Mesmos
 * textos por client e mesmos chips de "Entrar como" do login.ftl: troque o idioma
 * da story para conferir os textos `.en` e os rótulos dos perfis.
 */
export const WithEmployeeProfiles: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                client: {
                    clientId: "comvertportal-funcionario",
                    attributes: {
                        "cvt.eyebrow": "Acesso do funcionário",
                        "cvt.eyebrow.en": "Employee access",
                        "cvt.title": "Entrar na área do funcionário",
                        "cvt.title.en": "Sign in to the employee area",
                        "cvt.lead": "Holerites, férias e seus dados cadastrais",
                        "cvt.lead.en": "Payslips, time off and your personal details",
                        "cvt.profiles": JSON.stringify([
                            { perfil: "dp", url: "https://portal.exemplo.test/api/auth/login" },
                            {
                                perfil: "funcionario",
                                url: "https://portal.exemplo.test/api/auth/login?perfil=funcionario",
                                current: true
                            },
                            { perfil: "candidato", url: "https://portal.exemplo.test/api/auth/login?perfil=candidato" }
                        ])
                    }
                }
            }}
        />
    )
};

/** Usuário não encontrado: o erro fica no campo, e não repetido no alerta. */
export const WithUsernameError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                messagesPerField: {
                    existsError: (field: string) => field === "username",
                    getFirstError: () => "Usuário ou senha inválidos."
                },
                message: { type: "error", summary: "Usuário ou senha inválidos." }
            }}
        />
    )
};
