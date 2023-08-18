export type Entrada = {
	id?: number,
	nombre: string,
	dni: number,
	pagada: boolean,
	verificada: boolean,
}

export interface DatosUsuario {
	idUsuario: number,
  usuario: string,
	scope: string[]
}

export interface Login {
  usuario: string,
  password: string,
}
