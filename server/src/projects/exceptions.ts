import { Conflict } from '../exceptions';
import type { HonoContext } from '../context';

export class ProjectNameAlreadyExists extends Conflict {
  constructor(c: HonoContext) {
    super(c, {
      message: 'A project with this name already exists',
      code: 'PROJECT_NAME_ALREADY_EXISTS',
    });
    this.name = 'ProjectNameAlreadyExists';
  }
}
