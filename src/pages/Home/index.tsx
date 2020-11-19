import React, { useEffect, useState } from 'react'
import {
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet
} from 'react-native'
import TrackPlayer, { useTrackPlayerProgress } from 'react-native-track-player'
import Slider from '@react-native-community/slider'
import Icon from 'react-native-vector-icons/Feather'
import { Layout, List, ListItem, Text, Input } from '@ui-kitten/components'

import api from '../../config/api'
import { useAuth } from '../../hooks/auth'

interface IMusic {
  id: string
  name: string
  preview_url: string
  artists: string
  image: string
}

interface ISpotifyApiResponse {
  tracks: {
    items: Array<{
      id: string
      name: string
      preview_url: string
      album: {
        images: {
          height: number
          width: number
          url: string
        }[]
      }
      artists: Array<{
        name: string
      }>
    }>
  }
}

const Home: React.FC = () => {
  const { auth, authorizeSpotify, refreshSpotifyToken } = useAuth()

  const [musics, setMusics] = useState<IMusic[]>([])
  const [search, setSearch] = useState('')
  const [musicIdPlaying, setMusicIdPlaying] = useState<string | undefined>()
  const [stateName, setStateName] = useState<'play' | 'pause' | undefined>()
  const [sliderValue, setSliderValue] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  const { position, duration } = useTrackPlayerProgress(500)

  useEffect(() => {
    if (!isSeeking && position && duration) {
      setSliderValue(position / duration)

      if (duration - position < 0.2) {
        setStateName(undefined)
        setSliderValue(0)
        setMusicIdPlaying(undefined)
      }
    }
  }, [position, duration, isSeeking, sliderValue])

  useEffect(() => {
    const addEvents = () => {
      TrackPlayer.addEventListener('playback-state', async event => {
        switch (event.state) {
          case TrackPlayer.STATE_PLAYING:
            setStateName('pause')
            break

          case TrackPlayer.STATE_PAUSED:
            setStateName('play')
            break
          case TrackPlayer.STATE_STOPPED: {
            break
          }
        }
      })
    }

    addEvents()
  }, [])

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (auth?.accessToken) {
          const response = await api.get<ISpotifyApiResponse>(
            `https://api.spotify.com/v1/search?q=${search}&type=track&market=br`
          )

          const searchedMusics = response.data.tracks.items.map(item => {
            const artists = item.artists.map(artirts => artirts.name)
            const image = item.album.images[0]?.url

            return {
              id: item.id,
              name: item.name,
              preview_url: item.preview_url,
              artists: artists.join(', '),
              image
            }
          })
          setMusics(searchedMusics)
        }
      } catch (err) {
        refreshSpotifyToken()
      }
    }

    fetchPlaylists()
  }, [auth, refreshSpotifyToken, search])

  const start = async (track: IMusic) => {
    await TrackPlayer.setupPlayer()

    TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_JUMP_FORWARD,
        TrackPlayer.CAPABILITY_JUMP_BACKWARD
      ]
    })

    setMusicIdPlaying(track.id)

    await TrackPlayer.add({
      id: track.id,
      url: track.preview_url,
      title: track.name,
      artist: track.artists,
      artwork: track.image
    })

    await TrackPlayer.play()
  }

  const resumePause = async () => {
    switch (await TrackPlayer.getState()) {
      case TrackPlayer.STATE_PLAYING:
        TrackPlayer.pause()
        break
      default:
        TrackPlayer.play()
    }
  }

  const slidingStarted = () => {
    setIsSeeking(true)
  }
  // this function is called when the user stops sliding the seekbar
  const slidingCompleted = async (value: number) => {
    await TrackPlayer.seekTo(value * duration)
    setIsSeeking(false)
  }

  if (!auth) {
    return (
      <Button title="authorize" onPress={authorizeSpotify}>
        <Text>Login Spotify</Text>
      </Button>
    )
  }

  const listItem = ({ item }: { item: IMusic }) => (
    <ListItem
      onPress={() => start(item)}
      disabled={!item.preview_url}
      style={[
        styles.track,
        musicIdPlaying === item.id ? styles.selectedTrack : undefined
      ]}
    >
      <Text style={styles.trackText}>{item.name}</Text>
      {item.id === musicIdPlaying && (
        <Icon name="volume-2" size={16} color="#fff" />
      )}
    </ListItem>
  )

  return (
    <Layout style={styles.container}>
      <Input
        status="primary"
        style={styles.searchInput}
        placeholder="Search for your music"
        value={search}
        onChangeText={setSearch}
      />

      <List
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        data={musics}
        keyExtractor={item => item.id}
        renderItem={listItem}
      />

      <View style={styles.playerContainer}>
        <TouchableOpacity
          onPress={resumePause}
          disabled={!stateName}
          style={styles.playButton}
        >
          <Icon name={stateName ?? 'play'} size={30} color="#fff" />
        </TouchableOpacity>

        <Slider
          style={{
            width: Dimensions.get('window').width - 40,
            height: 20,
            marginVertical: 10
          }}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          thumbTintColor="#00ac17"
          minimumTrackTintColor="#00ac17"
          maximumTrackTintColor="#fff"
          onSlidingStart={slidingStarted}
          onSlidingComplete={slidingCompleted}
        />
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  searchInput: {
    borderRadius: 0
  },
  list: {
    paddingHorizontal: 10
  },
  listContainer: {
    paddingBottom: 110
  },
  track: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2
  },
  trackText: {
    color: '#fff',
    width: '95%'
  },
  selectedTrack: {
    borderColor: '#fff'
  },
  disabledTrackText: {
    color: '#ccc'
  },
  playerContainer: {
    width: '100%',
    height: 100,
    position: 'absolute',
    padding: 10,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    backgroundColor: '#171F36',
    elevation: 3
  },
  playButton: {
    marginTop: 5
  }
})

export default Home
