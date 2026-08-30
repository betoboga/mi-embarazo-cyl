export interface HealthResource {
  id: string;
  name: string;
  type: string;
  municipality: string;
  province: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  zbs?: string;
}

/**
 * Recursos iniciales verificados durante el modelado de los datasets.
 * Esta capa queda preparada para sustituir los datos de prueba por los
 * registros completos procesados desde public/data/raw/.
 */
export const resources: HealthResource[] = [];

export function resourcesForZbs(codigo: string) {
  return resources.filter((resource) => resource.zbs === codigo);
}
