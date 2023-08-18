import { DatosUsuario, Login } from '../types'

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`

export const autenticar = async (loginPayload: Login): Promise<string | null> => {
  try {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(loginPayload),
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const res = await fetch(`${API_URL}/autenticar`, requestOptions)
    if (res.status !== 200) {
      return null
    }
    const token = await res.json()

    return token || null
  } catch (e) {
    console.log(`error: ${e}`)
    return null
  }
}
