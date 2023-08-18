import { DatosUsuario } from "../types"
import jwtDecode from "jwt-decode"

export const guardarToken = (token: string) => {
  localStorage.setItem('token', token)
}

export const recuperarToken = (): string | null => {
  return localStorage.getItem('token')
}

export const recuperarUsuario = (): DatosUsuario | null => {
  const token = localStorage.getItem('token')
  if (!token) return null
  const datosUsuario: DatosUsuario = jwtDecode(token)
  return datosUsuario
}

export const removerToken = () => {
  localStorage.removeItem('token')
}
