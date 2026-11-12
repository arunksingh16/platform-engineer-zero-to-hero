/* Pure planning arithmetic. Units and limitations are explained in lessons. */
(function (root) {
  const GiB = 2 ** 30;
  const math = {
    memory({ mode, parameters, bytes, devices, state, activations, layers, heads, dimension, tokens, concurrency, kvBytes, overhead, reserve, capacity }) {
      const weights = parameters * 1e9 * bytes / GiB / devices;
      const training = mode === "training" ? parameters * 1e9 * state / GiB / devices : 0;
      const kv = mode === "inference" ? 2 * layers * heads * dimension * tokens * concurrency * kvBytes / GiB / devices : 0;
      const parts = { weights, training, kv, activations, overhead, reserve };
      const total = Object.values(parts).reduce((a, b) => a + b, 0);
      return { parts, total, fits: total <= capacity };
    },
    pipeline({ storage, cpu, network, demand, checkpoint, write }) {
      const feed = Math.min(storage, cpu, network);
      return { feed, fraction: Math.min(1, feed / demand), seconds: checkpoint / write };
    },
    fleet({ demand, capacity, replicas, failed, seconds }) {
      const surviving = Math.max(0, replicas - failed);
      const service = surviving * capacity;
      return { surviving, service, queue: Math.max(0, demand - service) * seconds };
    },
    training({ tokens, baseline, baselineGPUs, gpus, efficiency, overhead, deadline, price }) {
      const throughput = baseline * gpus / baselineGPUs * efficiency / 100;
      const hours = tokens * 1e9 / throughput / 3600 + overhead;
      return { throughput, hours, cost: hours * gpus * price, meets: hours <= deadline };
    },
    inference({ demand, capacity, target, lost, perReplica, price }) {
      const serving = Math.ceil(demand / (capacity * target / 100));
      const replicas = serving + lost;
      return { serving, replicas, gpus: replicas * perReplica, hourly: replicas * perReplica * price };
    }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = math;
  else root.AIPlanning = math;
})(typeof globalThis !== "undefined" ? globalThis : this);
