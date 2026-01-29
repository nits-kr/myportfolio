import db from "@/lib/db";

export const syncOfflineMutations = async () => {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  if (!isOnline) return;

  const pendingMutations = await db.mutations
    .where("status")
    .equals("pending")
    .toArray();

  if (pendingMutations.length === 0) return;

  console.log(
    `[SyncService] Found ${pendingMutations.length} pending mutations to sync.`,
  );

  for (const mutation of pendingMutations) {
    try {
      // Mark as syncing
      await db.mutations.update(mutation.id, { status: "syncing" });

      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const headers = {
        "Content-Type": "application/json",
      };

      if (token && user) {
        if (user.role === "admin") {
          headers["x-auth-token-admin"] = token;
        } else {
          headers["x-auth-token-user"] = token;
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}${mutation.endpoint}`,
        {
          method: mutation.method,
          headers,
          body: mutation.body ? JSON.stringify(mutation.body) : undefined,
        },
      );

      if (response.ok) {
        // Successfully synced, remove from log
        await db.mutations.delete(mutation.id);
        console.log(
          `[SyncService] Successfully synced mutation ${mutation.id}`,
        );
      } else {
        // Failed, mark for retry
        await db.mutations.update(mutation.id, { status: "pending" });
        console.error(
          `[SyncService] Failed to sync mutation ${mutation.id}: ${response.statusText}`,
        );
      }
    } catch (error) {
      await db.mutations.update(mutation.id, { status: "pending" });
      console.error(
        `[SyncService] Error syncing mutation ${mutation.id}:`,
        error,
      );
    }
  }
};

// Initialize listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", syncOfflineMutations);
  // Also try to sync on load
  syncOfflineMutations();
}
