interface Props {
  current: string;
  previous: string;
  next: string;
}

const YAMANOTE_GREEN = "#80c900";
const INK = "#17181d";

export const YamanoteLineSign = ({ current, previous, next }: Props) => {
  return (
    <figure
      aria-label={`${previous}, ${current}, ${next}. Yamanote Line station sign.`}
      className="border-2 border-[#121319] sm:border-4">
      <svg
        aria-hidden="true"
        className="block h-auto w-full bg-white"
        role="img"
        viewBox="0 0 1200 335"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sign-face" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f3f4f2" />
          </linearGradient>
          <linearGradient id="line-green" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#168522" />
            <stop offset="0.52" stopColor="#11841e" />
            <stop offset="1" stopColor="#1a7721" />
          </linearGradient>
        </defs>

        <g filter="url(#badge-shadow)" transform="translate(316 17)">
          <rect width="118" height="130" rx="19" fill={INK} />
          <text
            x="59"
            y="29"
            fill="#ffffff"
            fontFamily="Geist Variable, Arial, sans-serif"
            fontSize="25"
            fontWeight="750"
            textAnchor="middle">
            SMB
          </text>
          <rect
            x="10"
            y="34"
            width="98"
            height="87"
            rx="7"
            fill={YAMANOTE_GREEN}
          />
          <rect x="20" y="43" width="78" height="68" rx="2" fill="#fafaf8" />
          <text
            x="59"
            y="70"
            fill={INK}
            fontFamily="Geist Variable, Arial, sans-serif"
            fontSize="24"
            fontWeight="650"
            textAnchor="middle">
            JY
          </text>
          <text
            x="59"
            y="105"
            fill={INK}
            fontFamily="Geist Variable, Arial, sans-serif"
            fontSize="35"
            fontWeight="650"
            textAnchor="middle">
            29
          </text>
        </g>

        <text
          x="563"
          y="95"
          fill={INK}
          fontFamily="Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans JP, sans-serif"
          fontSize="82"
          fontWeight="800"
          letterSpacing="28"
          textAnchor="middle">
          大塚
        </text>
        <text
          x="563"
          y="151"
          fill={INK}
          fontFamily="Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans JP, sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="2"
          textAnchor="middle">
          おおつか
        </text>

        <g fill={INK} fontWeight="500">
          <text
            x="750"
            y="46"
            fontFamily="Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans JP, sans-serif"
            fontSize="27">
            新桥
          </text>
          <text
            x="750"
            y="87"
            fontFamily="Apple SD Gothic Neo, Noto Sans KR, sans-serif"
            fontSize="25">
            신바시
          </text>
        </g>

        <g
          fill="none"
          stroke={INK}
          strokeLinejoin="round"
          strokeWidth="6"
          transform="translate(1013 25)">
          <path d="M0 0h48v48H0z" />
          <path d="M12 8v31M34 8v31M8 39h31" />
          <path d="M64 0h48v48H64z" />
          <path d="m75 12 27 25M101 11 75 38" />
        </g>

        <path d="M0 184H1119L1200 218L1119 252H0Z" fill="url(#line-green)" />
        <rect x="568" y="184" width="68" height="68" fill={YAMANOTE_GREEN} />

        <g
          fill="#ffffff"
          fontFamily="Hiragino Kaku Gothic ProN, Yu Gothic, Noto Sans JP, sans-serif"
          fontSize="39"
          fontWeight="700">
          <text x="43" y="232">
            池袋
          </text>
          <text x="887" y="232">
            巣鴨
          </text>
        </g>

        <g fill={INK} fontFamily="Geist Variable, Arial, sans-serif">
          <text x="38" y="309" fontSize="31" fontWeight="400">
            {previous}
          </text>
          <text
            x="602"
            y="311"
            fontSize="45"
            fontWeight="720"
            textAnchor="middle">
            {current}
          </text>
          <text x="888" y="302" fontSize="31" fontWeight="400">
            {next}
          </text>
        </g>

        <g transform="translate(1086 263)">
          <rect width="66" height="56" rx="5" fill={YAMANOTE_GREEN} />
          <rect x="6" y="6" width="54" height="44" rx="2" fill="#fafaf8" />
          <text
            x="33"
            y="26"
            fill={INK}
            fontFamily="Geist Variable, Arial, sans-serif"
            fontSize="17"
            fontWeight="650"
            textAnchor="middle">
            JY
          </text>
          <text
            x="33"
            y="46"
            fill={INK}
            fontFamily="Geist Variable, Arial, sans-serif"
            fontSize="22"
            fontWeight="650"
            textAnchor="middle">
            30
          </text>
        </g>
      </svg>
    </figure>
  );
};
