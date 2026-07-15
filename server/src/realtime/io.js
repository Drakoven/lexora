let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function notifyGameUpdated(code) {
  if (ioInstance) ioInstance.to(code).emit("game:updated");
}
