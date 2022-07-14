/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { cx } from '@emotion/css'
import { Dialog, Listbox } from '@headlessui/react'
import { useEffect, useMemo, useState } from 'react'
import { IconType } from 'react-icons'
import { BiCheck } from 'react-icons/bi'
import { BsCloudCheck, BsCloudUpload } from 'react-icons/bs'
import { FiLoader } from 'react-icons/fi'
import {
	IoAddOutline,
	IoChevronDownOutline,
	IoChevronUpOutline,
	IoColorPaletteOutline,
	IoPlayOutline,
	IoShapesOutline,
	IoTabletLandscapeOutline,
	IoTextOutline,
	IoTrashOutline,
} from 'react-icons/io5'
import useMeasure from 'react-use-measure'
import { useRecoilValue } from 'recoil'
import {
	useCreateBrandingMutation,
	useDeleteBrandingMutation,
	useGetBrandingQuery,
	useUpdateBrandingMutation,
} from 'src/graphql/generated'
import { activeBrandIdAtom } from 'src/stores/studio.store'
import { BrandingInterface, BrandingJSON } from 'src/utils/configs'
import useDidUpdateEffect from 'src/utils/hooks/useDidUpdateEffect'
import { loadFonts } from 'src/utils/hooks/useLoadFont'
import { useUser } from 'src/utils/providers/auth'
import BrandIcon from 'svg/BrandIcon.svg'
import { Button, Heading, Text } from 'ui/src'
import { useDebouncedCallback } from 'use-debounce'
import BackgroundSetting from './BackgroundSetting'
import BrandPreview from './BrandPreview'
import ColorSetting from './ColorSetting'
import FontSetting from './FontSetting'
import LogoSetting from './LogoSetting'
import SplashVideoSetting from './SplashVideoSetting'

const initialValue: BrandingJSON = {
	font: {
		heading: {
			family: 'Gilroy',
			type: 'custom',
		},
		body: {
			family: 'Inter',
			type: 'custom',
		},
	},
}

interface Tab {
	name: string
	id: string
	Icon: IconType
}

const tabs: Tab[] = [
	{
		id: 'Logo',
		name: 'Logo',
		Icon: IoShapesOutline,
	},
	{
		id: 'Background',
		name: 'Background',
		Icon: IoTabletLandscapeOutline,
	},
	{
		id: 'Color',
		name: 'Color',
		Icon: IoColorPaletteOutline,
	},
	{
		id: 'Font',
		name: 'Font',
		Icon: IoTextOutline,
	},
	{
		id: 'SplashVideo',
		name: 'Splash Videos',
		Icon: IoPlayOutline,
	},
]

const Branding = ({
	open,
	handleClose,
}: {
	open: boolean
	handleClose: () => void
}) => {
	const [ref, bounds] = useMeasure()

	const activeBrandId = useRecoilValue(activeBrandIdAtom)

	const [brandingId, setBrandingId] = useState<string>(activeBrandId ?? '')
	const [activeTab, setActiveTab] = useState<Tab>(tabs[0])

	const [brandings, setBrandings] = useState<BrandingInterface[]>([])

	const { user } = useUser()

	const {
		data,
		loading: fetching,
		refetch,
	} = useGetBrandingQuery({
		variables: {
			_eq: user?.uid as string,
		},
	})

	const branding = useMemo(
		() => brandings.find(b => b.id === brandingId),
		[brandings, brandingId]
	)

	const [createBranding, { loading }] = useCreateBrandingMutation()

	const [deleteBrandingMutation, { loading: deletingBrand }] =
		useDeleteBrandingMutation()
	const deleteBranding = async () => {
		if (!branding) return
		await deleteBrandingMutation({
			variables: {
				id: branding.id,
			},
		})
		refetch()
	}

	const [updateBranding, { loading: updatingBrand }] =
		useUpdateBrandingMutation()

	useEffect(() => {
		loadFonts([
			{
				family: branding?.branding?.font?.heading?.family as string,
				weights: ['400'],
				type: branding?.branding?.font?.heading?.type || 'custom',
				url: branding?.branding?.font?.heading?.url,
			},
			{
				family: branding?.branding?.font?.body?.family as string,
				weights: ['400'],
				type: branding?.branding?.font?.body?.type || 'custom',
				url: branding?.branding?.font?.body?.url,
			},
		])
	}, [branding])

	useEffect(() => {
		setBrandings(data?.Branding || [])

		if (!brandingId || !data?.Branding.find(b => b.id === brandingId)) {
			setBrandingId(data?.Branding?.[0]?.id)
		}
	}, [brandingId, data])

	const handleCreateBranding = async () => {
		const { data: createData } = await createBranding({
			variables: { name: 'Untitled Branding', branding: initialValue },
		})
		await refetch()
		setBrandingId(createData?.insert_Branding_one?.id)
	}

	const handleSave = async (cache?: boolean) => {
		if (!branding) return
		await updateBranding({
			fetchPolicy: cache ? 'network-only' : 'no-cache',
			variables: {
				branding: branding.branding,
				name: branding.name,
				id: branding.id,
			},
		})
	}

	const debounced = useDebouncedCallback(() => {
		handleSave()
	}, 1000)

	useDidUpdateEffect(() => {
		debounced()
	}, [brandings])

	return (
		<Dialog
			className='fixed z-10 inset-0 w-2/5 m-auto'
			style={{
				maxWidth: '90%',
				width: '100%',
				maxHeight: '85vh',
				height: '100%',
				padding: '0',
			}}
			open={open}
			onClose={() => {
				handleSave(true)
				handleClose()
			}}
		>
			<div className='fixed inset-0 bg-black/60' aria-hidden='true' />
			<Dialog.Panel className='flex flex-col h-full w-full relative bg-white rounded-sm overflow-hidden'>
				{fetching && (
					<div className='flex items-center justify-center w-full h-full'>
						<FiLoader className={cx('animate-spin my-6')} size={16} />
					</div>
				)}
				{!fetching && (
					<>
						<div className='flex items-center justify-between w-full px-4 py-2 border-b border-gray-300'>
							<div className='flex items-center gap-x-4'>
								<Heading textStyle='smallTitle'>Brand assets</Heading>
								{updatingBrand ? (
									<div className='flex items-center mt-px mr-4 text-gray-400'>
										<BsCloudUpload className='mr-1' />
										<Text textStyle='caption'>Saving...</Text>
									</div>
								) : (
									<div className='flex items-center mt-px mr-4 text-gray-400'>
										<BsCloudCheck className='mr-1' />
										<Text textStyle='caption'>Saved</Text>
									</div>
								)}
							</div>
							<div className='flex items-center gap-x-2'>
								<Button
									appearance='none'
									leftIcon={<IoAddOutline />}
									onClick={handleCreateBranding}
									disabled={loading}
									loading={loading}
								>
									Add new
								</Button>
							</div>
						</div>
						<div className='flex justify-between flex-1 w-full'>
							<div
								className='relative flex items-center justify-center w-full bg-gray-100 '
								ref={ref}
							>
								{branding && (
									<BrandPreview bounds={bounds} branding={branding} />
								)}
								{brandings && (
									<div className='absolute top-0 right-0 m-4 w-56'>
										<Listbox
											value={branding}
											onChange={value => setBrandingId(value?.id)}
										>
											{({ open: listOpen }) => (
												<div className='relative mt-1'>
													<Listbox.Button className='w-full flex gap-x-4 text-left items-center justify-between border rounded-sm bg-white shadow-sm py-1.5 px-3 pr-8 relative'>
														<div className='flex items-center w-full gap-x-2'>
															<BrandIcon className='flex-shrink-0' />
															<input
																value={branding?.name}
																className='block text-size-xs truncate border border-transparent hover:border-gray-300 focus:outline-none'
																onClick={e => e.stopPropagation()}
																onKeyDown={e => e.stopPropagation()}
																onChange={e => {
																	if (branding)
																		setBrandings(currBrandings =>
																			currBrandings.map(b =>
																				b.id === branding.id
																					? {
																							...branding,
																							name: e.target.value,
																					  }
																					: b
																			)
																		)
																}}
															/>
														</div>
														<span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none '>
															{listOpen ? (
																<IoChevronUpOutline />
															) : (
																<IoChevronDownOutline />
															)}
														</span>
													</Listbox.Button>
													<Listbox.Options className='mt-2 rounded-md bg-dark-300 p-1.5'>
														{brandings.map(brand => (
															<Listbox.Option
																className={({ active }) =>
																	cx(
																		'flex items-center gap-x-4 py-2 px-2 pr-8 relative text-left font-body text-gray-100 cursor-pointer rounded-sm',
																		{
																			'bg-dark-100': active,
																		}
																	)
																}
																key={brand.id}
																value={brand}
															>
																{({ selected }) => (
																	<>
																		<BrandIcon className='flex-shrink-0' />
																		<Text
																			textStyle='caption'
																			className='block truncate '
																		>
																			{brand.name}
																		</Text>
																		{selected && (
																			<span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
																				<BiCheck size={20} />
																			</span>
																		)}
																	</>
																)}
															</Listbox.Option>
														))}
													</Listbox.Options>
												</div>
											)}
										</Listbox>
									</div>
								)}
							</div>
							<div className='flex'>
								{branding && (
									<div className='w-64 px-4 pt-6 bg-white'>
										{activeTab === tabs[0] && (
											<LogoSetting
												branding={branding}
												setBranding={newBranding => {
													setBrandings(currentBrandings =>
														currentBrandings.map(b =>
															b.id === newBranding.id ? newBranding : b
														)
													)
												}}
											/>
										)}
										{activeTab === tabs[1] && (
											<BackgroundSetting
												branding={branding}
												setBranding={newBranding => {
													setBrandings(currentBrandings =>
														currentBrandings.map(b =>
															b.id === newBranding.id ? newBranding : b
														)
													)
												}}
											/>
										)}
										{activeTab === tabs[2] && (
											<ColorSetting
												branding={branding}
												setBranding={newBranding => {
													setBrandings(currentBrandings =>
														currentBrandings.map(b =>
															b.id === newBranding.id ? newBranding : b
														)
													)
												}}
											/>
										)}

										{activeTab === tabs[3] && (
											<FontSetting
												branding={branding}
												setBranding={newBranding => {
													setBrandings(currentBrandings =>
														currentBrandings.map(b =>
															b.id === newBranding.id ? newBranding : b
														)
													)
												}}
											/>
										)}

										{activeTab === tabs[4] && (
											<SplashVideoSetting
												branding={branding}
												setBranding={newBranding => {
													setBrandings(currentBrandings =>
														currentBrandings.map(b =>
															b.id === newBranding.id ? newBranding : b
														)
													)
												}}
											/>
										)}
									</div>
								)}
								<div className='relative flex flex-col px-2 pt-4 bg-gray-50 gap-y-2'>
									{tabs.map(tab => (
										<button
											type='button'
											onClick={() => setActiveTab(tab)}
											className={cx(
												'flex flex-col items-center bg-transparent py-3 px-1 rounded-md text-gray-500 gap-y-2 transition-all',
												{
													'!bg-gray-200 text-gray-800': activeTab.id === tab.id,
													'hover:bg-gray-100': activeTab.id !== tab.id,
												}
											)}
											key={tab.id}
										>
											<tab.Icon size={18} />
											<Text textStyle='bodySmall'>{tab.name}</Text>
										</button>
									))}
									<div
										onClick={deleteBranding}
										className='absolute bottom-0 flex items-center justify-center w-full py-1 -ml-2 bg-red-500 cursor-pointer text-white'
									>
										<Button
											appearance='none'
											leftIcon={<IoTrashOutline size={16} />}
											disabled={deletingBrand}
											loading={deletingBrand}
											className='text-white'
										/>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</Dialog.Panel>
		</Dialog>
	)
}

// const IntroVideoSetting = ({
// 	branding,
// 	setBranding,
// }: {
// 	branding: BrandingInterface
// 	setBranding: (branding: BrandingInterface) => void
// }) => {
// 	const [uploadFile] = useUploadFile()

// 	const [fileUploading, setFileUploading] = useState(false)
// 	const [outroFileUploading, setOutroFileUploading] = useState(false)

// 	const [hover, setHover] = useState(false)
// 	const videoRef = useRef<HTMLVideoElement>(null)

// 	useEffect(() => {
// 		if (!videoRef.current) return
// 		if (hover) {
// 			videoRef.current.play()
// 		} else {
// 			videoRef.current.pause()
// 			videoRef.current.currentTime = 0
// 		}
// 	}, [hover])

// 	const handleUploadFile = async (files: File[], isIntro: boolean) => {
// 		const file = files?.[0]
// 		if (!file) return

// 		if (isIntro) {
// 			setFileUploading(true)
// 		} else {
// 			setOutroFileUploading(true)
// 		}

// 		const { url } = await uploadFile({
// 			extension: file.name.split('.').pop() as any,
// 			file,
// 		})

// 		setFileUploading(false)
// 		setOutroFileUploading(false)

// 		if (isIntro) {
// 			setBranding({
// 				...branding,
// 				branding: { ...branding.branding, introVideoUrl: url },
// 			})
// 		} else {
// 			setBranding({
// 				...branding,
// 				branding: { ...branding.branding, outroVideoUrl: url },
// 			})
// 		}
// 	}

// 	return (
// 		<div className='flex flex-col'>
// 			<Heading fontSize='small' className='font-bold'>
// 				Intro Video
// 			</Heading>
// 			{!branding.branding?.introVideoUrl ? (
// 				<Dropzone
// 					onDrop={files => handleUploadFile(files, true)}
// 					accept='video/*'
// 					maxFiles={1}
// 				>
// 					{({ getRootProps, getInputProps }) => (
// 						<div
// 							tabIndex={-1}
// 							onKeyUp={() => {}}
// 							role='button'
// 							className='flex flex-col items-center p-4 my-2 border border-gray-200 border-dashed rounded-md cursor-pointer'
// 							{...getRootProps()}
// 						>
// 							<input {...getInputProps()} />
// 							{fileUploading ? (
// 								<FiLoader className={cx('animate-spin my-6')} size={16} />
// 							) : (
// 								<>
// 									<FiUploadCloud size={21} className='my-2 text-gray-600' />

// 									<div className='z-50 text-center '>
// 										<Text className='text-xs text-gray-600 font-body'>
// 											Drag and drop or
// 										</Text>
// 										<Text className='text-xs font-semibold text-gray-800'>
// 											browse
// 										</Text>
// 									</div>
// 								</>
// 							)}
// 						</div>
// 					)}
// 				</Dropzone>
// 			) : (
// 				<div
// 					className='relative flex items-center justify-center w-1/2 h-16 mt-2 border border-gray-200 rounded-md cursor-pointer'
// 					onMouseEnter={() => setHover(true)}
// 					onMouseLeave={() => setHover(false)}
// 				>
// 					<IoCloseCircle
// 						className='absolute top-0 right-0 text-red-500 -m-1.5 cursor-pointer block z-10 bg-white rounded-full'
// 						size={16}
// 						onClick={() => {
// 							setBranding({
// 								...branding,
// 								branding: {
// 									...branding.branding,
// 									introVideoUrl: undefined,
// 								},
// 							})
// 						}}
// 					/>
// 					<video
// 						ref={videoRef}
// 						className='object-cover rounded-sm '
// 						src={branding.branding?.introVideoUrl || ''}
// 						muted
// 					/>
// 				</div>
// 			)}
// 			<Heading fontSize='small' className='font-bold mt-8'>
// 				Outro Video
// 			</Heading>
// 			{!branding.branding?.outroVideoUrl ? (
// 				<Dropzone
// 					onDrop={files => handleUploadFile(files, false)}
// 					accept='video/*'
// 					maxFiles={1}
// 				>
// 					{({ getRootProps, getInputProps }) => (
// 						<div
// 							tabIndex={-1}
// 							onKeyUp={() => {}}
// 							role='button'
// 							className='flex flex-col items-center p-4 my-2 border border-gray-200 border-dashed rounded-md cursor-pointer'
// 							{...getRootProps()}
// 						>
// 							<input {...getInputProps()} />
// 							{outroFileUploading ? (
// 								<FiLoader className={cx('animate-spin my-6')} size={16} />
// 							) : (
// 								<>
// 									<FiUploadCloud size={21} className='my-2 text-gray-600' />

// 									<div className='z-50 text-center '>
// 										<Text className='text-xs text-gray-600 font-body'>
// 											Drag and drop or
// 										</Text>
// 										<Text className='text-xs font-semibold text-gray-800'>
// 											browse
// 										</Text>
// 									</div>
// 								</>
// 							)}
// 						</div>
// 					)}
// 				</Dropzone>
// 			) : (
// 				<div
// 					className='relative flex items-center justify-center w-1/2 h-16 mt-2 border border-gray-200 rounded-md cursor-pointer'
// 					onMouseEnter={() => setHover(true)}
// 					onMouseLeave={() => setHover(false)}
// 				>
// 					<IoCloseCircle
// 						className='absolute top-0 right-0 text-red-500 -m-1.5 cursor-pointer block z-10 bg-white rounded-full'
// 						size={16}
// 						onClick={() => {
// 							setBranding({
// 								...branding,
// 								branding: {
// 									...branding.branding,
// 									outroVideoUrl: undefined,
// 								},
// 							})
// 						}}
// 					/>
// 					<video
// 						ref={videoRef}
// 						className='object-cover rounded-sm '
// 						src={branding.branding?.outroVideoUrl || ''}
// 						muted
// 					/>
// 				</div>
// 			)}
// 		</div>
// 	)
// }

export default Branding