import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  /** Show the surrounding circular badge ring. Default true. */
  badge?: boolean;
};

function Badge({
  badge = true,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {badge && <circle cx={32} cy={32} r={29} strokeWidth={1.5} opacity={0.35} />}
      {children}
    </svg>
  );
}

/** Gímszarvas — széles, sokágú agancskorona */
export function RedDeerIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <ellipse cx={32} cy={47} rx={9} ry={4.5} strokeWidth={2} />
      <g>
        <path d="M27 45 C 24 32, 20 26, 15 10" />
        <path d="M22 30 L 12 25" />
        <path d="M20 22 L 9 18" />
        <path d="M17 14 L 8 14" />
        <path d="M15 10 L 10 4" />
        <path d="M15 10 L 20 5" />
      </g>
      <g>
        <path d="M37 45 C 40 32, 44 26, 49 10" />
        <path d="M42 30 L 52 25" />
        <path d="M44 22 L 55 18" />
        <path d="M47 14 L 56 14" />
        <path d="M49 10 L 54 4" />
        <path d="M49 10 L 44 5" />
      </g>
    </Badge>
  );
}

/** Dámszarvas — lapátos (palmate) agancsvég */
export function FallowDeerIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <ellipse cx={32} cy={47} rx={9} ry={4.5} strokeWidth={2} />
      <g>
        <path d="M27 45 C 25 34, 22 26, 19 17" />
        <path d="M19 17 L 9 8 L 12 6 L 16 10 L 18 4 L 21 9 L 24 5 L 22 12 L 27 10 Z" strokeLinejoin="round" />
      </g>
      <g>
        <path d="M37 45 C 39 34, 42 26, 45 17" />
        <path d="M45 17 L 55 8 L 52 6 L 48 10 L 46 4 L 43 9 L 40 5 L 42 12 L 37 10 Z" strokeLinejoin="round" />
      </g>
    </Badge>
  );
}

/** Őz — kicsi, vékony, hármas ágú (bak)szarv */
export function RoeDeerIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <ellipse cx={32} cy={46} rx={7.5} ry={4} strokeWidth={2} />
      <g>
        <path d="M29 44 C 27 36, 26 28, 25 21" />
        <path d="M26 32 L 19 28" />
        <path d="M25 21 L 20 15" />
        <path d="M25 21 L 29 14" />
      </g>
      <g>
        <path d="M35 44 C 37 36, 38 28, 39 21" />
        <path d="M38 32 L 45 28" />
        <path d="M39 21 L 44 15" />
        <path d="M39 21 L 35 14" />
      </g>
    </Badge>
  );
}

/** Muflon — nagy, csigavonalban tekeredő szarv */
export function MouflonIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <circle cx={32} cy={22} r={7} strokeWidth={2} />
      <path d="M26 19 C 15 17, 10 26, 14 34 C 17 41, 27 42, 29 35 C 31 30, 25 27, 21 30" />
      <path d="M38 19 C 49 17, 54 26, 50 34 C 47 41, 37 42, 35 35 C 33 30, 39 27, 43 30" />
    </Badge>
  );
}

/** Vaddisznó — fej sziluett agyarral és sörtetaréjjal */
export function WildBoarIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <path d="M12 34 C 12 22, 22 14, 33 14 C 42 14, 49 19, 51 26 C 55 25, 57 28, 55 31 C 53 33, 50 32, 49 30 C 49 38, 43 44, 34 45 C 22 46, 12 42, 12 34 Z" strokeLinejoin="round" />
      <path d="M14 30 C 10 29, 8 31, 9 34" />
      <path d="M20 20 L 16 13" />
      <path d="M33 14 L 32 8" />
      <path d="M40 15 L 41 9" />
      <circle cx={24} cy={27} r={1.4} fill="currentColor" stroke="none" />
      <path d="M12 33 C 8 34, 6 38, 9 41 C 11 43, 14 41, 14 38" />
    </Badge>
  );
}

/** Apróvad / ragadozó — mancsnyom */
export function PawIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <ellipse cx={32} cy={40} rx={11} ry={9} strokeWidth={2} />
      <ellipse cx={18} cy={24} rx={4.5} ry={5.5} strokeWidth={2} />
      <ellipse cx={28} cy={17} rx={4.5} ry={5.5} strokeWidth={2} />
      <ellipse cx={38} cy={17} rx={4.5} ry={5.5} strokeWidth={2} />
      <ellipse cx={47} cy={24} rx={4.5} ry={5.5} strokeWidth={2} />
    </Badge>
  );
}

/** Vegyes — több vadfaj kombinációja */
export function MixedGameIcon(props: IconProps) {
  return (
    <Badge {...props}>
      <ellipse cx={24} cy={44} rx={7} ry={3.5} strokeWidth={2} />
      <path d="M20.5 42 C 19 35, 17 30, 15 24" />
      <path d="M15 24 L 10 18" />
      <path d="M15 24 L 19 17" />
      <ellipse cx={41} cy={41} rx={7.5} ry={4} strokeWidth={2} />
      <path d="M12 33 C 8 32, 16 26, 22 25 C 30 24, 36 28, 38 33 C 41 26, 46 25, 51 27 C 55 29, 55 33, 51 34 C 49 40, 44 43, 37 44 C 26 45, 15 41, 12 33 Z" strokeWidth={1.75} opacity={0.55} />
    </Badge>
  );
}

export const GAME_ICONS = {
  gimszarvas: RedDeerIcon,
  damszarvas: FallowDeerIcon,
  oz: RoeDeerIcon,
  muflon: MouflonIcon,
  vaddiszno: WildBoarIcon,
  aprovad: PawIcon,
  vegyes: MixedGameIcon,
} as const;

export type GameIconKey = keyof typeof GAME_ICONS;
