'use client'

import { useEffect, useRef, useState } from 'react'
import { Entrada } from '../types'
import { getEntradas, updateEntrada } from '@/service/entrada'
import Notificacion from './notificacion'
import GeneradorEntrada from './generadorEntrada'
import './list.css'

interface ListProps {
	mostrarList: (value: boolean) => void,
}

const List = ({ mostrarList }: ListProps) => {
	const [entradas, setEntradas] = useState<Entrada[] | null>(null)
	const [entradasFiltradas, setEntradasFiltradas] = useState<Entrada[] | null>(null)
	const [openDialog, setOpenDialog] = useState<boolean>(false)
	const [entradaToUpdate, setEntradaToUpdate] = useState<{ id: Number, campo: string } | null>(null)
  const [entradaSeleccionada, setEntradaSeleccionada] = useState<Entrada | null>(null)
	const [buscarNombre, setBuscarNombre] = useState<string>('')
	const [buscarDNI, setBuscarDNI] = useState<number | null>(null)
	const intervalId = useRef<number>(0)

	interface CamposFiltroEntradas {
		valorNombre?: string,
		valorDNI?: number,
		listaEntradas?: Entrada[] | null,
	}

	const filtrarEntradas = (filtros: CamposFiltroEntradas) => {
		const { valorNombre = buscarNombre, valorDNI = buscarDNI, listaEntradas = entradas } = filtros

		if (!listaEntradas) return 
		setEntradasFiltradas(
			listaEntradas?.filter(
				(e: Entrada) => 
					e?.nombre.toLowerCase().includes(valorNombre.toLowerCase())
					&& (!valorDNI || e?.dni.toString().includes(valorDNI?.toString()))
			) || []
		)
	}

  useEffect(() => {
		const getAllEntradas = async () => {
			const listaEntradas = await getEntradas()
			setEntradas(listaEntradas)
			filtrarEntradas({ listaEntradas })
		}
	
		intervalId.current = window.setInterval(() => {
			getAllEntradas()
		}, 5000)

		getAllEntradas()
    
		return () => window.clearInterval(intervalId.current)
  }, [buscarNombre, buscarDNI])

	const handleUpdateEntrada = (id: number, campo: string) => {
		setEntradaToUpdate({ id, campo })
		setOpenDialog(true)
	}

	const handleCancelUpdate = () => {
		setEntradaToUpdate(null)
		setOpenDialog(false)
	}

	const handleConfirmUpdate = async () => {
		const entrada = entradas?.find(e => e.id === entradaToUpdate?.id)
		if (entrada) {
			// Update DB
			const updatedEntrada = await updateEntrada({
				...entrada,
				pagada: entradaToUpdate?.campo === 'pagada' ? !entrada.pagada : entrada.pagada,
				verificada: entradaToUpdate?.campo === 'verificada' ? !entrada.verificada : entrada.verificada,
			})

			// Update state
			const nuevaListaEntrada = entradas?.map(e => {
				if (e?.id && updatedEntrada?.id === e.id) {
					return updatedEntrada
				} else {
					return e
				}
			}) || []
			setEntradas(nuevaListaEntrada)
			filtrarEntradas({ listaEntradas: nuevaListaEntrada })
		}

		setOpenDialog(false)
	}

	if (entradaSeleccionada) {
		return <GeneradorEntrada mostrarGenerador={() => setEntradaSeleccionada(null)} entradaExistente={entradaSeleccionada} />
	}

	const handleBuscarNombre = (value: string) => {
		setBuscarNombre(value)
	}

	const handleBuscarDNI = (value: string) => {
		if (isNaN(value as any)) {
			setBuscarDNI(null)
			return
		}

		const nuevoValorDNI = parseInt(value)
		setBuscarDNI(nuevoValorDNI)
	}

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<div  style={{ display: 'flex'}}>
				<div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
					<span>DNI</span>
					<input type='number' className='inputDato' value={buscarDNI || ''} onChange={(e) => handleBuscarDNI(e?.target?.value)} />
				</div>
				<div style={{ width: '55%', display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
					<span>Nombre</span>
					<input className='inputDato' value={buscarNombre} onChange={(e) => handleBuscarNombre(e?.target?.value)} />
				</div>
			</div>
			<div className="flex" style={{ width: '100%', borderBottom: '1px black solid', marginTop: '10px', }}>
				<div className="w-3/12 bg-gray-500 h-8" style={{ textAlign: 'center' }}>DNI</div>
				<div className="w-5/12 bg-gray-400 h-8" style={{ textAlign: 'center' }}>Nombre</div>
				<div className={`w-2/12 bg-gray-500 h-8`} style={{ textAlign: 'center' }}>Pag</div>
				<div className={`w-2/12 bg-gray-400 h-8`} style={{ textAlign: 'center' }}>Verif</div>
			</div>
			<div
				style={{
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					overflowY: 'auto',
					height: '57vh',
					marginBottom: '5px',
				}}
			>
				{ entradasFiltradas?.map((entrada: Entrada) => (
					<div key={entrada.id} className="flex mt-2" style={{ width: '100%' }}>
						<div
							className="w-3/12 bg-gray-500 h-10"
							onClick={() => setEntradaSeleccionada(entrada)}
						>
							{entrada.dni}
						</div>
						<div
							className="w-5/12 bg-gray-400 h-10"
							onClick={() => setEntradaSeleccionada(entrada)}
						>
							{entrada.nombre}
						</div>
						<div
							className={`w-2/12 ${entrada.pagada ? 'bg-green-500' : 'bg-gray-500'} h-10`}
							style={{ textAlign: 'center' }}
							onClick={() => handleUpdateEntrada(entrada.id || 0, 'pagada')}
						>
							{entrada.pagada ? 'Sí' : 'No'}
						</div>
						<div
							className={`w-2/12 ${entrada.verificada ? 'bg-green-400' : 'bg-gray-400'} h-10`}
							style={{ textAlign: 'center' }}
							onClick={() => handleUpdateEntrada(entrada.id || 0, 'verificada')}
						>
							{entrada.verificada ? 'Sí' : 'No'}
						</div>
					</div>
				))}
			</div>
			<div style={{ display: 'flex', width: '100%', }}>
				<button 
					onClick={() => mostrarList(false)}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-5/12 h-20"
				>
					{'< Volver'}
				</button>
				<div className='text-gray-700' style={{ display: 'flex', flexDirection: 'column', width: '60%', paddingLeft: '15px' }}>
					<span>{`Total vendidas: ${entradas?.length || 0}`}</span>
					<span>{`Total pagadas: ${entradas?.filter(e => e.pagada).length || 0}`}</span>
					<span>{`Total verificadas: ${entradas?.filter(e => e.verificada).length || 0}`}</span>
				</div>
			</div>
			<Notificacion open={openDialog} handleCancel={handleCancelUpdate} handleConfirm={handleConfirmUpdate} />
    </div>
  )
}

export default List
