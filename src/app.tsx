import { ExternalLink, Globe2, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"

const DISCORD_SERVER_URL = "https://discord.com/servers/chillkahue-1168847276291137586"
const DISCORD_WIDGET_URL = "https://discord.com/widget?id=1168847276291137586&theme=dark"
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`
const SERVER_BANNER_URL = assetUrl("server-banner.png")
const SERVER_ICON_URL = assetUrl("server-icon.png")
const SERVER_NAME = "🍭CHILLカフェ"
const SERVER_DESCRIPTION = "雑談・作業・ゲーム・お酒、まったりいろんなチルをするためのサーバー。"
const SERVER_ABOUT = `このサーバーでは、まったりゆったりした雰囲気で、雑談・作業通話・ゲーム・お酒などをのんびり楽しむことができます。

特に参加制限は設けておりませんが、ルールを細かめに設定していますので、ある程度以上の良識をお持ちの方向けの場となっています。お互いに気持ちよく過ごせる空気感を大切にしたいので、その点ご理解いただける方の参加を歓迎しています。

サーバー内には雑談チャンネルや作業チャンネルが用意されており、もくもく作業したい日も、誰かとおしゃべりしたい日も、その時の気分に合わせて使い分けていただけます。また、各々が自由にVCを作成することもできますので、少人数でゆるく集まったり、特定のゲームで遊んだりといった使い方も可能です。

節度をもってお互いを尊重し合いながら、ゆるやかに交流することを目指しています。そのため、出会い・恋愛を最初から目的とした参加、いきなりのフレンド申請やDMなどはNGとさせていただいておりますので、ご了承ください。

ゆったりとした時間を一緒に過ごせる方のご参加をお待ちしています。`

const reasonsToJoin = [
  {
    emojiName: "💬",
    reason: "まったり雑談を楽しめます。"
  },
  {
    emojiName: "✏️",
    reason: "ゆったりと作業通話ができます。"
  },
  {
    emojiName: "🔊",
    reason: "自由なコンセプトのVCを作ることができます。"
  },
  {
    emojiName: "🎮",
    reason: "ゲームやお酒などの交流もできます。（作業空間での飲酒は禁止です）"
  }
]

const categories = [
  "Writing",
  "Collaboration",
  "General Chatting",
  "Crafts, DIY, & Making",
  "Content Creator"
]

export function App() {
  return (
    <main className="min-h-screen min-w-[390px] overflow-hidden bg-[#fff5fa] font-['M_PLUS_Rounded_1c'] text-[#4a3342]">
      <section className="relative isolate overflow-hidden bg-[#fff5fa]">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[linear-gradient(180deg,#fff8fb_0%,#ffe9f3_100%)]">
          <img
            src={SERVER_BANNER_URL}
            alt="🍭CHILLカフェのアイキャッチ画像"
            width="1800"
            height="1013"
            fetchPriority="high"
            className="size-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,245,250,0)_0%,rgba(255,245,250,0.05)_68%,#fff5fa_100%),linear-gradient(90deg,rgba(255,245,250,0.24)_0%,rgba(255,245,250,0.08)_45%,rgba(255,245,250,0)_100%)]" />
        </div>

        <div className="relative z-10 -mt-10 bg-[linear-gradient(180deg,rgba(255,245,250,0)_0%,rgba(255,245,250,0.92)_26%,#fff5fa_100%)] pt-12 shadow-[0_-18px_48px_rgba(190,112,150,0.08)] md:-mt-16 md:bg-[linear-gradient(90deg,rgba(255,245,250,0.9)_0%,rgba(255,245,250,0.64)_48%,rgba(255,245,250,0)_100%),linear-gradient(180deg,rgba(255,245,250,0)_0%,#fff5fa_72%)] md:pt-16">
          <div className="mx-auto w-full max-w-6xl px-5 pb-5 md:px-8 md:py-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 gap-4 md:items-center">
                <img
                  src={SERVER_ICON_URL}
                  alt=""
                  aria-hidden="true"
                  width="720"
                  height="720"
                  className="size-16 shrink-0 rounded-[20px] border-[5px] border-white bg-white object-cover shadow-[0_12px_28px_rgba(190,112,150,0.24)] md:size-24 md:rounded-[26px]"
                />
                <div className="min-w-0">
                  <h1 className="text-4xl font-black leading-none tracking-normal text-[#4a3342] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)] md:text-6xl">
                    {SERVER_NAME}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#6d4e61] drop-shadow-[0_2px_10px_rgba(255,255,255,0.95)] md:text-base">
                    {SERVER_DESCRIPTION}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:items-center">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full !bg-[#5865f2] px-8 font-bold !text-white shadow-[0_14px_34px_rgba(88,101,242,0.28)] hover:!bg-[#4752c4]"
                >
                  <a href={DISCORD_SERVER_URL} target="_blank" rel="noreferrer">
                    Join Server
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <a
                  href="#about"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#e7aeca] bg-white/76 px-7 text-sm font-bold text-[#6b3f58] shadow-[0_12px_28px_rgba(226,141,177,0.12)] backdrop-blur transition hover:bg-white"
                >
                  About
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#fff5fa]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.78fr_1.22fr] md:px-8 md:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">About</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-normal text-[#4a3342] md:text-5xl">
              About
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-8 text-[#735568] md:text-base">
            {SERVER_ABOUT.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#f5c6da] bg-white/56">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">
            Reasons to join
          </p>
          <div className="mt-8 divide-y divide-[#f1c7d9]">
            {reasonsToJoin.map((item) => (
              <div
                key={item.reason}
                className="grid gap-4 py-6 md:grid-cols-[92px_1fr] md:items-center"
              >
                <span
                  className="grid size-16 place-items-center rounded-full bg-[#fff0f6] text-3xl ring-1 ring-[#f6c6d9]"
                  aria-hidden="true"
                >
                  {item.emojiName}
                </span>
                <p className="text-xl font-bold leading-8 text-[#5d4053]">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#fff5fa_0%,#f9ecf7_100%)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8669b]">Discord</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-normal text-[#4a3342] md:text-5xl">
              Discord
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#735568]">
              {SERVER_DESCRIPTION}
            </p>
            <Button
              size="lg"
              asChild
              className="mt-8 h-12 rounded-full !bg-[#5865f2] px-8 font-bold !text-white shadow-[0_14px_34px_rgba(88,101,242,0.24)] hover:!bg-[#4752c4]"
            >
              <a href={DISCORD_SERVER_URL} target="_blank" rel="noreferrer">
                Join Server
                <ExternalLink className="size-4" />
              </a>
            </Button>

            <div className="mt-10 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 rounded-full bg-white/72 px-3 py-1.5 text-sm font-bold text-[#8a4965] ring-1 ring-[#f6c6d9]"
                >
                  <Hash className="size-3.5" />
                  {category}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-1.5 text-sm font-bold text-[#6b3f58] ring-1 ring-[#f6c6d9]">
                <Globe2 className="size-4 text-[#d8669b]" />
                Japanese
              </span>
            </div>
          </div>

          <iframe
            src={DISCORD_WIDGET_URL}
            title="Discord server widget"
            width="350"
            height="500"
            allowTransparency={true}
            frameBorder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="h-[500px] w-[350px] max-w-full rounded-[22px] border-0 bg-[#313338] shadow-[0_22px_48px_rgba(190,112,150,0.24)]"
          />
        </div>
      </section>
    </main>
  )
}
