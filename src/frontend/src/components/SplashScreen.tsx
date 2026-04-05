const SPLASH_IMAGE = "/assets/generated/minty-splash-logo.png";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <img
        src={SPLASH_IMAGE}
        alt="Minty"
        className="select-none"
        style={{
          width: "clamp(200px, 55vw, 320px)",
          objectFit: "contain",
        }}
        draggable={false}
      />
    </div>
  );
}
