import { router } from '@trpc/server'
import superjson from 'superjson'
import { Context } from './createContext'
import { Meta } from './routes/userRouter'

function createRouter() {
	return router<Context, Meta>().transformer(superjson)
}

export default createRouter
