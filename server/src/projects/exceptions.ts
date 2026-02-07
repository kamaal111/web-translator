import { Conflict, NotFound } from '../exceptions';
import type { HonoContext } from '../context';

export class ConcurrentModificationException extends Conflict {
  constructor(
    c: HonoContext,
    options: {
      message: string;
      conflictDetails: {
        locale: string;
        lastModifiedAt: string;
        lastModifiedBy: {
          id: string;
          name: string;
        };
      };
    },
  ) {
    super(c, {
      message: options.message,
      code: 'CONCURRENT_MODIFICATION',
      name: 'ConcurrentModificationException',
      context: { conflictDetails: options.conflictDetails },
    });
  }
}

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

export class StringNotFound extends NotFound {
  constructor(c: HonoContext) {
    super(c, {
      message: 'String not found',
      name: 'StringNotFound',
    });
  }
}
