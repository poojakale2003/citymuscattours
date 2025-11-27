import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

const logoPath = path.join(process.cwd(), "public/logo.jpg");
const logoBase64 = fs.readFileSync(logoPath).toString("base64");

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "12%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(data:image/jpeg;base64,${logoBase64})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}

