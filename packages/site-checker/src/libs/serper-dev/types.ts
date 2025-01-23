export interface SerperSearchResult {
  searchParameters: {
    q: string;
    type: string;
    engine: string;
  };
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
    sitelinks?: Array<{
      title: string;
      link: string;
    }>;
  }>;
  knowledgeGraph?: {
    title: string;
    type: string;
    website?: string;
    imageUrl?: string;
    description?: string;
    attributes?: Record<string, string>;
  };
  peopleAlsoAsk?: Array<{
    question: string;
    snippet: string;
    title: string;
    link: string;
  }>;
  relatedSearches?: Array<{
    query: string;
  }>;
  places?: Array<{
    title: string;
    address: string;
    cid: string;
  }>;
  topStories?: Array<{
    title: string;
    link: string;
    source: string;
    date: string;
    imageUrl: string;
  }>;
  credits: number;
}
