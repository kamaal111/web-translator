import { Conflict, NotFound } from '../exceptions';
import type { HonoContext } from '../context';

export class ProjectNameAlreadyExists extends Conflict {
  constructor(c: HonoContext) {
    super(c, {
      message: 'A project with this name already exists',
      code: 'PROJECT_NAME_ALREADY_EXISTS',
      name: 'ProjectNameAlreadyExists',
    });
  }
}

export class ProjectNotFound extends NotFound {
  constructor(c: HonoContext) {
    super(c, {
      message: 'Project not found',
      name: 'ProjectNotFound',
    });
  }
}

export class ProjectVersionNotFound extends NotFound {
  constructor(c: HonoContext) {
    super(c, {
      message: 'Project version not found',
      name: 'ProjectVersionNotFound',
    });
  }
}
