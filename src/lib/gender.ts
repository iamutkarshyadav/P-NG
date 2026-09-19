import type { Gender } from '../types/user';

/** UI labels ('NON-BINARY') <-> database enum values ('non_binary'). */
export type GenderLabel = 'WOMAN' | 'MAN' | 'NON-BINARY' | 'OTHER';

export const toDbGender = (label: string): Gender =>
  label.toLowerCase().replace('-', '_') as Gender;

export const toGenderLabel = (gender: Gender): GenderLabel =>
  gender.toUpperCase().replace('_', '-') as GenderLabel;
