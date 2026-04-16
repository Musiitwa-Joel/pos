import index from "./index.html"

const isHost = process.argv.includes("--host");

// Start the Bun server to process HTML imports and bundle React and CSS
Bun.serve({
    hostname: isHost ? "0.0.0.0" : "127.0.0.1",
    routes: {
        "/": index,
        "/*": index, // Fallback for client-side routing
    },
    development: true
})