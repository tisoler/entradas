'use client'

import { useState } from "react"
import Spinner from "./spinner"
import { autenticar } from "../service/usuario"

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [usuario, setUsuario] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleAutenticar = async() => {
    setIsLoading(true)
    setError('')

    if (usuario || password) {
      const token = await autenticar({ usuario, password })

      if (!token) {
        setError('Usuario o contraseña incorrectos.')
      } else {
        onLogin(token || '')
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="w-3/4 flex m-auto items-center justify-around flex-col shadow-md sm:rounded-lg" style={{ height: '60vh' }}>
      <div className="w-full sm:w-11/12 md:w-8/12 flex items-center justify-center flex-col md:flex-row">
        <label className="block uppercase w-full md:w-4/12 tracking-wide text-gray-700 text-sm font-bold mr-2">Usuario:</label>
        <input
          onChange={(e) => setUsuario(e.target.value)}
          value={usuario}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="w-full sm:w-11/12 md:w-8/12 flex items-center justify-center flex-col md:flex-row">
        <label className="block uppercase w-full md:w-4/12 tracking-wide text-gray-700 text-sm font-bold mr-2">Contraseña:</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {error && <label className="block tracking-wide text-gray-700 text-sm text-red-500 font-bold mr-2">{error}</label>}
      <div className="w-full sm:w-11/12 md:w-10/12 flex items-center justify-center">
        <button
          className={`bg-${isLoading ? 'gray' : 'blue'}-500 hover:bg-${isLoading ? 'gray' : 'blue'}-700 text-white font-bold py-2 px-4 rounded w-full sm:w-11/12 md:w-8/12 h-20 m-2 flex justify-center items-center`}
          onClick={handleAutenticar}
        >
          {isLoading ? <Spinner /> : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

export default Login
