import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"
import { MannaMark } from "@/components/MannaMark"

const PHRASES = ["be still…", "breathe in…", "rest here…", "breathe out…", "wait in peace…"]

const DROP_MS = 750
// One half-breath; phrases change on each inhale/exhale.
const BREATH_MS = 4000
const RIPPLE_MS = 4200
const RIPPLE_COUNT = 3
const RING_SIZE = 240

type Props = {
  accent: string
  textColor: string
  subtextColor: string
}

function Ripple({ index, color, start }: { index: number; color: string; start: number }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      start + (index * RIPPLE_MS) / RIPPLE_COUNT,
      withRepeat(withTiming(1, { duration: RIPPLE_MS, easing: Easing.out(Easing.quad) }), -1),
    )
  }, [index, start, progress])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.08, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.25, 1]) }],
  }))

  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />
}

function useBreath(reduceMotion: boolean): SharedValue<number> {
  const breath = useSharedValue(0)
  useEffect(() => {
    if (reduceMotion) return
    const ease = Easing.inOut(Easing.sin)
    breath.value = withDelay(
      DROP_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: BREATH_MS, easing: ease }),
          withTiming(0, { duration: BREATH_MS, easing: ease }),
        ),
        -1,
      ),
    )
  }, [reduceMotion, breath])
  return breath
}

export function SelahLoader({ accent, textColor, subtextColor }: Props) {
  const reduceMotion = useReducedMotion()
  const [phrase, setPhrase] = useState(0)
  const breath = useBreath(reduceMotion)
  const drop = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) return
    drop.value = withTiming(1, { duration: DROP_MS, easing: Easing.in(Easing.quad) })
  }, [reduceMotion, drop])

  useEffect(() => {
    const id = setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), BREATH_MS)
    return () => clearInterval(id)
  }, [])

  // The droplet falls into stillness, then dissolves as the first ripple spreads.
  const dropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drop.value, [0, 0.15, 0.9, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(drop.value, [0, 1], [-220, 0]) },
      { scaleY: interpolate(drop.value, [0, 0.85, 1], [1, 1.15, 0.4]) },
      { rotate: "45deg" },
    ],
  }))

  const markStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drop.value, [0.8, 1], [0, 1]) * interpolate(breath.value, [0, 1], [0.75, 1]),
    transform: [{ scale: interpolate(breath.value, [0, 1], [0.94, 1.04]) }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drop.value, [0.8, 1], [0, 1]) * interpolate(breath.value, [0, 1], [0.05, 0.13]),
    transform: [{ scale: interpolate(breath.value, [0, 1], [0.85, 1.15]) }],
  }))

  return (
    <Animated.View
      style={styles.root}
      exiting={FadeOut.duration(400)}
      accessible
      accessibilityLabel="Selah. Finding a verse for you."
    >
      <View style={styles.stage}>
        {!reduceMotion &&
          Array.from({ length: RIPPLE_COUNT }, (_, i) => (
            <Ripple key={i} index={i} color={accent} start={DROP_MS - 40} />
          ))}
        <Animated.View style={[styles.glow, { backgroundColor: accent }, glowStyle]} />
        <Animated.View style={markStyle}>
          <MannaMark height={72} color={accent} />
        </Animated.View>
        {!reduceMotion && (
          <Animated.View style={[styles.drop, { backgroundColor: accent }, dropStyle]} />
        )}
      </View>
      <Animated.Text
        entering={FadeIn.delay(DROP_MS + 200).duration(900)}
        style={[styles.selah, { color: textColor }]}
      >
        Selah
      </Animated.Text>
      <View style={styles.phraseSlot}>
        <Animated.Text
          key={phrase}
          entering={FadeIn.delay(phrase === 0 ? DROP_MS + 600 : 300).duration(700)}
          exiting={FadeOut.duration(400)}
          style={[styles.phrase, { color: subtextColor }]}
        >
          {PHRASES[phrase]}
        </Animated.Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  stage: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
  },
  glow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  // A square with one sharp corner, rotated 45°, reads as a teardrop.
  drop: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderTopLeftRadius: 0,
  },
  selah: {
    marginTop: 8,
    fontSize: 44,
    fontFamily: "CormorantGaramond_600SemiBold",
    fontStyle: "italic",
    letterSpacing: 2,
  },
  phraseSlot: {
    height: 24,
    marginTop: 10,
    alignSelf: "stretch",
  },
  phrase: {
    ...StyleSheet.absoluteFillObject,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    letterSpacing: 2,
  },
})
