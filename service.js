import TrackPlayer from 'react-native-track-player'

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    console.log('epapppaa')
    TrackPlayer.play()
  })

  TrackPlayer.addEventListener('remote-pause', () => {
    TrackPlayer.pause()
  })

  TrackPlayer.addEventListener('remote-jump-forward', async () => {
    let newPosition = await TrackPlayer.getPosition()
    const duration = await TrackPlayer.getDuration()
    newPosition += 10
    if (newPosition > duration) {
      newPosition = duration
    }
    TrackPlayer.seekTo(newPosition)
  })

  TrackPlayer.addEventListener('remote-jump-backward', async () => {
    let newPosition = await TrackPlayer.getPosition()
    newPosition -= 10
    if (newPosition < 0) {
      newPosition = 0
    }
    TrackPlayer.seekTo(newPosition)
  })
}

// module.exports = async function () {
//   TrackPlayer.addEventListener('remote-play', () => {
//     console.log('playing')
//     // TrackPlayer.play()
//   })

//   TrackPlayer.addEventListener('remote-pause', () => {
//     console.log('pause')
//     // TrackPlayer.pause()
//   })

//   TrackPlayer.addEventListener('remote-stop', () => {
//     console.log('remote-stop')
//     // TrackPlayer.destroy()
//   })

//   TrackPlayer.addEventListener('remote-play', () => {
//     console.log('remote-play')
//   })

//   TrackPlayer.addEventListener('remote-pause', () => {
//     console.log('remote-pause')
//   })

//   TrackPlayer.addEventListener('remote-stop', () => {
//     console.log('remote-stop')
//   })

//   TrackPlayer.addEventListener('playback-state', () => {
//     console.log('playback-state')
//     // console.log(state)
//   })

//   TrackPlayer.addEventListener('playback-error', () => {
//     console.log('playback-error')
//   })
// }
