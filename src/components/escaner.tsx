'use client'
import { useEffect, useRef, useState } from 'react'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { Entrada } from '../types'
import { getEntradas, updateEntrada } from '../service/entrada'

interface Person {
	dni: number,
	nombre: string,
}

interface EscanerProps {
	mostrarEscaner: (value: boolean) => void,
}

const Escaner = ({ mostrarEscaner }: EscanerProps) => {
	const [entradas, setEntradas] = useState<Entrada[] | null>()
  const [entrada, setEntrada] = useState<Entrada | null>()
	const [errorLectorQR, setErrorLectorQR] = useState<boolean>(false)
	const [notificacion, setNotificacion] = useState<string>('')
	const intervalId = useRef<number>(0)

  useEffect(() => {
    const getAllEntradas = async () => {
      const res = await getEntradas()
      setEntradas(res)
    }

		intervalId.current = window.setInterval(() => getAllEntradas(), 5000)
    
		return () => window.clearInterval(intervalId.current)
  }, [])

	const handleDecode = async (result: string) => {
		setErrorLectorQR(false)
		setNotificacion('')
		try {
			const person: Person = JSON.parse(result?.replace(/(\r\n|\n|\r)/gm, ""))
			const entrada = entradas?.find((e: Entrada) => e.dni === person.dni) || false

			if (entrada) {
				if (!entrada.verificada) {
					// Guardar en BD
					const updatedEntrada = await updateEntrada({
						...entrada,
						verificada: true,
					})
					// Actualizar state de entrada actual
					setEntrada(updatedEntrada || entrada)
				} else {
					setNotificacion('La entrada ya fue registrada.')
				}				
			} else {
				setEntrada(null)
			}

			setErrorLectorQR(!entrada)
		} catch (e) {
			setErrorLectorQR(true)
			setEntrada(null)
		}
	}

  return (
    <>
			{ !entrada ? (
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', }}>
					<QrScanner
						onDecode={handleDecode}
						onError={(error) => {
							setErrorLectorQR(true)
							console.log(error?.message)
						}}
					/>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '20px', }}>
						{ errorLectorQR && <p className='text-red-500 text-center font-bold'>{'El QR es incorrecto o no está en la base de datos.'}</p> }
						{ notificacion && <p className='text-red-500 text-center font-bold'>{notificacion}</p> }
						<button 
							onClick={() => mostrarEscaner(false)}
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-24 mt-3"
						>
							{'< Volver'}
						</button>
					</div>
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', }}>
					<p style={{ marginBottom: '25px', textAlign: 'center' }}>
						{`
							Nombre: ${entrada?.nombre} -
							DNI: ${entrada?.dni} -
							Pagada: ${entrada.pagada ? 'Sí' : 'No'} -
							Verificada: Sí
						`}
					</p>
					<button 
						onClick={() => setEntrada(null)}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-48"
					>
						Escaner
					</button>
				</div>
			)}
    </>
  )
}

export default Escaner
