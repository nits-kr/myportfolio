import Dexie from "dexie";

export const db = new Dexie("PortfolioDB");

db.version(2).stores({
  // content stores the actual data from API calls
  // key: the endpoint/cache key, data: the payload, timestamp: when it was fetched
  content: "key, timestamp",

  // mutations stores a log of actions to be synced
  // id: auto-incrementing ID
  // type: 'POST', 'PATCH', 'DELETE'
  // endpoint: the API endpoint
  // payload: the data to send
  // status: 'pending', 'syncing', 'failed'
  // timestamp: when the mutation was created
  mutations: "++id, endpoint, status, timestamp",
});

export default db;
