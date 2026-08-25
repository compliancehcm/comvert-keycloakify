import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import type { KcContext } from "./KcContext";
import KcPage from "./KcPage";
import { createGetKcContextMock } from "keycloakify/login/KcContext";
import type { KcContextExtension, KcContextExtensionPerPage } from "./KcContext";
import { themeNames, kcEnvDefaults } from "../kc.gen";

const kcContextExtension: KcContextExtension = {
    themeName: themeNames[0],
    properties: {
        ...kcEnvDefaults
    }
};
const kcContextExtensionPerPage: KcContextExtensionPerPage = {};

export const { getKcContextMock } = createGetKcContextMock({
    kcContextExtension,
    kcContextExtensionPerPage,
    overrides: {},
    overridesPerPage: {}
});

/* Idioma das stories.
   O useI18n do keycloakify resolve o idioma por kcContext.locale.currentLanguageTag,
   que vem do mock fixado em "en". Um decorator do Storybook não consegue injetar
   dentro do kcContext que cada story constrói, então o seletor da toolbar grava
   aqui e o KcPageStory lê no render. O decorator roda antes do render da story,
   então a leitura sempre vê o valor atual.
   Ver .storybook/preview.ts. */
let storyLanguageTag: string | undefined = undefined;

export function setStoryLanguageTag(languageTag: string | undefined) {
    storyLanguageTag = languageTag;
}

export function createKcPageStory<PageId extends KcContext["pageId"]>(params: {
    pageId: PageId;
}) {
    const { pageId } = params;

    function KcPageStory(props: {
        kcContext?: DeepPartial<Extract<KcContext, { pageId: PageId }>>;
    }) {
        const { kcContext: overrides } = props;

        const kcContextMock = getKcContextMock({
            pageId,
            overrides
        });

        if (storyLanguageTag !== undefined && kcContextMock.locale !== undefined) {
            kcContextMock.locale.currentLanguageTag = storyLanguageTag;
        }

        return <KcPage kcContext={kcContextMock} key={storyLanguageTag} />;
    }

    return { KcPageStory };
}
