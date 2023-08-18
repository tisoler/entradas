'use client'

import { useEffect, useMemo, useState } from 'react'
import Escaner from './escaner'
import List from './list'
import { DatosUsuario } from '../types'
import GeneradorEntrada from './generadorEntrada'
import { guardarToken, recuperarUsuario, removerToken } from '../helpers'
import Login from './login'
import { PERMISOS } from '@/constants'

export default function Lobby() {
  const [showEscaner, setShowEscaner] = useState<boolean>(false)
  const [cargando, setCargando] = useState<boolean>(true)
  const [showList, setShowList] = useState<boolean>(false)
  const [showGenerador, setShowGenerador] = useState<boolean>(false)
  const [usuario, setUsuario] = useState<DatosUsuario | null>()

  useEffect(() => {
    const usuarioAutenticado = recuperarUsuario()
    if (usuarioAutenticado) setUsuario(usuarioAutenticado)
    setCargando(false)
  }, [])

  const mostrarEscaner = (value: boolean) => setShowEscaner(value)
  const mostrarList = (value: boolean) => setShowList(value)
  const mostrarGenerador = (value: boolean) => setShowGenerador(value)

  const handleActualizarToken = (token: string) => {
    guardarToken(token)
    const usuarioAutenticado = recuperarUsuario()
    if (usuarioAutenticado) setUsuario(usuarioAutenticado)
  }

  const handleLogout = () => {
    removerToken()
    setUsuario(null)
  }

  const esVendedorOAdmin = useMemo(() => {
    return usuario?.scope?.includes(PERMISOS.ESCRIBIR_ENTRADA)
  }, [usuario])

  if (showEscaner) return <Escaner mostrarEscaner={mostrarEscaner} />
  if (showList && usuario?.idUsuario) return <List mostrarList={mostrarList} />
  if (showGenerador && usuario?.idUsuario) return <GeneradorEntrada mostrarGenerador={mostrarGenerador} />

  if (cargando) return <span>Cargando...</span>
  if (!usuario) return <Login onLogin={handleActualizarToken} />

  return (
    <>
      <div style={{ display: 'inline-block', textAlign: 'center', }}>
        {usuario.idUsuario && usuario.usuario && (
          <div className="absolute right-5 top-5 flex items-center justify-center text-blue-500 w-25">
            Hola {usuario.usuario}!
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`absolute right-5 ${usuario.idUsuario ? 'top-10' : 'top-5'} flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full w-16 h-16 m-2`}
        >
          {usuario.idUsuario ? 'logout' : 'login'}
        </button>
        { esVendedorOAdmin && (
          <button 
            onClick={() => mostrarEscaner(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-48 m-2"
          >
            Escaner
          </button>
        )}
        <button
          onClick={() => mostrarList(true)}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${esVendedorOAdmin ? 'w-5/12' : 'w-full'} h-48 m-2`}
        >
          Listado
        </button>
        { esVendedorOAdmin && (
          <button
            onClick={() => mostrarGenerador(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-6/12 h-48 m-2"
          >
            Nueva entrada
          </button>
        )}
      </div>
    </>
  )
}
