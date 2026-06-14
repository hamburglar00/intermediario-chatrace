export default function HomePage() {
  return (
    <main className="stage">
      <div className="glow" />
      <section className="hero" aria-label="Intermediario Chatrace">
        <div className="fire" aria-hidden="true">
          <span className="flame flameOne" />
          <span className="flame flameTwo" />
          <span className="flame flameThree" />
          <span className="flame flameFour" />
          <span className="core" />
          <span className="spark sparkOne" />
          <span className="spark sparkTwo" />
          <span className="spark sparkThree" />
        </div>
        <p className="eyebrow">API online</p>
        <h1>intermediario chatrace</h1>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #08090d;
          color: #fff7ed;
          font-family: Arial, Helvetica, sans-serif;
        }

        .stage {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 32px;
          background:
            radial-gradient(circle at 50% 72%, rgba(255, 122, 24, 0.2), transparent 34%),
            linear-gradient(145deg, #08090d 0%, #151016 48%, #09080b 100%);
        }

        .glow {
          position: absolute;
          width: min(520px, 80vw);
          aspect-ratio: 1;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 91, 15, 0.34), transparent 68%);
          filter: blur(24px);
          transform: translateY(112px);
          animation: glowPulse 2.8s ease-in-out infinite;
        }

        .hero {
          position: relative;
          z-index: 1;
          display: grid;
          justify-items: center;
          gap: 18px;
          text-align: center;
        }

        .fire {
          position: relative;
          width: 156px;
          height: 190px;
          filter: drop-shadow(0 0 22px rgba(255, 95, 0, 0.74));
        }

        .flame,
        .core {
          position: absolute;
          left: 50%;
          bottom: 14px;
          display: block;
          border-radius: 48% 52% 46% 54%;
          transform: translateX(-50%) rotate(45deg);
          transform-origin: center bottom;
        }

        .flameOne {
          width: 112px;
          height: 112px;
          background: linear-gradient(135deg, #ff2d00 0%, #ff7a18 48%, #ffd166 100%);
          animation: flameDance 1.12s ease-in-out infinite;
        }

        .flameTwo {
          width: 86px;
          height: 86px;
          bottom: 36px;
          background: linear-gradient(135deg, #ff7a18 0%, #ffbe0b 55%, #fff3b0 100%);
          animation: flameDance 0.92s ease-in-out infinite reverse;
        }

        .flameThree {
          width: 68px;
          height: 68px;
          left: 35%;
          bottom: 22px;
          background: linear-gradient(135deg, #f94144 0%, #f3722c 55%, #f9c74f 100%);
          animation: sideFlicker 1.24s ease-in-out infinite;
        }

        .flameFour {
          width: 62px;
          height: 62px;
          left: 66%;
          bottom: 26px;
          background: linear-gradient(135deg, #ff5400 0%, #ff9f1c 62%, #fff1a8 100%);
          animation: sideFlicker 1.02s ease-in-out infinite reverse;
        }

        .core {
          width: 44px;
          height: 44px;
          bottom: 24px;
          background: #fff7ad;
          box-shadow: 0 0 34px rgba(255, 243, 176, 0.95);
          animation: corePulse 0.8s ease-in-out infinite;
        }

        .spark {
          position: absolute;
          bottom: 46px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ffd166;
          box-shadow: 0 0 14px rgba(255, 209, 102, 0.95);
          animation: sparkRise 1.6s ease-in-out infinite;
        }

        .sparkOne {
          left: 34px;
          animation-delay: 0.1s;
        }

        .sparkTwo {
          left: 78px;
          animation-delay: 0.45s;
        }

        .sparkThree {
          left: 118px;
          animation-delay: 0.8s;
        }

        .eyebrow {
          margin: 0;
          color: #ffd166;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          max-width: 760px;
          font-size: 88px;
          line-height: 0.92;
          letter-spacing: 0;
          text-transform: uppercase;
          text-shadow:
            0 0 18px rgba(255, 122, 24, 0.72),
            0 10px 34px rgba(0, 0, 0, 0.5);
        }

        @keyframes flameDance {
          0%, 100% {
            transform: translateX(-50%) rotate(45deg) scale(1);
            border-radius: 48% 52% 46% 54%;
          }

          50% {
            transform: translateX(-50%) rotate(39deg) scale(1.08, 0.94);
            border-radius: 58% 42% 52% 48%;
          }
        }

        @keyframes sideFlicker {
          0%, 100% {
            transform: translateX(-50%) rotate(45deg) scale(0.96);
          }

          50% {
            transform: translateX(-50%) rotate(54deg) scale(1.14, 0.9);
          }
        }

        @keyframes corePulse {
          0%, 100% {
            opacity: 0.86;
            transform: translateX(-50%) rotate(45deg) scale(0.92);
          }

          50% {
            opacity: 1;
            transform: translateX(-50%) rotate(45deg) scale(1.08);
          }
        }

        @keyframes sparkRise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.4);
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(-116px) translateX(18px) scale(1);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.62;
            transform: translateY(112px) scale(0.96);
          }

          50% {
            opacity: 1;
            transform: translateY(112px) scale(1.08);
          }
        }

        @media (max-width: 680px) {
          .stage {
            padding: 24px;
          }

          .fire {
            width: 128px;
            height: 164px;
          }

          h1 {
            font-size: 42px;
            line-height: 0.98;
          }
        }
      `}</style>
    </main>
  );
}
