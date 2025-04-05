import { cleanDomainName, isURL } from "./utils.js";

export interface WpAdminStatusResult {
    isWordPressAdmin: boolean;
    statusCode?: number;
    error?: string;
    function_type: string;
    problem: string;
    solution: string;
    functionName: string;
}

/**
 * Checks if the WordPress admin (wp-admin) route returns the expected login page.
 * 
 * The function accepts either a URL or raw HTML as input. If a URL is provided,
 * it will construct the URL for the wp-admin page and perform a fetch request. The returned page
 * is then analyzed by checking for the occurrence of "wp-login.php", which is a typical indicator
 * of the WordPress login form. If raw HTML is provided, the function directly checks for the indicator.
 * 
 * @param input - URL or HTML content
 * @returns A WpAdminStatusResult object with the result of the check
 */
export async function checkWpAdminStatus(input: string): Promise<WpAdminStatusResult> {
    const functionName = "checkWpAdminStatus";
    let function_type = "";
    try {
        let content: string;
        if (isURL(input)) {
            function_type = "TestInput.URL";
            const domain = cleanDomainName(input);
            const url = "https://" + domain + "/wp-admin";
            const response = await fetch(url);
            const statusCode = response.status;
            content = await response.text();
            const isWordPressAdmin = content.includes("wp-login.php");
            return {
                isWordPressAdmin,
                statusCode,
                function_type,
                problem: "Esta função verifica se a rota /wp-admin retorna a página de login do WordPress, indicada pela presença do token 'wp-login.php' no conteúdo HTML.",
                solution: "Para sites WordPress, a página de login geralmente contém um formulário que envia os dados para 'wp-login.php'. Ao buscar a rota /wp-admin, a função analisa o HTML retornado para confirmar essa presença.",
                functionName
            };
        } else {
            function_type = "TestInput.HTML";
            content = input;
            const isWordPressAdmin = content.includes("wp-login.php");
            return {
                isWordPressAdmin,
                function_type,
                problem: "Esta função verifica se o conteúdo HTML fornecido contém a estrutura de login do WordPress, identificada pela string 'wp-login.php'.",
                solution: "Ao analisar o HTML, a função determina se a página exibe o formulário de login do WordPress, evidenciado pela presença de 'wp-login.php'.",
                functionName
            };
        }
    } catch (error) {
        return {
            isWordPressAdmin: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
            function_type: function_type || "TestInput.URL",
            problem: "Esta função verifica se a rota /wp-admin retorna a página de login do WordPress, indicada pela presença do token 'wp-login.php' no conteúdo HTML.",
            solution: "Ao buscar e analisar o conteúdo da rota /wp-admin, a função determina se há indicação de um formulário de login típico de WordPress.",
            functionName
        };
    }
}
