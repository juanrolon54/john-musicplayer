import React, { useEffect, useState, useRef } from 'react'

export type Track = {
  title: string
  artist?: string
  src: string
  img?: string
  color?: string
}

export type Control = {
  play: () => void
  pause: () => void
  playPause: () => void
  next: () => void
  prev: () => void
  track: (i: number) => void
  progress: { start: (v: number) => void; end: () => void }
}
export type Status = {
  current: Track
  index: number
  playing: boolean
  progress: number
  duration: number
}
export default (initialTracks: Track[]) => {
  const [tracks, setTracks] = useState<Track[]>([...initialTracks]) //just in case tracks are mutable
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)

  const { src } = tracks[index]

  const audioRef = useRef(new Audio(src))
  const intervalRef = useRef<number>()

  const startTimer = () => {
    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        next()
      } else {
        setDuration(audioRef.current.duration)
        setProgress(audioRef.current.currentTime)
      }
    }, 100)
  }

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause()
  }, [playing])

  useEffect(() => {
    return () => {
      audioRef.current.pause()
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    audioRef.current.pause()
    audioRef.current = new Audio(src)
    setProgress(audioRef.current.currentTime)

    playing ? audioRef.current.play() : audioRef.current.pause()
    startTimer()
  }, [index])

  const prev = (): void => {
    setIndex((index - 1 + tracks.length) % tracks.length)
  }
  const next = (): void => {
    setIndex((index + 1) % tracks.length)
  }
  const playPause = (): void => setPlaying(!playing)
  const play = (): void => setPlaying(true)
  const pause = (): void => setPlaying(false)

  const setProgressStart = (value: number) => {
    if (!Number.isNaN(value) && typeof value === 'number') {
      clearInterval(intervalRef.current)
      audioRef.current.currentTime = value
      setProgress(value)
    }
  }
  const setProgressEnd = () => {
    audioRef.current.currentTime !== audioRef.current.duration
      ? playing
        ? audioRef.current.play()
        : audioRef.current.pause()
      : next()
    startTimer()
  }
  const setTrack = (i: number) => {
    setIndex(i)
    play()
  }
  return [
    {
      play,
      pause,
      playPause,
      next,
      prev,
      track: setTrack,
      progress: { start: setProgressStart, end: setProgressEnd }
    },
    { current: tracks[index], index, playing, progress, duration }
  ] as [Control, Status]
}
