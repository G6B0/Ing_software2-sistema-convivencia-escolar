export interface MesData {
  mes: string;
  total: number;
  leve: number;
  moderado: number;
  grave: number;
}

export interface KpisAnuales {
  totalAnual: number;
  promedioMensual: number;
  mesMasCritico: string;
  mesMasGraves: string;
}

/**
 * Calcula los KPIs resumen del año a partir de los datos mensuales.
 * Retorna null si no hay datos o todos los meses tienen total === 0.
 */
export function calcularKpisAnuales(data: MesData[]): KpisAnuales | null {
  if (data.length === 0) return null;

  const totalAnual = data.reduce((sum, m) => sum + m.total, 0);
  if (totalAnual === 0) return null;

  const mesesConDatos = data.filter(m => m.total > 0).length;
  const promedioMensual = Math.round((totalAnual / mesesConDatos) * 10) / 10;

  // En empate de total, el que aparece último en el array
  let mesMasCritico = data[0];
  for (const m of data) {
    if (m.total >= mesMasCritico.total) {
      mesMasCritico = m;
    }
  }

  // En empate de grave, el que aparece último en el array
  let mesMasGraves = data[0];
  for (const m of data) {
    if (m.grave >= mesMasGraves.grave) {
      mesMasGraves = m;
    }
  }

  return {
    totalAnual,
    promedioMensual,
    mesMasCritico: mesMasCritico.mes,
    mesMasGraves: mesMasGraves.mes,
  };
}
