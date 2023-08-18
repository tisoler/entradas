import { recuperarToken } from "@/helpers"
import { Entrada } from "../types"

export interface EntradaError { error: string }

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`

export const getEntradas = async (): Promise<Entrada[] | null> => {
  try {
    const token = recuperarToken()
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || '',
      },
    }

    const res = await fetch(`${API_URL}/entrada`, requestOptions)
    if (res.status !== 200) {
      return null
    }
    const entradas = await res.json()

    return entradas
  } catch (e) {
    console.log(`error: ${e}`)
    return null
  }
}

export const updateEntrada = async (payload: Entrada): Promise<Entrada | null> => {
  try {
    const token = recuperarToken()
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || '',
      },
    }

    const res = await fetch(`${API_URL}/entrada`, requestOptions)
    if (res.status !== 200) {
      return null
    }
    const updatedEntrada = await res.json()

    return updatedEntrada
  } catch (e) {
    console.log(`error: ${e}`)
    return null
  }
}

export const createEntrada = async (payload: Entrada): Promise<Entrada | null | EntradaError> => {
  try {
    const token = recuperarToken()
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || '',
      },
    }

    const res = await fetch(`${API_URL}/entrada`, requestOptions)
    if (res.status !== 200) {
      const error = await res.json()
      return { error: error?.message }
    }
    const newEntrada = await res.json()

    return newEntrada
  } catch (e) {
    console.log(`error: ${e}`)
    return null
  }
}
