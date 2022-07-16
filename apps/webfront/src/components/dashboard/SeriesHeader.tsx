import { css, cx } from '@emotion/css'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { IoAlbumsOutline } from 'react-icons/io5'
import {
	CreateUserSeriesMutationVariables,
	useCreateUserSeriesMutation,
} from 'src/graphql/generated'
import usePush from 'src/utils/hooks/usePush'
import { Button, emitToast, Heading } from 'ui/src'

const defaults = {
	name: '',
	description: '',
}

const CreateSeriesModal = ({
	open,
	handleClose,
}: {
	open: boolean
	handleClose: (refresh?: boolean) => void
}) => {
	const [details, setDetails] =
		useState<CreateUserSeriesMutationVariables>(defaults)
	const [createSeries, { data, loading }] = useCreateUserSeriesMutation()

	const push = usePush()

	const handleCreate = async () => {
		try {
			await createSeries({ variables: details })
		} catch (e) {
			emitToast('Could not create your series.Please try again', {
				type: 'error',
			})
		}
	}

	useEffect(() => {
		if (!data) return
		emitToast('Series created successfully', {
			type: 'error',
		})
		push(`/series/${details.name}--${data?.CreateSeries?.id}?new=true`)
		setDetails(defaults)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog
				onClose={() => {
					setDetails(defaults)
					handleClose()
				}}
			>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black/60' aria-hidden='true' />
				</Transition.Child>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0 scale-95'
					enterTo='opacity-100 scale-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100 scale-100'
					leaveTo='opacity-0 scale-95'
				>
					<div className='fixed inset-0 flex items-center justify-center p-4'>
						<Dialog.Panel className='flex flex-col relative rounded-sm w-[35%] max-h-[80%] bg-dark-200 px-4 py-5'>
							<form
								className={cx(
									'flex flex-col w-full',
									css`
										height: 50vh;
									`
								)}
							>
								<Heading textStyle='mediumTitle' className='py-2 text-gray-100'>
									Let&apos;s create a series
								</Heading>
								<span className='mt-4 text-size-sm font-bold tracking-wide text-gray-100 font-main'>
									Name your series
								</span>
								<input
									value={details.name}
									onChange={e => {
										setDetails({ ...details, name: e.currentTarget.value })
									}}
									placeholder='Series name'
									className='focus:border-green-600 w-full rounded-sm bg-dark-400 border border-transparent py-2.5 px-3 mt-1.5 focus:outline-none text-gray-100 text-size-sm'
								/>
								<span className='mt-4 text-size-sm font-bold tracking-wide text-gray-100 font-main'>
									Describe your series
								</span>
								<textarea
									value={details.description}
									onChange={e =>
										setDetails({
											...details,
											description: e.currentTarget.value,
										})
									}
									placeholder='Description (optional)'
									className='w-full bg-dark-400 border border-transparent rounded-md py-3 px-3 mt-1.5 focus:outline-none focus:ring-0 focus:border-green-600 text-gray-100 text-size-sm flex-1 resize-none'
								/>
								<Button
									type='submit'
									className='mt-6 w-full max-w-none'
									size='large'
									loading={loading}
									disabled={!details.name}
									onClick={() => {
										if (!details.name) return
										handleCreate()
									}}
								>
									Create
								</Button>
							</form>
						</Dialog.Panel>
					</div>
				</Transition.Child>
			</Dialog>
		</Transition>
	)
}

const SeriesHeader = ({ refresh }: { refresh: () => void }) => {
	const [openCreate, setOpenCreate] = useState(false)

	return (
		<div>
			<Button
				onClick={() => {
					setOpenCreate(true)
				}}
				leftIcon={<IoAlbumsOutline size={14} />}
			>
				Create New
			</Button>
			{openCreate && (
				<CreateSeriesModal
					open={openCreate}
					handleClose={shouldRefresh => {
						setOpenCreate(false)
						if (shouldRefresh) refresh()
					}}
				/>
			)}
		</div>
	)
}

export default SeriesHeader