import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";

precacheAndRoute(self.__WB_MANIFEST);

// Fallback SPA pour la navigation directe (lien profond, rafraîchissement
// sur une route client) — les appels /api/* ne sont jamais interceptés,
// le jeu a besoin du vrai réseau pour ça.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [/^\/api\//],
  })
);

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Lexora", {
      body: data.body,
      icon: "/pwa-192x192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
