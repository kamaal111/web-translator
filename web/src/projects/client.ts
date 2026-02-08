import { ProjectApi } from '@/generated/api-client/src/apis/ProjectApi';
import type { Configuration } from '@/generated/api-client/src/runtime';
import type {
  CreateProjectPayload,
  GetAppApiV1PProjectIdStringsStringKeyVersionsRequest,
  PatchAppApiV1PProjectIdStringsStringKeyTranslationsRequest,
  PostAppApiV1PProjectIdPublishRequest,
  PublishSnapshotResponse,
  UpdateDraftTranslationsResponse,
} from '@/generated/api-client/src';

class ProjectsClient {
  private readonly projectsApi: ProjectApi;

  constructor(config: Configuration) {
    this.projectsApi = new ProjectApi(config);
  }

  list = () => {
    return this.projectsApi.getAppApiV1P();
  };

  create = (payload: CreateProjectPayload) => {
    return this.projectsApi.postAppApiV1P({ createProjectPayload: payload });
  };

  read = (projectId: string) => {
    return this.projectsApi.getAppApiV1PProjectId({ projectId });
  };

  listStringVersions = (request: GetAppApiV1PProjectIdStringsStringKeyVersionsRequest) => {
    return this.projectsApi.getAppApiV1PProjectIdStringsStringKeyVersions(request);
  };

  updateDraftTranslations = async (
    request: PatchAppApiV1PProjectIdStringsStringKeyTranslationsRequest,
  ): Promise<UpdateDraftTranslationsResponse> => {
    return this.projectsApi.patchAppApiV1PProjectIdStringsStringKeyTranslations(request);
  };

  publishSnapshot = (request: PostAppApiV1PProjectIdPublishRequest): Promise<PublishSnapshotResponse> => {
    return this.projectsApi.postAppApiV1PProjectIdPublish(request);
  };
}

export default ProjectsClient;
