/* eslint-disable react/jsx-no-constructed-context-values */
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useUserOnBoardingMutation } from 'src/graphql/generated'
import { useUser } from 'src/utils/providers/auth'
import Logo from 'svg/Logo.svg'
import { emitToast } from 'ui/src'
import MainDetailsPage from './MainDetails'
import People from './People'
import PersonalDetailsPage from './PersonalDetails'
import { OnBoardingContext, OnBoardingProps, OnBoardingScreens } from './types'
import UploadPage from './Upload'

const OnBoarding = () => {
	const [activeScreen, setActiveScreen] = useState<OnBoardingScreens>(
		OnBoardingScreens.MainDetails
	)

	const { push } = useRouter()

	const { user, setUser } = useUser()

	const [details, setDetails] = useState<OnBoardingProps>({
		name: user?.displayName || '',
		username: user?.username || '',
		designation: user?.designation || '',
		organization: user?.organization || '',
		profilePicture: user?.picture || '',
	})

	const [completeUserOnBoarding, { loading }] = useUserOnBoardingMutation()

	useEffect(() => {
		setDetails({
			name: user?.displayName || '',
			username: user?.username || '',
			designation: user?.designation || '',
			organization: user?.organization || '',
			profilePicture: user?.picture || '',
		})
	}, [user])

	const handleOnBoarding = async () => {
		if (!details) return
		const { data, errors } = await completeUserOnBoarding({
			variables: { ...details },
		})
		if (data?.UserOnboarding?.success && setUser && user) {
			setUser(Object.assign(user, { onboarded: true }))
			emitToast('Successfully onboarded!')
			push('/dashboard')
		}
		if (errors) {
			emitToast('Something went wrong!')
		}
	}

	return (
		<OnBoardingContext.Provider
			value={{
				details,
				loading,
				activeScreen,
				setActiveScreen,
				setDetails,
				handleOnBoarding,
			}}
		>
			<section className='h-screen w-full flex flex-col justify-start items-center relative'>
				<Logo size='small' className='m-4 absolute top-0 left-0' />
				<People />

				{(() => {
					switch (activeScreen) {
						case OnBoardingScreens.MainDetails:
							return <MainDetailsPage />
						case OnBoardingScreens.PersonalDetails:
							return <PersonalDetailsPage />
						case OnBoardingScreens.Upload:
							return <UploadPage />
						default:
							return null
					}
				})()}
			</section>
		</OnBoardingContext.Provider>
	)
}

export default OnBoarding