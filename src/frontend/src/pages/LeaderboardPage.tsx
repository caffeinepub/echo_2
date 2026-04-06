import { motion } from "motion/react";

const LEADERBOARD = [
  {
    rank: 1,
    name: "Jiroemon Kimura",
    country: "Japan",
    born: 1897,
    died: 2013,
    age: "116 yrs, 54 days",
  },
  {
    rank: 2,
    name: "Masazo Nonaka",
    country: "Japan",
    born: 1905,
    died: 2019,
    age: "113 yrs, 133 days",
  },
  {
    rank: 3,
    name: "Tomoji Tanabe",
    country: "Japan",
    born: 1895,
    died: 2009,
    age: "113 yrs, 0 days",
  },
  {
    rank: 4,
    name: "Yukichi Chuganji",
    country: "Japan",
    born: 1889,
    died: 2003,
    age: "114 yrs, 175 days",
  },
  {
    rank: 5,
    name: "Chitetsu Watanabe",
    country: "Japan",
    born: 1907,
    died: 2020,
    age: "112 yrs, 344 days",
  },
  {
    rank: 6,
    name: "Yasutaro Koide",
    country: "Japan",
    born: 1903,
    died: 2016,
    age: "112 yrs, 312 days",
  },
  {
    rank: 7,
    name: "Sakari Momoi",
    country: "Japan",
    born: 1903,
    died: 2015,
    age: "112 yrs, 150 days",
  },
  {
    rank: 8,
    name: "Jisaburo Nishida",
    country: "Japan",
    born: 1903,
    died: 2015,
    age: "111 yrs, 265 days",
  },
  {
    rank: 9,
    name: "Tokitaro Iida",
    country: "Japan",
    born: 1906,
    died: 2017,
    age: "111 yrs, 193 days",
  },
  {
    rank: 10,
    name: "Juro Motohashi",
    country: "Japan",
    born: 1910,
    died: 2020,
    age: "110 yrs, 252 days",
  },
  {
    rank: 11,
    name: "Tamezo Matsumoto",
    country: "Japan",
    born: 1903,
    died: 2014,
    age: "110 yrs, 220 days",
  },
  {
    rank: 12,
    name: "Masao Kajino",
    country: "Japan",
    born: 1908,
    died: 2018,
    age: "110 yrs, 180 days",
  },
  {
    rank: 13,
    name: "Takujiro Fujii",
    country: "Japan",
    born: 1907,
    died: 2017,
    age: "110 yrs, 165 days",
  },
  {
    rank: 14,
    name: "Jisaburo Ozawa",
    country: "Japan",
    born: 1903,
    died: 2013,
    age: "110 yrs, 110 days",
  },
  {
    rank: 15,
    name: "Tokizo Takeuchi",
    country: "Japan",
    born: 1905,
    died: 2015,
    age: "110 yrs, 90 days",
  },
  {
    rank: 16,
    name: "Kotaro Ikoma",
    country: "Japan",
    born: 1905,
    died: 2015,
    age: "110 yrs, 72 days",
  },
  {
    rank: 17,
    name: "Suminaga Maruyama",
    country: "Japan",
    born: 1910,
    died: 2020,
    age: "110 yrs, 55 days",
  },
  {
    rank: 18,
    name: "Giichi Nishi",
    country: "Japan",
    born: 1906,
    died: 2016,
    age: "110 yrs, 42 days",
  },
  {
    rank: 19,
    name: "Yasuri Fujimoto",
    country: "Japan",
    born: 1907,
    died: 2017,
    age: "110 yrs, 30 days",
  },
  {
    rank: 20,
    name: "Minoru Kimura",
    country: "Japan",
    born: 1913,
    died: 2023,
    age: "109 yrs, 365 days",
  },
  {
    rank: 21,
    name: "Nobuo Tanaka",
    country: "Japan",
    born: 1909,
    died: 2019,
    age: "109 yrs, 300 days",
  },
  {
    rank: 22,
    name: "Narasimha Rao Muppalla",
    country: "India",
    born: 1903,
    died: 2012,
    age: "109 yrs, 245 days",
  },
  {
    rank: 23,
    name: "Kim Chang-hyun",
    country: "South Korea",
    born: 1904,
    died: 2013,
    age: "109 yrs, 180 days",
  },
  {
    rank: 24,
    name: "Hidenosuke Shoji",
    country: "Japan",
    born: 1909,
    died: 2018,
    age: "109 yrs, 155 days",
  },
  {
    rank: 25,
    name: "Katsutaro Tanimoto",
    country: "Japan",
    born: 1908,
    died: 2017,
    age: "109 yrs, 130 days",
  },
  {
    rank: 26,
    name: "Fujio Hara",
    country: "Japan",
    born: 1909,
    died: 2018,
    age: "109 yrs, 110 days",
  },
  {
    rank: 27,
    name: "Jioichiro Kato",
    country: "Japan",
    born: 1910,
    died: 2019,
    age: "109 yrs, 95 days",
  },
  {
    rank: 28,
    name: "Shigenobu Ushiro",
    country: "Japan",
    born: 1910,
    died: 2019,
    age: "109 yrs, 80 days",
  },
  {
    rank: 29,
    name: "Isamu Tahara",
    country: "Japan",
    born: 1908,
    died: 2017,
    age: "109 yrs, 65 days",
  },
  {
    rank: 30,
    name: "Jitaro Kikuchi",
    country: "Japan",
    born: 1909,
    died: 2018,
    age: "109 yrs, 50 days",
  },
  {
    rank: 31,
    name: "Taisuke Sato",
    country: "Japan",
    born: 1910,
    died: 2019,
    age: "109 yrs, 35 days",
  },
  {
    rank: 32,
    name: "Ryotaro Kawashima",
    country: "Japan",
    born: 1907,
    died: 2016,
    age: "109 yrs, 20 days",
  },
  {
    rank: 33,
    name: "Genichi Yokoyama",
    country: "Japan",
    born: 1908,
    died: 2017,
    age: "109 yrs, 10 days",
  },
  {
    rank: 34,
    name: "Kiyotoshi Hanada",
    country: "Japan",
    born: 1909,
    died: 2018,
    age: "108 yrs, 360 days",
  },
  {
    rank: 35,
    name: "Takeo Tsuruta",
    country: "Japan",
    born: 1909,
    died: 2018,
    age: "108 yrs, 340 days",
  },
  {
    rank: 36,
    name: "Koji Yamamoto",
    country: "Japan",
    born: 1910,
    died: 2019,
    age: "108 yrs, 320 days",
  },
  {
    rank: 37,
    name: "Teizo Takehara",
    country: "Japan",
    born: 1910,
    died: 2018,
    age: "108 yrs, 300 days",
  },
  {
    rank: 38,
    name: "Jisaburo Kimura",
    country: "Japan",
    born: 1909,
    died: 2017,
    age: "108 yrs, 285 days",
  },
  {
    rank: 39,
    name: "Sadao Shimizu",
    country: "Japan",
    born: 1908,
    died: 2016,
    age: "108 yrs, 270 days",
  },
  {
    rank: 40,
    name: "Choi Young-hwan",
    country: "South Korea",
    born: 1905,
    died: 2013,
    age: "108 yrs, 255 days",
  },
  {
    rank: 41,
    name: "Zhang Guanxiu",
    country: "China",
    born: 1907,
    died: 2015,
    age: "108 yrs, 240 days",
  },
  {
    rank: 42,
    name: "Luo Meizhen",
    country: "China",
    born: 1885,
    died: 1993,
    age: "108 yrs, 230 days",
  },
  {
    rank: 43,
    name: "Shigenori Nakamura",
    country: "Japan",
    born: 1908,
    died: 2016,
    age: "108 yrs, 215 days",
  },
  {
    rank: 44,
    name: "Ichiro Watanabe",
    country: "Japan",
    born: 1909,
    died: 2017,
    age: "108 yrs, 200 days",
  },
  {
    rank: 45,
    name: "Kiyoshi Ota",
    country: "Japan",
    born: 1910,
    died: 2018,
    age: "108 yrs, 185 days",
  },
  {
    rank: 46,
    name: "Nobuyoshi Hara",
    country: "Japan",
    born: 1909,
    died: 2017,
    age: "108 yrs, 170 days",
  },
  {
    rank: 47,
    name: "Heizo Tanaka",
    country: "Japan",
    born: 1908,
    died: 2016,
    age: "108 yrs, 155 days",
  },
  {
    rank: 48,
    name: "Takuji Fujii",
    country: "Japan",
    born: 1908,
    died: 2016,
    age: "108 yrs, 140 days",
  },
  {
    rank: 49,
    name: "Sunao Fukawa",
    country: "Japan",
    born: 1909,
    died: 2017,
    age: "108 yrs, 125 days",
  },
  {
    rank: 50,
    name: "Joichi Nakashima",
    country: "Japan",
    born: 1907,
    died: 2015,
    age: "108 yrs, 110 days",
  },
];

const COUNTRY_FLAGS: Record<string, string> = {
  Japan: "🇯🇵",
  India: "🇮🇳",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
};

function getRankStyle(rank: number): {
  bg: string;
  border: string;
  glow: string;
  rankColor: string;
  medal: string;
} {
  if (rank === 1)
    return {
      bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      border: "1.5px solid rgba(245, 200, 66, 0.5)",
      glow: "0 4px 24px rgba(245, 200, 66, 0.18), 0 1px 4px rgba(0,0,0,0.06)",
      rankColor: "#d97706",
      medal: "🥇",
    };
  if (rank === 2)
    return {
      bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      border: "1.5px solid rgba(176, 184, 200, 0.6)",
      glow: "0 4px 24px rgba(176, 184, 200, 0.22), 0 1px 4px rgba(0,0,0,0.06)",
      rankColor: "#64748b",
      medal: "🥈",
    };
  if (rank === 3)
    return {
      bg: "linear-gradient(135deg, #fff7f3 0%, #fde8db 100%)",
      border: "1.5px solid rgba(212, 149, 106, 0.5)",
      glow: "0 4px 24px rgba(212, 149, 106, 0.18), 0 1px 4px rgba(0,0,0,0.06)",
      rankColor: "#c2622d",
      medal: "🥉",
    };
  return {
    bg: "#ffffff",
    border: "1px solid #d0dfef",
    glow: "0 1px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)",
    rankColor: "#8baec8",
    medal: "",
  };
}

function PodiumCard({ entry }: { entry: (typeof LEADERBOARD)[0] }) {
  const style = getRankStyle(entry.rank);
  const flag = COUNTRY_FLAGS[entry.country] ?? "🌏";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: (entry.rank - 1) * 0.08,
        ease: "easeOut",
      }}
      data-ocid={`leaderboard.item.${entry.rank}`}
      style={{
        background: style.bg,
        border: style.border,
        boxShadow: style.glow,
        borderRadius: 20,
        padding: "20px 18px",
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative shimmer stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.35))",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Rank badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
            width: 44,
          }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>{style.medal}</span>
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 800,
              color: style.rankColor,
              letterSpacing: "-0.01em",
              marginTop: 2,
            }}
          >
            #{entry.rank}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--echo-text, #0d1520)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {entry.name}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 12,
              color: "var(--echo-text-secondary, #5b7fa6)",
              marginBottom: 8,
            }}
          >
            {flag} {entry.country}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(127, 184, 232, 0.12)",
              border: "1px solid rgba(127, 184, 232, 0.25)",
              borderRadius: 99,
              padding: "4px 12px",
            }}
          >
            <span style={{ fontSize: 13 }}>⏳</span>
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#4a90c4",
                letterSpacing: "0.01em",
              }}
            >
              {entry.age}
            </span>
          </div>
        </div>

        {/* Born–Died */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--echo-text-muted, #8baec8)",
              letterSpacing: "0.03em",
            }}
          >
            b. {entry.born}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--echo-text-muted, #8baec8)",
              letterSpacing: "0.03em",
            }}
          >
            d. {entry.died}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ListRow({
  entry,
  index,
}: { entry: (typeof LEADERBOARD)[0]; index: number }) {
  const flag = COUNTRY_FLAGS[entry.country] ?? "🌏";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.025 + 0.3,
        ease: "easeOut",
      }}
      data-ocid={`leaderboard.item.${entry.rank}`}
      style={{
        background: "#ffffff",
        border: "1px solid #d0dfef",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Rank number */}
      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 800,
          color: "var(--echo-text-muted, #8baec8)",
          width: 28,
          flexShrink: 0,
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        #{entry.rank}
      </div>

      {/* Divider dot */}
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#d0dfef",
          flexShrink: 0,
        }}
      />

      {/* Name + country */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--echo-text, #0d1520)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.name}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 11,
            color: "var(--echo-text-secondary, #5b7fa6)",
            marginTop: 1,
          }}
        >
          {flag} {entry.country}
        </div>
      </div>

      {/* Age */}
      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: "#4a90c4",
          textAlign: "right",
          flexShrink: 0,
          maxWidth: 110,
        }}
      >
        {entry.age}
      </div>
    </motion.div>
  );
}

export function LeaderboardPage() {
  const podium = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--echo-bg, #f7f9fc)",
        paddingBottom: 96,
        overflowY: "auto",
      }}
      data-ocid="leaderboard.page"
    >
      {/* Header */}
      <div
        style={{
          padding: "28px 20px 20px",
          textAlign: "center",
          borderBottom: "1px solid var(--echo-border-faint, #e8f0fa)",
          background: "rgba(247, 249, 252, 0.9)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "var(--echo-text, #0d1520)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            🏆 Top 50 Longest Living
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 13,
              color: "var(--echo-text-secondary, #5b7fa6)",
              letterSpacing: "0.01em",
            }}
          >
            Verified Asian men — ranked by age at death
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 0" }}>
        {/* Podium — top 3 */}
        <div
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--echo-text-muted, #8baec8)",
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Podium
        </div>
        {podium.map((entry) => (
          <PodiumCard key={entry.rank} entry={entry} />
        ))}

        {/* Rest — ranks 4–50 */}
        <div
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--echo-text-muted, #8baec8)",
            margin: "20px 0 10px",
            paddingLeft: 4,
          }}
        >
          Rankings
        </div>
        {rest.map((entry, i) => (
          <ListRow key={entry.rank} entry={entry} index={i} />
        ))}

        {/* Footer attribution */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 0 8px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 11,
            color: "var(--echo-text-muted, #8baec8)",
            lineHeight: 1.6,
          }}
        >
          Data based on Gerontology Research Group verified records
        </div>
      </div>
    </div>
  );
}
