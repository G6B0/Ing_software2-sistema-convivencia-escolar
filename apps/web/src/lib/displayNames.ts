export function nombreAlumno(participante: any) {
  return participante?.nombreAlumno || participante?.alumno?.nombre || 'Alumno no especificado';
}

export function nombresAlumnos(participantes: any[] = []) {
  const nombres = participantes.map(nombreAlumno).filter(Boolean);
  return nombres.length > 0 ? nombres.join(', ') : 'Sin participantes';
}

export function nombreFuncionario(registro: any) {
  return (
    registro?.funcionarioResponsable?.nombre ||
    registro?.funcionarioNombre ||
    'Funcionario no especificado'
  );
}
