import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../config/api'
import { authorize, refresh } from 'react-native-app-auth'
import AsyncStorage from '@react-native-community/async-storage'

import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } from '@env'

interface AuthState {
  accessToken: string
  refreshToken: string | null
}

interface AuthContextData {
  auth: AuthState | undefined
  authorizeSpotify: () => Promise<void>
  refreshSpotifyToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const spotifyAuthConfig = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUrl: REDIRECT_URL,
  scopes: [
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify',
    'user-top-read'
  ],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token'
  }
}

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState | undefined>()

  useEffect(() => {
    const fetchAuthData = async () => {
      const localStorageAuth = await AsyncStorage.getItem('@Sevenappstest:auth')

      if (localStorageAuth) {
        const parsedData = JSON.parse(localStorageAuth)

        setData(parsedData)
        const { accessToken } = parsedData

        api.defaults.headers.authorization = `Bearer ${accessToken}`
      }
    }
    fetchAuthData()
  }, [])

  const authorizeSpotify = async (): Promise<void> => {
    try {
      const result = await authorize(spotifyAuthConfig)

      const newData = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
      setData(newData)

      AsyncStorage.setItem('@Sevenappstest:auth', JSON.stringify(newData))
      api.defaults.headers.authorization = `Bearer ${newData.accessToken}`
    } catch (error) {}
  }

  const refreshSpotifyToken = async (): Promise<void> => {
    if (!data?.refreshToken) throw new Error('No refreshToken available')

    const result = await refresh(spotifyAuthConfig, {
      refreshToken: data?.refreshToken
    })

    const newAuth = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }

    setData(newAuth)

    AsyncStorage.setItem('@Sevenappstest:auth', JSON.stringify(newAuth))
    api.defaults.headers.authorization = `Bearer ${newAuth.accessToken}`
  }

  return (
    <AuthContext.Provider
      value={{ auth: data, authorizeSpotify, refreshSpotifyToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = (): AuthContextData => {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }
