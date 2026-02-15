import type { StringResponse } from '@/generated/api-client/src';

export const mockStrings: StringResponse[] = [
  {
    id: 'str_1',
    key: 'HOME.TITLE',
    context: 'Main page heading',
    projectId: 'proj_test',
    translations: { en: 'Home', es: 'Inicio', fr: 'Accueil' },
  },
  {
    id: 'str_2',
    key: 'HOME.SUBTITLE',
    context: null,
    projectId: 'proj_test',
    translations: { en: 'Welcome to our app', es: 'Bienvenido a nuestra aplicación' },
  },
  {
    id: 'str_3',
    key: 'NAV.LOGOUT',
    context: 'Navigation logout button',
    projectId: 'proj_test',
    translations: { en: 'Logout', es: 'Cerrar sesión', fr: 'Déconnexion' },
  },
];

export const mockEmptyStrings: StringResponse[] = [];
