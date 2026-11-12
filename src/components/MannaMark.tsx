import Svg, { Path } from "react-native-svg"

// Generated from docs/brand/build/gen_kit.py (master Sprig & Olive symbol).
const PATHS = [
  "M3.69 2.58L89.72 -120.29A4.5 4.5 0 0 0 82.35 -125.45L-3.69 -2.58A4.5 4.5 0 0 0 3.69 2.58Z",
  "M33.27 -47.51A48.67 48.67 0 0 1 27.69 -111.27A48.67 48.67 0 0 1 33.27 -47.51Z",
  "M50.47 -72.09A44.88 44.88 0 0 1 108.43 -87.61A44.88 44.88 0 0 1 50.47 -72.09Z",
  "M66.53 -95.02A42.58 42.58 0 0 1 61.65 -150.81A42.58 42.58 0 0 1 66.53 -95.02Z",
  "M78.29 -111.81A43.73 43.73 0 0 1 111.56 -159.33A43.73 43.73 0 0 1 78.29 -111.81Z",
  "M18.13 -24.63L35.6 -17.22A3.5 3.5 0 0 0 38.34 -23.66L20.87 -31.07A3.5 3.5 0 0 0 18.13 -24.63Z",
  "M54.76 -26.46A12.5 16.5 -67 0 1 65.07 -8.51A12.5 16.5 -67 0 1 44.99 -3.45A12.5 16.5 -67 0 1 34.69 -21.4A12.5 16.5 -67 0 1 54.76 -26.46Z",
]

const VIEW_W = 120
const VIEW_H = 168

type Props = {
  height: number
  color: string
  opacity?: number
}

export function MannaMark({ height, color, opacity = 1 }: Props) {
  return (
    <Svg
      width={(height * VIEW_W) / VIEW_H}
      height={height}
      viewBox={`-6 -161 ${VIEW_W} ${VIEW_H}`}
      opacity={opacity}
    >
      {PATHS.map((d) => (
        <Path key={d} d={d} fill={color} />
      ))}
    </Svg>
  )
}
