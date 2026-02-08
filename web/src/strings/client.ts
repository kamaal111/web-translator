import { StringApi } from '@/generated/api-client/src/apis/StringApi';
import type { Configuration } from '@/generated/api-client/src/runtime';
import type { PutAppApiV1SProjectIdTranslationsRequest, UpsertTranslationsResponse } from '@/generated/api-client/src';

class StringsClient {
  private readonly stringApi: StringApi;

  constructor(config: Configuration) {
    this.stringApi = new StringApi(config);
  }

  listStrings = (projectId: string) => {
    return this.stringApi.getAppApiV1SProjectId({ projectId });
  };

  upsertTranslations = (request: PutAppApiV1SProjectIdTranslationsRequest): Promise<UpsertTranslationsResponse> => {
    return this.stringApi.putAppApiV1SProjectIdTranslations(request);
  };
}

export default StringsClient;
