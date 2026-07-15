export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket.request.session?.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.on("game:watch", ({ code }) => {
      if (code) socket.join(code);
    });

    socket.on("game:unwatch", ({ code }) => {
      if (code) socket.leave(code);
    });

    socket.on("game:react", ({ code, emoji }) => {
      if (code) socket.to(code).emit("game:reaction", { emoji, userId });
    });
  });
}
