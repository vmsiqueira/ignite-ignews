import { query as q } from 'faunadb'

import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

import { fauna } from '../../../services/fauna';

export default NextAuth ({
	//Configure one or more authentication providers
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			// quais infos eu vou ter acesso do usuário - GithubDocs
			authorization: {
				params: {
					scope: 'read:user'
				}
			}

		}),
		// ...add more providers here
		/*ex: Providers.Google({})*/
	],
	callbacks: {
		async signIn({user, account, profile}) {
			const { email } = user
			try {
				await fauna.query(
					q.If(
						q.Not(
							q.Exists(
								q.Match(
									q.Index('user_by_email'),
									q.Casefold(user.email)
								)
							)
						),
						q.Create(
							q.Collection('users'),
							{ data: { email } }
						),
						q.Get(
							q.Match(
								q.Index('user_by_email'),
								q.Casefold(user.email)
							)
						)
					),
					
					
				)

				return true // login ok
			} catch {
				return false // avoid user login without database connection
			}
 		},
		
	}
})