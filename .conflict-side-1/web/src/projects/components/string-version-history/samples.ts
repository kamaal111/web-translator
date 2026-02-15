import type { ListStringVersionsResponse } from '@/generated/api-client/src';

export const mockStringVersionHistory: ListStringVersionsResponse = {
  locales: [
    {
      locale: 'en',
      draft: {
        value: 'Welcome Home - Draft',
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        updatedBy: { id: 'user1', name: 'Test User' },
      },
      versions: [
        {
          version: 2,
          value: 'Welcome Home v2',
          createdAt: new Date('2024-01-10T10:00:00Z'),
          createdBy: { id: 'user1', name: 'Test User' },
        },
        {
          version: 1,
          value: 'Welcome Home v1',
          createdAt: new Date('2024-01-05T10:00:00Z'),
          createdBy: { id: 'user1', name: 'Test User' },
        },
      ],
      pagination: { page: 1, pageSize: 10, totalVersions: 2, hasMore: false },
    },
    {
      locale: 'es',
      draft: null,
      versions: [
        {
          version: 1,
          value: 'Bienvenido a Casa',
          createdAt: new Date('2024-01-08T10:00:00Z'),
          createdBy: { id: 'user1', name: 'Test User' },
        },
      ],
      pagination: { page: 1, pageSize: 10, totalVersions: 1, hasMore: false },
    },
  ],
};

export default mockStringVersionHistory;
