const test = require('node:test');
const assert = require('node:assert/strict');
const math = require('../math.js');

const memory = { mode: 'inference', parameters: 7, bytes: 2, devices: 1, state: 14, activations: 2, layers: 32, heads: 8, dimension: 128, tokens: 4096, concurrency: 8, kvBytes: 2, overhead: 1, reserve: 2, capacity: 24 };
test('worked KV budget fits, doubled context exceeds capacity', () => {
  const base = math.memory(memory);
  assert.equal(base.parts.kv, 4);
  assert.ok(Math.abs(base.total - 22.0385160446167) < 1e-9);
  assert.equal(base.fits, true);
  const longer = math.memory({ ...memory, tokens: 8192 });
  assert.equal(longer.parts.kv, 8);
  assert.equal(longer.fits, false);
});
test('training excludes KV and only shards persistent state, not per-device allowances', () => {
  const one = math.memory({ ...memory, mode: 'training' });
  const two = math.memory({ ...memory, mode: 'training', devices: 2 });
  assert.equal(one.parts.kv, 0);
  assert.ok(one.total > 104);
  assert.equal(two.parts.weights + two.parts.training, (one.parts.weights + one.parts.training) / 2);
  assert.equal(two.parts.activations + two.parts.overhead + two.parts.reserve, 5);
});
test('checkpoint and input bottlenecks use distinct rates', () => {
  const r = math.pipeline({ storage: 8, cpu: 6, network: 5, demand: 4, checkpoint: 800, write: 4 });
  assert.equal(r.feed, 5);
  assert.equal(r.fraction, 1);
  assert.equal(r.seconds, 200);
});
test('lost replicas accumulate excess demand and cannot create negative service', () => {
  const r = math.fleet({ demand: 12, capacity: 4, replicas: 4, failed: 2, seconds: 60 });
  assert.equal(r.queue, 240);
  assert.equal(math.fleet({ demand: 12, capacity: 4, replicas: 4, failed: 5, seconds: 60 }).queue, 720);
});
test('training capstone meets deadline at higher cost than baseline', () => {
  const args = { tokens: 10, baseline: 20000, baselineGPUs: 8, gpus: 16, efficiency: 85, overhead: 8, deadline: 96, price: 3 };
  const candidate = math.training(args);
  const baseline = math.training({ ...args, gpus: 8, efficiency: 100 });
  assert.equal(candidate.throughput, 34000);
  assert.equal(candidate.hours.toFixed(2), '89.70');
  assert.equal(candidate.cost.toFixed(2), '4305.57');
  assert.equal(baseline.cost.toFixed(2), '3525.33');
  assert.ok(candidate.meets && !baseline.meets && candidate.cost > baseline.cost);
});
test('inference rounds up serving capacity before adding explicit failure spare', () => {
  const args = { demand: 12, capacity: 4, target: 75, lost: 1, perReplica: 2, price: 3 };
  assert.deepEqual(math.inference(args), { serving: 4, replicas: 5, gpus: 10, hourly: 30 });
  assert.equal(math.inference({ ...args, demand: 12.1 }).replicas, 6);
  assert.equal(math.inference({ ...args, demand: 24 }).hourly, 54);
});
