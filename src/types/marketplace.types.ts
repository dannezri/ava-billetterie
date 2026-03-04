/**
 * Marketplace Types
 * Types pour filtres, recherche et pagination
 */

export interface IEventFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  cities?: string[];
  categories?: string[];
  artists?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IEventSearchResult {
  events: any[];
  pagination: IPagination;
  filters: {
    availableCities: string[];
    availableCategories: string[];
  };
}

export interface ISearchQuery {
  q: string;
  type?: 'all' | 'events' | 'artists' | 'cities';
  filters?: IEventFilters;
}

export interface ISearchResults {
  query: string;
  results: {
    events: any[];
    artists: Array<{
      name: string;
      category: string;
      eventsCount: number;
    }>;
    cities: Array<{
      name: string;
      eventsCount: number;
    }>;
  };
  totalResults: number;
}

export type SortOption = 
  | 'relevance' 
  | 'date_asc' 
  | 'date_desc' 
  | 'price_min' 
  | 'popularity';
