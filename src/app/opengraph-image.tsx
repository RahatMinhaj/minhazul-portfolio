import { ImageResponse } from "next/og";

export const alt = "Developer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#080b0b",
        color: "#edf5f1",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundImage:
            "linear-gradient(#1b2925 1px, transparent 1px), linear-gradient(90deg, #1b2925 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          display: "flex",
          inset: 0,
          opacity: 0.6,
          position: "absolute",
        }}
      />
      <div
        style={{
          border: "1px solid #2e433d",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          maxWidth: "980px",
          padding: "58px",
          position: "relative",
          width: "100%",
        }}
      >
        <span style={{ color: "#58e6b0", fontSize: 22 }}>
          VERIFIED ENGINEERING PROFILE
        </span>
        <span
          style={{
            fontSize: 72,
            fontWeight: 650,
            letterSpacing: "-4px",
            lineHeight: 1,
            marginTop: 26,
          }}
        >
          Developer Portfolio
        </span>
        <span style={{ color: "#91a19b", fontSize: 26, marginTop: 28 }}>
          Systems, experience, and technical writing—without invented data.
        </span>
      </div>
    </div>,
    size,
  );
}
