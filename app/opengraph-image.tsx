import { ImageResponse } from "next/og";

export const alt = "Maritime Expo Asia 2027, Sibu, Sarawak, September 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#1F4E79",
          color: "white",
        }}
      >
        <div style={{ fontSize: 32, color: "#DCE6F1" }}>Sibu, Sarawak · September 2027</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 16 }}>Maritime Expo Asia 2027</div>
        <div style={{ width: 160, height: 8, background: "#B45309", marginTop: 32 }} />
      </div>
    ),
    size,
  );
}
