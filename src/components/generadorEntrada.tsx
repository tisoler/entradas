'use client'

import { EntradaError, createEntrada } from '../service/entrada'
import { Entrada } from '../types'
import html2canvas from 'html2canvas'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import ImagenEntrada from '../assets/entrada.jpeg'
import './generadorEntrada.css'

interface GeneradorProps {
	mostrarGenerador: (value: boolean) => void,
  entradaExistente?: Entrada | null,
}

interface DatosEntrada {
  dni: number | null,
  nombre: string,
  pagada: boolean,
  verificada: boolean,
}

export default function GeneradorEntrada({ mostrarGenerador, entradaExistente = null, }: GeneradorProps) {
  const [datosNuevaEntrada, setDatosNuevaEntrada] = useState<DatosEntrada>({
    dni: null,
    nombre: '',
    pagada: false,
    verificada: false,
  })
  const [entrada, setEntrada] = useState<Entrada | null>(entradaExistente)
  const [notificacion, setNotificacion] = useState<string>('')
  const [cargando, setCargando] = useState<boolean>(false)
  const [linkDescarga, setLinkDescarga] = useState<string>('')
  const divEntrada = useRef(null)

  useEffect(() => {
    if (!divEntrada.current || (!entrada)) return
    setCargando(true)
    html2canvas(divEntrada.current).then(function (canvas) {
      const linkUrl = canvas.toDataURL('image/png')
      setLinkDescarga(linkUrl)
    })
    setCargando(false)
  }, [entrada])

  const handlerChangeDni = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value
    if (!value || isNaN(value as any)) return

    setDatosNuevaEntrada({
      ...datosNuevaEntrada,
      dni: parseInt(value),
    })
  }

  const handlerChangeNombre = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value
    if (!value) return

    setDatosNuevaEntrada({
      ...datosNuevaEntrada,
      nombre: value,
    })
  }

  const handlerChangePagada = () => {
    setDatosNuevaEntrada({
      ...datosNuevaEntrada,
      pagada: !datosNuevaEntrada.pagada,
    })
  }

  const handleGenerarEntrada = async() => {
    setCargando(true)
    if(!datosNuevaEntrada.dni) {
      setNotificacion('Debes ingresar un DNI.')
      setCargando(false)
      return
    }

    setNotificacion('')
    const nuevaEntrada = await createEntrada(datosNuevaEntrada as Entrada)
    setCargando(false)

    if (nuevaEntrada?.hasOwnProperty('error')) {
      setNotificacion((nuevaEntrada as EntradaError).error)
      return
    }
    // Habilita el componente QRCode y el contenedor con la imagen de la entrada.
    setEntrada(nuevaEntrada as Entrada)
  }

  const handleDescargar = async() => {
    if (!divEntrada.current || (!entrada)) return
    setCargando(true)
  
    const canvas = await html2canvas(divEntrada.current)
    const link = document.createElement('a')
    link.download = `${entrada.dni}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  
    setCargando(false)
  }

  const getJsonEntrada = (): string => {
    if (!entrada) return '{}'
    return `{ "nombre": "${entrada.nombre || ''}", "dni": ${entrada.dni} }`
  }

  const handleIngresarOtra = () => {
    setNotificacion('')
    setDatosNuevaEntrada({
      ...datosNuevaEntrada,
      dni: null,
      nombre: '',
    })
    setEntrada(null)
    setLinkDescarga('')
  }

  const handleCompartir = async () => {
    if (!divEntrada.current) return
    const canvas = await html2canvas(divEntrada.current)
    canvas.toBlob(async (newFile) => {
      if (!newFile) return
      const data = {
        files: [
          new File([newFile], 'image.png', {
            type: newFile.type,
          }),
        ],
        title: 'Image',
        text: 'image',
      }
      try {
        await navigator.share(data)
      } catch (err) {
        console.error(err)
        alert(err)
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
      { !entrada && (
        <>
          <span>DNI</span><input type='number' onChange={(e) => handlerChangeDni(e)} className='inputDato' />
          <span>Nombre</span><input onChange={(e) => handlerChangeNombre(e)} className='inputDato' />
          <span>Pagada</span>
          <label className="switch">
            <input type="checkbox" checked={datosNuevaEntrada.pagada} onChange={handlerChangePagada} />
            <span className="slider round"></span>
          </label>
        </>
      )}
      <span style={{ marginTop: '20px', }}>{notificacion}</span>
      { entrada && (
        <div 
          ref={divEntrada}
          style={{ background: `url(${ImagenEntrada?.src})`, }}
          className='entrada'
        >
          <div className='contenedorQRDatos'>
            <div className='bordeQrCode'>
              <QRCode
                size={256}
                style={{
                  height: "auto",
                  width: '99%',
                }}
                value={getJsonEntrada()}
                viewBox={`0 0 256 256`}
              />
            </div>
            <div className='datosPersona'>{entrada.nombre} - DNI: {entrada.dni}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', height: '100%', marginTop: '20px', }}>
        { linkDescarga && (
          <button 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20"
            onClick={handleCompartir}
          >
            Compartir
          </button>
        )}
        { entrada && (
          <button 
            className={`bg-${cargando ? 'gray' : 'red'}-500 hover:bg-${cargando ? 'gray' : 'red'}-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20`}
            onClick={handleDescargar}
            disabled={cargando}
          >
            { cargando ? 'Cargando...' : 'Descargar entrada' }
          </button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', height: '100%', marginTop: '20px', }}>
        { !entrada && (
          <button 
            className={`bg-${cargando ? 'gray' : 'blue'}-500 hover:bg-${cargando ? 'gray' : 'blue'}-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20`}
            onClick={handleGenerarEntrada}
            disabled={cargando}
          >
            { cargando ? 'Cargando...' : 'Generar entrada' }
          </button>
        )}
        { entrada && (
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20"
            onClick={handleIngresarOtra}
          >
            Ingresar otra
          </button>
        )}
        <button 
          onClick={() => mostrarGenerador(false)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20"
        >
          {'< Volver'}
        </button>
      </div>
    </div>
  )
}
