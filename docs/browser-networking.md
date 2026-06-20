# Browser Networking Notes

Last verified: 2026-06-20

## Goal

Keep browser-facing networking examples clear and safe.

The detailed WebTransport server and platform work belongs in `learning-platform-engineering`. This repository should focus on the client boundary:

- feature detection
- connection state UI
- fallback UI
- typed message payloads
- cleanup on component unmount
- accessibility for live updates

## WebTransport Client Checklist

- Check for `WebTransport` support before constructing a connection.
- Use HTTPS URLs with explicit ports for local experiments.
- Treat `transport.ready` and `transport.closed` as visible UI states.
- Keep stream and datagram handling separate.
- Add a WebSocket or SSE fallback path.
- Avoid putting credentials or long-lived tokens in browser code.

## Planned Lesson

```text
apps/
  realtime-client/
    src/
      transports/
        web-socket.ts
        server-sent-events.ts
        web-transport.ts
```

The lesson should start with a WebSocket/SSE client and add WebTransport after the platform example exists.

## References

- MDN WebTransport: https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
- Chrome WebTransport guide: https://developer.chrome.com/docs/capabilities/web-apis/webtransport
