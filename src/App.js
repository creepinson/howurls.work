import React, { useMemo, useState } from 'react'
import pasteIcon from './images/paste-icon.svg'
import { FormattedMessage, IntlProvider } from 'react-intl'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import { Grid } from './components/Grid'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { UrlPreview } from './components/UrlPreview'
import { LocaleContext } from './LocaleProvider'

const PlaceholderText = styled.p`
	position: relative;
	text-align: center;
	top: 125%;
	left: 0;
	right: 0;

	@media (min-width: 768px) {
		top: -50%;
	}
`

const MainContainer = styled.div`
	transition: margin 0.5s ease;

	@media (min-width: 768px) and (min-height: 1000px) {
		margin-top: 50%;
		transform: translateY(50%);
	}
`

function App() {
	const defaultLocale =
		localStorage.getItem('locale') ||
		(navigator.languages && navigator.languages[0]) ||
		navigator.language ||
		navigator.userLanguage ||
		'en-US'

	const [ locale, setLocale ] = useState(defaultLocale)
	const messages = useMemo(
		() => {
			try {
				return require(`./locales/${locale}.json`)
			} catch (error) {
				// Fallback to English and clean a potentially corrupted storage
				localStorage.removeItem('locale')
				return require('./locales/en-US.json')
			}
		},
		[ locale ]
	)

	const location = useLocation()
	const isRoot = location.pathname === '/'

	const [ url, setUrl ] = useState(new URL('https://site.com:443/user?id=123#settings'))

	const pasteURI = (e) => {
		e.persist()
		e.target.focus()
		if (e.target.style.opacity !== '0.8') {
			// Grey out
			e.target.style.opacity = '0.8'
			e.target.style.filter = 'alpha(opacity=80)'

			navigator.clipboard.readText().then((text) => {
				let newUri
				try {
					newUri = new URL(decodeURI(text))
					setUrl(newUri)
				} catch (err) {
					setUrl(new URL('https://site.com:443/user?id=123#settings'))
				}
				setTimeout(() => {
					// enable paste button again
					e.target.style.opacity = '1.0'
					e.target.style.filter = 'alpha(opacity=100)'
				}, 500)
			})
		}
	}

	return (
		<IntlProvider locale={locale} messages={messages}>
			<LocaleContext.Provider value={{ locale, setLocale }}>
				<Header />
				<main>
					<Grid className="relative">
						<MainContainer>
							{isRoot && (
								<PlaceholderText>
									<FormattedMessage id="homepage.urlPreview.placeholder" />
								</PlaceholderText>
							)}
							<img
								src={pasteIcon}
								style={{ display: 'block', margin: 'auto', color: 'white' }}
								width={50}
								height={50}
								alt="Paste URI"
								onClick={pasteURI}
							/>;
							<UrlPreview url={url} />
						</MainContainer>
					</Grid>
				</main>
				<Footer />
			</LocaleContext.Provider>
		</IntlProvider>
	)
}

export default App
