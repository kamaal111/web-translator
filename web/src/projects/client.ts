import { ProjectApi } from '@/generated/api-client/src/apis/ProjectApi';
import type { Configuration } from '@/generated/api-client/src/runtime';
import type { CreateProjectPayload } from '@/generated/api-client/src';

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

  read = (id: string) => {
    return this.projectsApi.getAppApiV1PId({ id });
  };
}

export default ProjectsClient;
