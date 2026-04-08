const DROPBOX_IMAGE =
  "https://dl.dropboxusercontent.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <img
        src={DROPBOX_IMAGE}
        alt="Minty"
        className="select-none"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
        style={{
          width: "clamp(200px, 55vw, 320px)",
          objectFit: "contain",
        }}
        draggable={false}
      />
    </div>
  );
}
