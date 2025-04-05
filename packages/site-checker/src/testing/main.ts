import { PageConfig, DeepLevel, TestCase, Category, TestInput, runTests } from "./klasses";
import { checkRobotsBlockingIndexedUrls } from "../robots"
import { checkRobotsBlockingJsFiles } from "../robots"
import { checkRobotsBlockingSpecifiedPath } from "../robots"
import { checkMetaRobots } from "../meta-robots"
import { checkIfMetaRobotsExists } from "../meta-robots"
import { checkUniqueMetaRobots } from "../meta-robots"
import { checkPaginationFollow } from "../meta-robots"
import { checkThankYouPageNoindex } from "../meta-robots"
import { checkSitemapXmlExistence } from "../sitemap"
import { checkSitemapUrlsCount } from "../sitemap"
import { checkSiteProtocols } from "../redirects"
import { checkWWWAvailability } from "../redirects"
import { check404NoindexNofollow } from "../error-status"
import { checkContentLanguage } from "../language"
import { checkLanguageDirectiveConsistency } from "../language"
import { checkUniqueLanguageUrls } from "../international-seo"
import { checkHreflangMentions } from "../international-seo"
import { checkHreflangXDefault } from "../international-seo"
import { checkAmpCanonicalReponsiveness } from "../responsiveness"
import { checkAmpHtmlLinkPresence } from "../responsiveness"
import { checkSiteActiveCache } from "../resources"
import { checkGzipCompression } from "../resources"
import { checkHSTSProtocol } from "../security"
import { checkPageHasH1 } from "../heading-tags"
import { checkFriendlyUrls } from "../friendly-urls"
import { checkUppercaseUrls } from "../friendly-urls"
import { checkStructuredDataWebsite } from "../structured-data"
import { checkStructuredDataArticle } from "../structured-data"
import { checkBreadcrumbPresence } from "../navigation-paths"
import { checkTitleTagPresence } from "../title-tag"
import { checkMetaDescriptionCount } from "../meta-description"
import { checkEmptyMetaDescription } from "../meta-description"
import { checkLongMetaDescription } from "../meta-description"
import { checkImagesAltTextCompliance } from "../images"
import { checkContentUnder200Words } from "../content"
import { checkAuthorRelTag } from "../authority"
import { checkMetaViewportPresence } from "../responsiveness"
import { checkRobotsMentionsSitemap } from "../robots"
import { checkInternalLinksUsingHTTP } from "../security"
import { checkPageHasH2 } from "../heading-tags"
import { checkLastBreadcrumbClickable } from "../navigation-paths"
import { checkMultipleH1Tags } from "../heading-tags"
import { checkCategoryUrlHierarchy } from "../friendly-urls"
import { checkSitemapHttpsLinks } from "../sitemap"
import { checkSitemapIndexableUrls } from "../sitemap"
import { check404PageExists } from "../error-status"
import { checkMobileOptimization } from "../responsiveness"
import { checkFooterHeadingTagsAreH4 } from "../heading-tags"
import { checkUrlHierarchyDepth } from "../friendly-urls"
import { checkMultipleTitleTags } from "../title-tag"
import { checkTitleTagLong } from "../title-tag"
import { checkShortMetaDescription } from "../meta-description"
import { checkSpecialCharacterUrls } from "../friendly-urls"
import { checkBlogUrlHierarchy } from "../friendly-urls"
import { checkTrailingSlashDuplicates } from "../friendly-urls"
import { checkCanonicalTagParameters } from "../link-canonical"
import { checkCanonicalSelfReference } from "../link-canonical"
import { checkAmpPageCanonical } from "../link-canonical"
import { checkStructuredDataOrganization } from "../structured-data"
import { checkCanonicalExistence } from "../link-canonical"
import { checkPaginationCanonical } from "../link-canonical"
import { checkParagraphsMax3Lines } from "../content"
import { checkStructuredDataProduct } from "../structured-data"
import { checkAllBreadcrumbsClickable } from "../navigation-paths"
import { checkInternalLinkCount } from "../authority"
import { checkPostUrlDatePresence } from "../friendly-urls"
import { verify404PageStatus } from "../error-status"
import { checkHeadingTagsHierarchy } from "../heading-tags"
import { checkPageIndexFollow } from "../meta-robots"
import { checkStructuredDataLocalBusiness } from "../structured-data"
import { checkTitleTagShort } from "../title-tag"
import { checkStructuredDataCollection } from "../structured-data"
import { checkWpAdminStatus } from "../wordPress"
import { checkLazyLoadImages } from "../resources"
import { checkSiteSERPAppearance } from "../indexing"
import { checkHomepageRanking } from "../indexing"
import { checkRobotsTxtExists } from "../robots"
import { checkImportantUrlsInSitemap } from "../sitemap"
import { checkBrokenSitemapUrls } from "../sitemap"
import { checkSitemapRedirects } from "../sitemap"
import { validateSitemapStructure } from "../sitemap"
import { checkURLsFor302 } from "../redirects"
import { checkInternalLinks4xx } from "../error-status"
import { checkInternalLinks5xx } from "../error-status"
import { checkSSLCertificateValidity } from "../security"
import { checkH1KeywordPresence } from "../heading-tags"
import { checkHTTPSProtocol } from "../security"
import { checkStructuredDataFAQPage } from "../structured-data"
import { checkH2KeywordPresence } from "../heading-tags"
import { checkTitleTagForKeyword } from "../title-tag"
import { checkDuplicateH1AcrossPages } from "../heading-tags"
import { checkDuplicateTitleAcrossPages } from "../title-tag"
import { checkAssetsMinification } from "../resources"
import { checkJavascriptRedirectPatterns } from "../redirects"
import { checkFaviconAppearance } from "../indexing"
import { checkDuplicateContentVariations } from "../duplicate-content"
import { checkAnalytics4Installation } from "../analytics-4"
import { checkUrlKeywordPresence } from "../friendly-urls"
import { checkDuplicateMetaDescriptions } from "../meta-description"
import { checkHeavyImages } from "../images"
import { extractFooterSocialLinks } from "../page-experience"
import { validateSocialLinksFormat } from "../page-experience"
import { checkMetaDescriptionForKeyword } from "../meta-description"
import { checkImagesWebpExtension } from "../images"
import { checkBrandInMetaDescriptions } from "../meta-description"
import { checkMenuLinks } from "../page-experience"
import { checkTestSubdomainIndexation } from "../indexing"
import { check404StandardRedirect } from "../redirects"
import { optimizeSitemapUrls } from "../sitemap"
import { checkLanguageDirective } from "../international-seo"
import { checkFooterLinks } from "../page-experience"
import { checkFooterLinksForSlugs } from "../page-experience"

export const pages: PageConfig[] = [
    //{ url: "https://made2web.com", deep: [DeepLevel.S, DeepLevel.P], html: '' },
    //{ url: "https://nordictur.pt/page-sitemap.xml", deep: [DeepLevel.M], html: '' },
    { url: "https://www.optivisao.pt/produtos/vzv292", deep: [DeepLevel.PR], html: '' },
    { url: "https://www.made2web.com/blog/quais-sao-as-principais-estrategias-de-marketing-digital-baseadas-em-ia-para-ultrapassar-a-concorrencia", deep: [DeepLevel.PT], html: '' },
    { url: "https://www.optivisao.pt/categorias/armacoes", deep: [DeepLevel.C], html: '' }
];

export const tests: TestCase[] = [
    { 
        label: async (url) => checkRobotsBlockingIndexedUrls(url),
        resultKey: 'robotsResult',
        deep: [DeepLevel.S],
        excelNr: 8,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O arquivo está bloqueando URLs que deveriam estar indexados?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkRobotsBlockingJsFiles(url),
        resultKey: 'isBlockingJs',
        deep: [DeepLevel.S],
        excelNr: 9,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Os arquivos JS estão sendo bloqueados no robots.txt?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkRobotsBlockingSpecifiedPath(url, "/admin"),
        resultKey: 'isBlockingPath',
        deep: [DeepLevel.S],
        excelNr: 10,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Existe um caminho que orientamos bloquear?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMetaRobots(url),
        resultKey: 'metaNoindexFound',
        deep: [DeepLevel.S],
        excelNr: 12,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Há páginas importantes sendo bloqueadas com robots noindex?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkIfMetaRobotsExists(url),
        resultKey: 'metaTagFound',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 13,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'A página possui meta Robots?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkUniqueMetaRobots(url),
        resultKey: 'unique',
        deep: [DeepLevel.P],
        excelNr: 14,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'A tag de meta Robots é única na página?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkPaginationFollow(url),
        resultKey: 'follow',
        deep: [DeepLevel.C],
        excelNr: 16,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'As paginações estão como follow?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkThankYouPageNoindex(url),
        resultKey: 'thankYouNoindex',
        deep: [DeepLevel.P],
        excelNr: 17,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'As páginas de recompensa/obrigado estão como noindex?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSitemapXmlExistence(url),
        resultKey: 'exists',
        deep: [DeepLevel.S],
        excelNr: 18,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O site possui um arquivo sitemap.xml?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkSitemapUrlsCount(url),
        resultKey: 'sitemapUrlCount',
        deep: [DeepLevel.S],
        excelNr: 27,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Os arquivos de sitemap possuem até 50 mil URLs?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSiteProtocols(url),
        resultKey: 'httpAccessible, httpsAccessible, redirectedToHttps',
        deep: [DeepLevel.P],
        excelNr: 37,
        category: Category.Problemas_de_rastreamento,
        desc: 'O site funciona com HTTP e HTTPS?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkWWWAvailability(url),
        resultKey: 'WWWAvailabilityCheckResult',
        deep: [DeepLevel.P],
        excelNr: 38,
        category: Category.Problemas_de_rastreamento,
        desc: 'O site funciona com e sem WWW?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => check404NoindexNofollow(url),
        resultKey: 'metaTagPresent',
        deep: [DeepLevel.P],
        excelNr: 41,
        category: Category.Problemas_de_rastreamento,
        desc: 'A página 404 está como noindex, nofollow?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkContentLanguage(url),
        resultKey: 'languageDetected',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 44,
        category: Category.Problemas_de_rastreamento,
        desc: 'A URL está no idioma do conteúdo?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkLanguageDirectiveConsistency(url),
        resultKey: 'correctDirective',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 45,
        category: Category.Problemas_de_rastreamento,
        desc: 'A diretiva de linguagem está no idioma do conteúdo?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkUniqueLanguageUrls(url),
        resultKey: 'isUnique, languages',
        deep: [DeepLevel.P],
        excelNr: 53,
        category: Category.Tipos_de_site,
        desc: 'Há uma URL única para cada linguagem da página?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkHreflangMentions(url),
        resultKey: 'hasHreflang',
        deep: [DeepLevel.P],
        excelNr: 55,
        category: Category.Tipos_de_site,
        desc: 'A página possui menção de hreflang para as outras linguagens?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkHreflangXDefault(url),
        resultKey: 'hasXDefault',
        deep: [DeepLevel.P],
        excelNr: 57,
        category: Category.Tipos_de_site,
        desc: 'Foi definido um atributo hreflang x-Default?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkAmpCanonicalReponsiveness(url),
        resultKey: 'ampCanonicalCheck',
        deep: [DeepLevel.P],
        excelNr: 64,
        category: Category.Velocidade_e_seguranca,
        desc: 'A canonical de páginas /AMP está definida para a URL sem AMP?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkAmpHtmlLinkPresence(url),
        resultKey: 'foundAmpHtml',
        deep: [DeepLevel.P],
        excelNr: 65,
        category: Category.Velocidade_e_seguranca,
        desc: 'As páginas principais possuem rel="amphtml" para a URL /AMP?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSiteActiveCache(url),
        resultKey: 'hasActiveCache',
        deep: [DeepLevel.S],
        excelNr: 73,
        category: Category.Velocidade_e_seguranca,
        desc: 'O site possui um cachê ativo?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkGzipCompression(url),
        resultKey: 'hasGzipActivated',
        deep: [DeepLevel.S],
        excelNr: 74,
        category: Category.Velocidade_e_seguranca,
        desc: 'A compactação GZIP está ativada?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkHSTSProtocol(url),
        resultKey: 'hstsEnabled',
        deep: [DeepLevel.S],
        excelNr: 81,
        category: Category.Velocidade_e_seguranca,
        desc: 'O site possui Protocolo HSTS?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkPageHasH1(url),
        resultKey: 'hasH1',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 97,
        category: Category.Arquitetura_do_site,
        desc: 'Há páginas sem H1?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkFriendlyUrls(url),
        resultKey: 'urlsWithUnderscores',
        deep: [DeepLevel.S],
        excelNr: 104,
        category: Category.Arquitetura_do_site,
        desc: 'Há URLs com palavras separadas por underscore (_)?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkUppercaseUrls(url),
        resultKey: 'hasUppercase',
        deep: [DeepLevel.S],
        excelNr: 107,
        category: Category.Arquitetura_do_site,
        desc: 'Há URLs com letras maiúsculas?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataWebsite(url),
        resultKey: 'hasStructuredDataWebsite',
        deep: [DeepLevel.H],
        excelNr: 114,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de Website?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataArticle(url),
        resultKey: 'hasStructuredDataArticle',
        deep: [DeepLevel.PT],
        excelNr: 118,
        category: Category.Arquitetura_do_site,
        desc: 'O post possui dados estruturados de Article/Blogposting?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkBreadcrumbPresence(url),
        resultKey: 'exists',
        deep: [DeepLevel.PTPR],
        excelNr: 121,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui breadcrumb?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkTitleTagPresence(url),
        resultKey: 'titleTagPresenceCheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 128,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'O site possui páginas sem Title ou vazias?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMetaDescriptionCount(url),
        resultKey: 'metaDescriptionCheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 133,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com mais de uma meta Description no código-fonte?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkEmptyMetaDescription(url),
        resultKey: 'emptyMeta',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 134,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'O site possui páginas com meta Descriptions vazias?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkLongMetaDescription(url),
        resultKey: 'longDescriptionCheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 137,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com meta Descriptions longas, acima de 155 caracteres?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkImagesAltTextCompliance(url),
        resultKey: 'imagesAltCompliance',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 141,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há imagens sem alt text?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkContentUnder200Words(url),
        resultKey: 'hasLessThan200Words',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 143,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com menos de 200 palavras de conteúdo?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkAuthorRelTag(url),
        resultKey: 'found',
        deep: [DeepLevel.PT],
        excelNr: 149,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Os posts mencionam o nome do autor (uso de rel=author no HTML)?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMetaViewportPresence(url),
        resultKey: 'foundViewport',
        deep: [DeepLevel.P],
        excelNr: 62,
        category: Category.Velocidade_e_seguranca,
        desc: 'O site possui a tag de meta viewport em seu código-fonte?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkRobotsMentionsSitemap(url),
        resultKey: 'mentionsSitemap',
        deep: [DeepLevel.S],
        excelNr: 11,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O arquivo robots.txt menciona o sitemap.xml do site?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkInternalLinksUsingHTTP(url),
        resultKey: 'httpInternalLinks',
        deep: [DeepLevel.S],
        excelNr: 80,
        category: Category.Velocidade_e_seguranca,
        desc: 'O site possui links internos em HTTP?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkPageHasH2(url),
        resultKey: 'HeadingTagsH2CheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 101,
        category: Category.Arquitetura_do_site,
        desc: 'Exitem H2 na página?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkLastBreadcrumbClickable(url),
        resultKey: 'clickable',
        deep: [DeepLevel.PTPR],
        excelNr: 123,
        category: Category.Arquitetura_do_site,
        desc: 'O último caminho do breadcrumb está clicável?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMultipleH1Tags(url),
        resultKey: 'multipleH1CheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 99,
        category: Category.Arquitetura_do_site,
        desc: 'Há páginas que possuem mais de uma H1 no código-fonte?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkCategoryUrlHierarchy(url),
        resultKey: 'isCategoryUrlValid',
        deep: [DeepLevel.PT],
        excelNr: 112,
        category: Category.Arquitetura_do_site,
        desc: 'A URL de categoria possui a hierarquia /category/?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkSitemapHttpsLinks(url),
        resultKey: 'sitemapHttpsLinks',
        deep: [DeepLevel.S],
        excelNr: 19,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Os links do sitemap estão em HTTPS?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSitemapIndexableUrls(url),
        resultKey: 'sitemapIndexableUrls',
        deep: [DeepLevel.S],
        excelNr: 21,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Há URLs não indexáveis no sitemap?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => check404PageExists(url),
        resultKey: 'exists',
        deep: [DeepLevel.P],
        excelNr: 40,
        category: Category.Problemas_de_rastreamento,
        desc: 'Existe uma página 404?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkMobileOptimization(url),
        resultKey: 'isMobileOptimized',
        deep: [DeepLevel.P],
        excelNr: 63,
        category: Category.Velocidade_e_seguranca,
        desc: 'O site está otimizado para dispositivos móveis?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkFooterHeadingTagsAreH4(url),
        resultKey: 'footerCheck',
        deep: [DeepLevel.P],
        excelNr: 103,
        category: Category.Arquitetura_do_site,
        desc: 'As heading tags do rodapé estão em H4?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkUrlHierarchyDepth(url),
        resultKey: 'levelsCount',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 109,
        category: Category.Arquitetura_do_site,
        desc: 'A URL possui mais de 2 níveis de hierarquia?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkMultipleTitleTags(url),
        resultKey: 'titleTagCheckResult',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 127,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com mais de uma Title no código-fonte?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkTitleTagLong(url),
        resultKey: 'isLong',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 131,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com Titles longas, que excedem 60 caracteres?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkShortMetaDescription(url),
        resultKey: 'shortCount',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 136,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com meta Descriptions curtas, abaixo de 70 caracteres?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSpecialCharacterUrls(url),
        resultKey: 'hasSpecialCharacters',
        deep: [DeepLevel.S],
        excelNr: 105,
        category: Category.Arquitetura_do_site,
        desc: 'Há URLs com caracteres especiais?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkBlogUrlHierarchy(url),
        resultKey: 'isBlogUrlValid',
        deep: [DeepLevel.PT],
        excelNr: 110,
        category: Category.Arquitetura_do_site,
        desc: 'A URL possui a hierarquia /blog/ nos posts?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkTrailingSlashDuplicates(url),
        resultKey: 'duplicateGroups',
        deep: [DeepLevel.PT],
        excelNr: 113,
        category: Category.Arquitetura_do_site,
        desc: 'As URLs estão duplicadas com o uso/não uso de trailing slash?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkCanonicalTagParameters(url),
        resultKey: 'canonicalParameters',
        deep: [DeepLevel.P],
        excelNr: 30,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Os parâmetros (IDs, UTMs, AMP) estão na canonical tag?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkCanonicalSelfReference(url),
        resultKey: 'isSelfReference',
        deep: [DeepLevel.P],
        excelNr: 29,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'A tag canonical aponta para ela mesma?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkAmpPageCanonical(url),
        resultKey: 'ampCanonical',
        deep: [DeepLevel.P],
        excelNr: 32,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'As páginas de AMP possuem canonical para a versão não-AMP?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataOrganization(url),
        resultKey: 'hasStructuredDataOrganization',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 116,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de Organization?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkCanonicalExistence(url),
        resultKey: 'canonicalExistence',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 28,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'As páginas possuem link canonical?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkPaginationCanonical(url),
        resultKey: 'paginationCanonical',
        deep: [DeepLevel.C],
        excelNr: 31,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'As paginações estão com a canonical apontando para si mesma?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkParagraphsMax3Lines(url),
        resultKey: 'return_key',
        deep: [DeepLevel.PT],
        excelNr: 144,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Os parágrafos estão bem divididos, no máximo 3 linhas no desktop?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataProduct(url),
        resultKey: 'hasStructuredDataProduct',
        deep: [DeepLevel.PR],
        excelNr: 119,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de Product?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkAllBreadcrumbsClickable(url),
        resultKey: 'allClickable',
        deep: [DeepLevel.PTPR],
        excelNr: 122,
        category: Category.Arquitetura_do_site,
        desc: 'Os breadcrumbs estão clicáveis?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkInternalLinkCount(url),
        resultKey: 'internalLinkCount',
        deep: [DeepLevel.PT],
        excelNr: 148,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'O conteúdo possui, no mínimo, 3 linkagens internas?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkPostUrlDatePresence(url),
        resultKey: 'hasDate',
        deep: [DeepLevel.PT],
        excelNr: 111,
        category: Category.Arquitetura_do_site,
        desc: 'As URLs de post possuem data?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => verify404PageStatus(url),
        resultKey: 'is404',
        deep: [DeepLevel.P],
        excelNr: 42,
        category: Category.Problemas_de_rastreamento,
        desc: 'A página 404 retorna com status 404?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkHeadingTagsHierarchy(url),
        resultKey: 'hierarchyCheckResult',
        deep: [DeepLevel.P],
        excelNr: 96,
        category: Category.Arquitetura_do_site,
        desc: 'A hierarquia de heading tags está correta?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkPageIndexFollow(url),
        resultKey: 'pageIndexFollowResult',
        deep: [DeepLevel.P],
        excelNr: 15,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'A página está indexada (index, follow)?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataLocalBusiness(url),
        resultKey: 'hasStructuredDataLocalBusiness',
        deep: [DeepLevel.I],
        excelNr: 115,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de Local Business?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkTitleTagShort(url),
        resultKey: 'TestInput.HTML',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 130,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com Titles curtas, abaixo de 30 caracteres?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataCollection(url),
        resultKey: 'hasStructuredDataCollection',
        deep: [DeepLevel.C],
        excelNr: 120,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de Colection Page/Itemlist?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkWpAdminStatus(url),
        resultKey: 'wpAdminStatusCheck',
        deep: [DeepLevel.S],
        excelNr: 84,
        category: Category.Velocidade_e_seguranca,
        desc: 'O login do WordPress é wp-admin?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkLazyLoadImages(url),
        resultKey: 'lazyLoadImagesResult',
        deep: [DeepLevel.S],
        excelNr: 77,
        category: Category.Velocidade_e_seguranca,
        desc: 'As imagens estão com lazy load?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSiteSERPAppearance(url),
        resultKey: 'isIndexed',
        deep: [DeepLevel.S],
        excelNr: 3,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O site aparece na SERP do Google?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkHomepageRanking(url),
        resultKey: 'HomepageRankingCheckResult',
        deep: [DeepLevel.S],
        excelNr: 4,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Ao pesquisar a marca, a página inicial está na primeira posição?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkRobotsTxtExists(url),
        resultKey: 'exists',
        deep: [DeepLevel.S],
        excelNr: 7,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O site possui um arquivo robots.txt?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkImportantUrlsInSitemap(url, []),
        resultKey: 'sitemapImportantUrls',
        deep: [DeepLevel.S],
        excelNr: 20,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Todas as URLs importantes do site estão no sitemap?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkBrokenSitemapUrls(url),
        resultKey: 'sitemapBrokenUrls',
        deep: [DeepLevel.S],
        excelNr: 22,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Há URLs quebradas (404) no sitemap?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkSitemapRedirects(url),
        resultKey: 'sitemapRedirectStatus',
        deep: [DeepLevel.S],
        excelNr: 23,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Há URLs com redirecionamentos no sitemap?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => validateSitemapStructure(url),
        resultKey: 'sitemapStructureValidation',
        deep: [DeepLevel.S],
        excelNr: 26,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Existem arquivos de sitemap com erro?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkURLsFor302([url]),
        resultKey: 'urlsWith302',
        deep: [DeepLevel.S],
        excelNr: 34,
        category: Category.Problemas_de_rastreamento,
        desc: 'O site possui status 302 para redirecionamentos permanentes?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkInternalLinks4xx(url),
        resultKey: 'links',
        deep: [DeepLevel.S],
        excelNr: 39,
        category: Category.Problemas_de_rastreamento,
        desc: 'O site possui links internos com status 4xx?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkInternalLinks5xx(url),
        resultKey: 'links',
        deep: [DeepLevel.S],
        excelNr: 43,
        category: Category.Problemas_de_rastreamento,
        desc: 'O site possui erros de servidor com status 5xx?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkSSLCertificateValidity(url),
        resultKey: 'certificateValid',
        deep: [DeepLevel.S],
        excelNr: 79,
        category: Category.Velocidade_e_seguranca,
        desc: 'O Certificado de Segurança está válido?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkH1KeywordPresence(url, 'keyword'),
        resultKey: 'hasKeyword',
        deep: [DeepLevel.P],
        excelNr: 100,
        category: Category.Arquitetura_do_site,
        desc: 'A palavra-chave principal está presente na H1?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkHTTPSProtocol(url),
        resultKey: 'httpsCheck',
        deep: [DeepLevel.S],
        excelNr: 78,
        category: Category.Velocidade_e_seguranca,
        desc: 'A página possui Protocolo de Segurança (HTTPS)?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkStructuredDataFAQPage(url),
        resultKey: 'hasStructuredDataFAQPage',
        deep: [DeepLevel.P],
        excelNr: 117,
        category: Category.Arquitetura_do_site,
        desc: 'A página possui dados estruturados de FAQ Page?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkH2KeywordPresence(url, 'keyword'),
        resultKey: 'hasKeyword',
        deep: [DeepLevel.P],
        excelNr: 102,
        category: Category.Arquitetura_do_site,
        desc: 'A palavra-chave está, ao menos, em uma H2?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkTitleTagForKeyword(url, 'keyword'),
        resultKey: 'containsKeyword',
        deep: [DeepLevel.P],
        excelNr: 132,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'A palavra-chave principal está presente na Title?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkDuplicateH1AcrossPages(url),
        resultKey: 'DuplicateH1CheckResult',
        deep: [DeepLevel.S],
        excelNr: 98,
        category: Category.Arquitetura_do_site,
        desc: 'Há páginas do site com H1 iguais (duplicadas) em outras páginas?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkDuplicateTitleAcrossPages(url),
        resultKey: 'duplicateTitles',
        deep: [DeepLevel.S],
        excelNr: 129,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com Titles iguais (duplicadas) em outras páginas?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkAssetsMinification(url),
        resultKey: 'assets',
        deep: [DeepLevel.S],
        excelNr: 75,
        category: Category.Velocidade_e_seguranca,
        desc: 'Há arquivos CSS e JS não minificados?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkJavascriptRedirectPatterns(url),
        resultKey: 'redirectedURLs',
        deep: [DeepLevel.S],
        excelNr: 35,
        category: Category.Problemas_de_rastreamento,
        desc: 'Os redirecionamentos estão sendo feitos com Javascript?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkFaviconAppearance(url),
        resultKey: 'TestInput.HTML',
        deep: [DeepLevel.S],
        excelNr: 6,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'O favicon está aparecendo?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkDuplicateContentVariations(url),
        resultKey: 'DuplicateContentCheckResult',
        deep: [DeepLevel.P],
        excelNr: 146,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'A página apresenta conteúdo diferente na mesma URL?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkAnalytics4Installation(url, 'gtag'),
        resultKey: 'analyticsCheckResult',
        deep: [DeepLevel.S],
        excelNr: 87,
        category: Category.Ferramentas_google,
        desc: 'O código foi instalado corretamente?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkUrlKeywordPresence(url, 'keyword'),
        resultKey: 'containsKeyword',
        deep: [DeepLevel.P],
        excelNr: 108,
        category: Category.Arquitetura_do_site,
        desc: 'A URL menciona a palavra-chave?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkDuplicateMetaDescriptions(url),
        resultKey: 'DuplicateMetaDescriptionCheckResult',
        deep: [DeepLevel.S],
        excelNr: 135,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há páginas com meta Descriptions iguais (duplicadas) em outras páginas?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => checkHeavyImages(url),
        resultKey: 'heavyImages',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 140,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'Há imagens pesadas, com mais de 100kb?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => extractFooterSocialLinks(url),
        resultKey: 'socialLinks',
        deep: [DeepLevel.S],
        excelNr: 166,
        category: Category.Page_Experience,
        desc: 'O rodapé possui links para as redes sociais?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => validateSocialLinksFormat(url),
        resultKey: 'invalidSocialLinks',
        deep: [DeepLevel.S],
        excelNr: 167,
        category: Category.Page_Experience,
        desc: 'Os links do site nas redes sociais estão com a URL correta (https, www...)?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMetaDescriptionForKeyword(url, 'keyword'),
        resultKey: 'containsKeyword',
        deep: [DeepLevel.P],
        excelNr: 139,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'A palavra-chave principal está presente na meta Description?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkImagesWebpExtension(url),
        resultKey: 'nonWebpImages',
        deep: [DeepLevel.S, DeepLevel.P],
        excelNr: 142,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'As imagens estão em WEBP?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkBrandInMetaDescriptions(url, 'keyword'),
        resultKey: 'BrandMetaDescriptionCheckResult',
        deep: [DeepLevel.H],
        excelNr: 138,
        category: Category.Estrutura_tecnica_de_conteudo_on_page,
        desc: 'A meta Description menciona a marca em páginas importantes?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkMenuLinks(url, []),
        resultKey: 'missingLinks',
        deep: [DeepLevel.S],
        excelNr: 158,
        category: Category.Page_Experience,
        desc: 'As principais páginas estão acessíveis no menu?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkTestSubdomainIndexation(url),
        resultKey: 'TestInput.URL',
        deep: [DeepLevel.S],
        excelNr: 5,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'Há subdomínios de ambiente de testes que não deveriam estar indexados?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => check404StandardRedirect(url),
        resultKey: 'standardRedirect',
        deep: [DeepLevel.P],
        excelNr: 36,
        category: Category.Problemas_de_rastreamento,
        desc: 'Existe um redirecionamento padrão para todas as páginas 404?',
        input: TestInput.URL,
        value: null
    },
    { 
        label: async (url) => optimizeSitemapUrls(url),
        resultKey: 'sitemapOptimization',
        deep: [DeepLevel.S],
        excelNr: 24,
        category: Category.Acessibilidade_e_indexacao,
        desc: 'É possível otimizar o sitemap, removendo links desnecessários?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkLanguageDirective(url, 'language'),
        resultKey: 'currentLanguage',
        deep: [DeepLevel.P],
        excelNr: 56,
        category: Category.Tipos_de_site,
        desc: 'A diretiva de linguagem muda de acordo com o idioma selecionado?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkFooterLinks([], url),
        resultKey: 'missingFooterLinks',
        deep: [DeepLevel.S],
        excelNr: 162,
        category: Category.Page_Experience,
        desc: 'Existem links importantes no rodapé?',
        input: TestInput.HTML,
        value: null
    },
    { 
        label: async (url) => checkFooterLinksForSlugs([], url),
        resultKey: 'missingFooterSlugs',
        deep: [DeepLevel.S],
        excelNr: 165,
        category: Category.Page_Experience,
        desc: 'O rodapé possui links de política de privacidade e/ou termos e condições?',
        input: TestInput.HTML,
        value: null
    },
];

runTests(pages, tests);