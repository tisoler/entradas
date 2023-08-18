'use client'

import { useEffect, useRef, useState } from 'react'
import { Entrada } from '../types'
import { getEntradas, updateEntrada } from '@/service/entrada'
import Notificacion from './notificacion'
import GeneradorEntrada from './generadorEntrada'

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
			const listaEntradas = await getEntradas() || []
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
		<div className='w-full2 md:w-11/12 lg:w-10/12 xl:w-8/12 flex flex-col items-center justify-center'>
			<div className="relative flex flex-col items-start overflow-x-auto shadow-md sm:rounded-lg overflow-y-hidden w-full">
				<div className='flex mb-3 justify-around w-full'>
					<div className='flex flex-col w-5/12'>
						<span>DNI</span>
						<input
							type='number'
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
							value={buscarDNI || ''}
							onChange={(e) => handleBuscarDNI(e?.target?.value)}
						/>
					</div>
					<div className='flex flex-col w-5/12'>
						<span>Nombre</span>
						<input
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
							value={buscarNombre}
							onChange={(e) => handleBuscarNombre(e?.target?.value)}
						/>
					</div>
				</div>
				{
					entradas ? (
						<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
							<thead className="block table-fixed text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr className="block">
									<th scope="col" className="px-6 py-3 inline-block w-4/12">
										DNI
									</th>
									<th scope="col" className="px-6 py-3 inline-block w-4/12">
										Nombre
									</th>
									<th scope="col" className="px-6 py-3 inline-block w-2/12">
										Pagada
									</th>
									<th scope="col" className="px-6 py-3 inline-block w-2/12">
										Verif
									</th>
								</tr>
							</thead>
							<tbody className="block table-fixed overflow-y-auto" style={{ height: '55vh' }}>
								{
									entradasFiltradas?.map((entrada: Entrada) => (
										<tr
											key={entrada.id}
											className="block bg-white border-b dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
										>
											<td
												scope="row"
												className="inline-block w-4/12 px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 "
												onClick={() => setEntradaSeleccionada(entrada)}
											>
												{entrada.dni}
											</td>
											<td
												className={`px-6 py-4 inline-block w-4/12 hover:bg-gray-50 dark:hover:bg-gray-600`}
												onClick={() => setEntradaSeleccionada(entrada)}
											>
												{entrada.nombre}
											</td>
											<td
												className={`px-6 py-4 inline-block text-center w-2/12 bg-${entrada.pagada ? 'green-700' : 'orange-500'} active:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}
												onClick={() => handleUpdateEntrada(entrada.id || 0, 'pagada')}
											>
												{entrada.pagada ? 'Sí' : 'No'}
											</td>
											<td
												className={`px-6 py-4 inline-block text-center w-2/12 bg-${entrada.verificada ? 'green-700' : 'orange-500'} active:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}
												onClick={() => handleUpdateEntrada(entrada.id || 0, 'verificada')}
												>
													{entrada.verificada ? 'Sí' : 'No'}
											</td>
										</tr>
									))
								}
							</tbody>
						</table>
					) : (
						<div className='w-full flex justify-center items-center' style={{ height: '55vh' }}>
							<span>Cargando...</span>
						</div>
					)
				}
				
			</div>
			<div className='flex w-full justify-center items-center mt-3'>
				<button 
					onClick={() => mostrarList(false)}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-6/12 h-20"
				>
					{'< Volver'}
				</button>
				<div className='text-gray-700 flex flex-col pl-3 w-6/12'>
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
