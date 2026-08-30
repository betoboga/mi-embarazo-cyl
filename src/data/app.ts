export interface PregnancyProfile {
  municipalityId: string;
  zbsCode: string;
  week: number;
}

export const pregnancyWeeks = Array.from({ length: 41 }, (_, index) => index);

export function getWeekLabel(week: number) {
  return week === 0 ? 'Aún no lo sé' : `Semana ${week}`;
}

export function isValidWeek(week: number) {
  return Number.isInteger(week) && week >= 0 && week <= 40;
}
