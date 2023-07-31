'use client'

import { getEntradas } from '../service/entrada'
import { useEffect, useState } from 'react'
import Escaner from './escaner'
import List from './list'
import { Entrada } from '../types'
import GeneradorEntrada from './generadorEntrada'

export default function Lobby() {
  const [entradas, setEntradas] = useState<Entrada[] | null>(null)
  const [showEscaner, setShowEscaner] = useState<boolean>(false)
  const [showList, setShowList] = useState<boolean>(false)
  const [showGenerador, setShowGenerador] = useState<boolean>(false)

  useEffect(() => {
    const getAllEntradas = async () => {
      const res = await getEntradas()
      setEntradas(res)
    }

    getAllEntradas()
  }, [])

  const mostrarEscaner = (value: boolean) => setShowEscaner(value)
  const mostrarList = (value: boolean) => setShowList(value)
  const mostrarGenerador = (value: boolean) => setShowGenerador(value)

  if (showEscaner) return <Escaner mostrarEscaner={mostrarEscaner} entradasIniciales={entradas} />
  if (showList) return <List mostrarList={mostrarList} />
  if (showGenerador) return <GeneradorEntrada mostrarGenerador={mostrarGenerador} />

  return (
    <>
      {
        entradas ? (
          <div style={{ display: 'inline-block', textAlign: 'center', }}>
            <button 
              onClick={() => mostrarEscaner(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-48 m-2"
            >
              Escaner
            </button>
            <button
              onClick={() => mostrarList(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-48 m-2"
            >
              Listado
            </button>
            <button
              onClick={() => mostrarGenerador(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-6/12 h-48 m-2"
            >
              Nueva entrada
            </button>
          </div>
        ) : (
          <span>Cargando...</span>
        )
      }
    </>
  )
}
