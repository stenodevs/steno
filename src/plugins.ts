import type { Token, TokensList } from "marked";

export interface StenoPlugin {
    name: string;
    transformAst?: (tokens: TokensList) => TokensList | Promise<TokensList>;
    transformHtml?: (html: string) => string | Promise<string>;
}

export async function runAstTransforms(
    tokens: TokensList,
    plugins: StenoPlugin[],
): Promise<TokensList> {
    for (const plugin of plugins) {
        if (plugin.transformAst) {
            tokens = await plugin.transformAst(tokens);
        }
    }
    return tokens;
}

export async function runHtmlTransforms(
    html: string,
    plugins: StenoPlugin[],
): Promise<string> {
    for (const plugin of plugins) {
        if (plugin.transformHtml) {
            html = await plugin.transformHtml(html);
        }
    }
    return html;
}