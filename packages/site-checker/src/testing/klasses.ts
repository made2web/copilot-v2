import fs from 'fs';
import path from 'path';

const config = {
    outputType: 'T' as 'T' | 'J',
    logsDir: path.join(__dirname, 'logs')
};

export enum Category {
    Acessibilidade_e_indexacao = 'Acessibilidade e indexação',
    Problemas_de_rastreamento = 'Problemas de rastreamento',
    Tipos_de_site = 'Tipos de site',
    Velocidade_e_seguranca = 'Velocidade e segurança',
    Arquitetura_do_site = 'Arquitetura do site',
    Ferramentas_google = 'Ferramentas Google',
    Estrutura_tecnica_de_conteudo_on_page = 'Estrutura técnica de conteúdo on-page',
    Page_Experience = 'Page Experience'
}

export enum DeepLevel {
    S = 'S',
    P = 'P', // página
    C = 'C', // categoria
    I = 'I', // institucional
    M = 'M', // sitemap
    PT = 'PT', // post
    PTPR = 'PTPR', // post
    PR = 'PR', // produto
    H = 'H' // home
}

export enum TestInput {
    HTML = 'html',
    URL = 'url'
}

export interface TestCase {
    label: (url: string) => Promise<any>;
    resultKey: string;
    deep: DeepLevel[];
    excelNr: number;
    category: Category;
    desc: string;
    value: any;
    input: TestInput;
}

export interface PageConfig {
    url: string;
    deep: DeepLevel[];
    html: string;
}

async function executeTest(testCase: TestCase, content: string) {
    try {
        const result = await testCase.label(content);
        return result[testCase.resultKey];
    } catch (error) {
        return { 
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

function getTestName(labelFunction: (url: string) => Promise<any>) {
    const funcString = labelFunction.toString();
    const match = funcString.match(/async\s+\(url\)\s*=>\s*(\w+)/);
    return match ? match[1] : 'Unknown Test';
}

function generateLogData(results: any[], pages: PageConfig[], tests: TestCase[], outputType: String) {
    if(outputType == 'J') {
        return {
            timestamp: new Date().toISOString(),
            pages: pages.map(page => ({
                url: page.url,
                tests: results
                    .filter(r => r.pageUrl === page.url)
                    .map(t => ({
                        excelKey: t.excelNr,
                        category: t.category,
                        description: t.desc,
                        testName: t.testName,
                        resultKey: t.resultKey,
                        value: t.value,
                        status: typeof t.value === 'boolean' 
                            ? (t.value ? 'OK' : 'FAIL') 
                            : 'ERROR'
                    }))
            }))
        };
    } else {
        return {
            timestamp: new Date().toISOString(),
            pages: pages.map(page => ({
                url: page.url,
                deep: page.deep,
                tests: results
                    .filter(r => r.pageUrl === page.url)
                    .map(t => ({
                        excelKey: t.excelNr,
                        category: t.category,
                        description: t.desc,
                        testName: t.testName,
                        resultKey: t.resultKey,
                        value: t.value,
                        status: typeof t.value === 'boolean' 
                            ? (t.value ? 'OK' : 'FAIL') 
                            : 'ERROR',
                        applicableDeeps: tests.find(test => test.excelNr === t.excelNr)?.deep
                    }))
            }))
        };
    }
}

async function saveJsonLog(logData: any) {
    try {
        if (!fs.existsSync(config.logsDir)) {
            fs.mkdirSync(config.logsDir, { recursive: true });
        }
        
        const timestamp = new Date().getTime();
        const filename = `test-results-${timestamp}.json`;
        const filePath = path.join(config.logsDir, filename);
        
        await fs.promises.writeFile(
            filePath, 
            JSON.stringify(logData, null, 2),
            'utf8'
        );
        
        console.log(`Log salvo em: ${filePath}`);
    } catch (error) {
        console.error('Erro ao salvar log:', error);
    }
}

export async function runTests(pages: PageConfig[], tests: TestCase[]) {
    const results: any[] = [];
    
    for (const page of pages) {
        try {
            const response = await fetch(page.url);
            page.html = await response.text();
        } catch (error) {
            console.error(`Erro ao buscar HTML para ${page.url}:`, error);
            page.html = '';
        }

        for (const test of tests) {
            if (test.deep.some(tDeep => page.deep.includes(tDeep))) {
                const input = test.input === 'html' ? page.html : page.url;
                const value = await executeTest(test, input);
                
                results.push({
                    pageUrl: page.url,
                    pageDeep: page.deep,
                    excelNr: test.excelNr,
                    category: test.category,
                    desc: test.desc,
                    testName: getTestName(test.label),
                    resultKey: test.resultKey,
                    value: value
                });
            }
        }
    }

    const logData = generateLogData(results, pages, tests, 'J');
    
    switch(config.outputType) {
        case 'T':
            console.log('\nResultados em formato de tabela:');
            console.table(logData.pages.flatMap(page => 
                page.tests.map(t => ({
                    '# Excel': t.excelKey,
                    Categoria: t.category,
                    Descrição: t.description,
                    Página: page.url,
                    Teste: t.testName,
                    Valor: t.value,
                    Status: t.status.replace('OK', '✅ Ok')
                                   .replace('FAIL', '❌ Fail')
                                   .replace('ERROR', '⚠️ Error')
                }))
            ));
            break;
            
        case 'J':
            await saveJsonLog(logData);
            break;
    }
}
