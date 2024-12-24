import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ?title=<title>
    const hasTitle = searchParams.has("title");
    const title = hasTitle ? searchParams.get("title")?.slice(0, 100) : "";

    return new ImageResponse(
      <div
        style={{
          backgroundColor: "black",
          backgroundSize: "150px 150px",
          height: "100%",
          width: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            fontSize: 60,
          }}
        >
          🪄🪄✨
        </div>
        <div
          style={{
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            color: "white",
            marginTop: 30,
            padding: "0 120px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {title}
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: 18,
            position: "absolute",
            width: 800,
            height: 80,
            bottom: -25,
            left: 200,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 495,
            textAlign: "center",
            fontSize: 24,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            color: "black",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          manageprompt.com
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.log(
      e instanceof Error ? e.message : "Failed to generate the image",
    );
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
