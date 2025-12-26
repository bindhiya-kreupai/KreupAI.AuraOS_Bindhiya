/**
 * Elasticsearch Search Client
 * Handles all search operations
 *
 * @module @aura/search
 */

import { Client } from '@elastic/elasticsearch';
import { getElasticsearchConfig, ALL_INDICES, IndexMapping } from '../config/elasticsearch.config';

export interface SearchQuery {
  tenantId: string;
  query?: string;
  filters?: Record<string, unknown>;
  from?: number;
  size?: number;
  sort?: Array<{ [key: string]: 'asc' | 'desc' }>;
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
  took: number;
}

export class SearchClient {
  private client: Client;
  private isConnected = false;

  constructor() {
    const config = getElasticsearchConfig();
    this.client = new Client(config);
  }

  /**
   * Initialize Elasticsearch connection and create indices
   */
  async connect(): Promise<void> {
    try {
      // Check cluster health
      const health = await this.client.cluster.health();
      console.log('Elasticsearch cluster health:', health.status);

      // Create indices if they don't exist
      await this.createIndices();

      this.isConnected = true;
      console.log('Successfully connected to Elasticsearch');
    } catch (error) {
      console.error('Failed to connect to Elasticsearch:', error);
      throw error;
    }
  }

  /**
   * Create all indices
   */
  private async createIndices(): Promise<void> {
    for (const indexMapping of ALL_INDICES) {
      try {
        const exists = await this.client.indices.exists({
          index: indexMapping.index,
        });

        if (!exists) {
          await this.client.indices.create({
            index: indexMapping.index,
            body: {
              mappings: indexMapping.mappings,
              settings: indexMapping.settings,
            },
          });
          console.log(`Index created: ${indexMapping.index}`);
        } else {
          console.log(`Index already exists: ${indexMapping.index}`);
        }
      } catch (error) {
        console.error(`Error creating index ${indexMapping.index}:`, error);
      }
    }
  }

  /**
   * Index a document
   */
  async indexDocument<T>(index: string, id: string, document: T): Promise<void> {
    try {
      await this.client.index({
        index,
        id,
        document,
        refresh: 'wait_for',
      });
      console.log(`Document indexed: ${index}/${id}`);
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex<T>(index: string, documents: Array<{ id: string; doc: T }>): Promise<void> {
    try {
      const operations = documents.flatMap((doc) => [
        { index: { _index: index, _id: doc.id } },
        doc.doc,
      ]);

      const result = await this.client.bulk({
        refresh: 'wait_for',
        operations,
      });

      if (result.errors) {
        console.error('Bulk indexing had errors:', result.items);
      } else {
        console.log(`Bulk indexed ${documents.length} documents to ${index}`);
      }
    } catch (error) {
      console.error('Error bulk indexing:', error);
      throw error;
    }
  }

  /**
   * Search documents
   */
  async search<T>(index: string, searchQuery: SearchQuery): Promise<SearchResult<T>> {
    try {
      const mustClauses: unknown[] = [
        { term: { tenantId: searchQuery.tenantId } },
      ];

      if (searchQuery.query) {
        mustClauses.push({
          multi_match: {
            query: searchQuery.query,
            fields: ['*'],
            fuzziness: 'AUTO',
          },
        });
      }

      if (searchQuery.filters) {
        Object.entries(searchQuery.filters).forEach(([key, value]) => {
          mustClauses.push({ term: { [key]: value } });
        });
      }

      const result = await this.client.search({
        index,
        body: {
          query: {
            bool: {
              must: mustClauses,
            },
          },
          from: searchQuery.from || 0,
          size: searchQuery.size || 10,
          sort: searchQuery.sort || [{ _score: 'desc' }],
        },
      });

      return {
        hits: result.hits.hits.map((hit: any) => ({
          ...hit._source,
          _id: hit._id,
          _score: hit._score,
        })) as T[],
        total: typeof result.hits.total === 'number'
          ? result.hits.total
          : result.hits.total?.value || 0,
        took: result.took,
      };
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Autocomplete search
   */
  async autocomplete(
    index: string,
    field: string,
    prefix: string,
    tenantId: string,
    size: number = 10
  ): Promise<string[]> {
    try {
      const result = await this.client.search({
        index,
        body: {
          query: {
            bool: {
              must: [
                { term: { tenantId } },
                {
                  match_phrase_prefix: {
                    [field]: prefix,
                  },
                },
              ],
            },
          },
          size,
          _source: [field],
        },
      });

      return result.hits.hits.map((hit: any) => hit._source[field]).filter(Boolean);
    } catch (error) {
      console.error('Error autocomplete:', error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument(index: string, id: string, partialDoc: unknown): Promise<void> {
    try {
      await this.client.update({
        index,
        id,
        doc: partialDoc,
        refresh: 'wait_for',
      });
      console.log(`Document updated: ${index}/${id}`);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await this.client.delete({
        index,
        id,
        refresh: 'wait_for',
      });
      console.log(`Document deleted: ${index}/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Aggregate data
   */
  async aggregate(index: string, aggregations: unknown, tenantId: string): Promise<unknown> {
    try {
      const result = await this.client.search({
        index,
        body: {
          query: {
            term: { tenantId },
          },
          aggregations,
          size: 0,
        },
      });

      return result.aggregations;
    } catch (error) {
      console.error('Error aggregating:', error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    await this.client.close();
    this.isConnected = false;
    console.log('Disconnected from Elasticsearch');
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let searchClientInstance: SearchClient | null = null;

export function getSearchClient(): SearchClient {
  if (!searchClientInstance) {
    searchClientInstance = new SearchClient();
  }
  return searchClientInstance;
}
