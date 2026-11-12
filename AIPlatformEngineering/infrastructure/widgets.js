/* Progressive enhancement: static explanations and diagrams work without JS. */
(function () {
  const fmt = (n, digits = 2) => n.toLocaleString("en-US", { maximumFractionDigits: digits });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-story]").forEach((story) => {
    const steps = [...story.querySelectorAll(".ai-flow > li")];
    const controls = document.createElement("div");
    controls.className = "ai-controls";
    controls.innerHTML = '<button type="button">Play</button><button type="button">Pause</button><button type="button">Step</button><button type="button">Reset</button>';
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    story.append(controls, status);
    let index = 0, timer;
    const [play, pause, step, reset] = controls.children;
    function draw() {
      steps.forEach((s, i) => i === index ? s.setAttribute("aria-current", "step") : s.removeAttribute("aria-current"));
      status.textContent = `Step ${index + 1} of ${steps.length}: ${steps[index].innerText.replace(/\s+/g, " ")}`;
    }
    function stop() { clearInterval(timer); timer = undefined; pause.disabled = true; play.disabled = false; }
    function next() { index = (index + 1) % steps.length; draw(); if (index === steps.length - 1) stop(); }
    play.onclick = () => {
      stop();
      if (reduced.matches) { next(); return; }
      if (index === steps.length - 1) { index = 0; draw(); }
      play.disabled = true; pause.disabled = false;
      timer = setInterval(next, 1600);
    };
    pause.onclick = stop;
    step.onclick = () => { stop(); next(); };
    reset.onclick = () => { stop(); index = 0; draw(); };
    reduced.addEventListener("change", stop);
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
    stop(); draw();
  });

  document.querySelectorAll("[data-calculator]").forEach((widget) => {
    const output = widget.querySelector("output");
    const fields = [...widget.querySelectorAll("input, select")];
    function update() {
      if (fields.some((field) => !field.checkValidity() || field.value === "")) {
        output.textContent = "Enter values within the labeled ranges; every field is required.";
        widget.querySelector(".ai-bars")?.replaceChildren();
        const legend = widget.querySelector(".ai-legend");
        if (legend) legend.textContent = "";
        return;
      }
      const v = Object.fromEntries(fields.map((f) => [f.name, f.type === "number" || f.type === "range" ? Number(f.value) : f.value]));
      switch (widget.dataset.calculator) {
        case "memory": {
          const r = AIPlanning.memory(v);
          output.textContent = `${fmt(r.total)} GiB per device including reserve / ${fmt(v.capacity)} GiB capacity. ${r.fits ? "Fits this simplified budget; benchmark peak allocation." : "Does not fit this budget: change the workload or placement."}`;
          const labels = { weights: "Weights", training: "Other training state", kv: "KV cache", activations: "Activations / workspace", overhead: "Runtime overhead", reserve: "Unused reserve" };
          const bar = widget.querySelector(".ai-bars");
          bar.replaceChildren();
          Object.entries(r.parts).forEach(([key, value]) => {
            const part = document.createElement("span");
            part.style.width = `${value / Math.max(r.total, v.capacity) * 100}%`;
            part.title = `${labels[key]}: ${fmt(value)} GiB`;
            bar.append(part);
          });
          widget.querySelector(".ai-legend").textContent = Object.entries(r.parts).map(([k, n]) => `${labels[k]}: ${fmt(n)} GiB`).join(" · ");
          break;
        }
        case "pipeline": {
          const r = AIPlanning.pipeline(v);
          output.textContent = `Feed ceiling: ${fmt(r.feed)} GB/s; ${fmt(r.fraction * 100)}% of requested input rate (not GPU utilization). Checkpoint write lower bound: ${fmt(r.seconds)} s. Bottleneck: ${r.feed === v.storage ? "storage" : r.feed === v.cpu ? "CPU preprocessing" : "network"}.`;
          break;
        }
        case "fleet": {
          const r = AIPlanning.fleet(v);
          output.textContent = `${r.surviving} ready replicas × ${v.capacity} requests/s = ${fmt(r.service)} requests/s. Fluid-model excess queue after ${v.seconds} s: ${fmt(r.queue)} requests. ${r.service >= v.demand ? "Mean demand can be served; tail latency still needs a load test." : "Arrivals exceed service capacity; bound queues and apply admission control."}`;
          break;
        }
        case "training": {
          const r = AIPlanning.training(v);
          output.textContent = `${fmt(r.throughput)} tokens/s → ${fmt(r.hours)} hours including overhead. ${r.meets ? "Meets" : "Misses"} ${v.deadline}-hour deadline. Accelerator allocation cost: $${fmt(r.cost)}. This is a scenario, not an extrapolated benchmark guarantee.`;
          break;
        }
        case "inference": {
          const r = AIPlanning.inference(v);
          output.textContent = `${r.serving} serving replicas + ${v.lost} failure-spare replicas = ${r.replicas} provisioned replicas; ${r.gpus} GPUs; $${fmt(r.hourly)}/hour accelerator allocation. Spread replicas so one failure removes at most ${v.lost}; test recovery load.`;
          break;
        }
      }
    }
    widget.addEventListener("input", update);
    update();
  });

  const selector = document.querySelector("[data-accelerators]");
  if (selector) {
    const update = () => {
      const memory = Number(selector.querySelector("input").value);
      const needFabric = selector.querySelector("select").value === "yes";
      if (!selector.querySelector("input").checkValidity() || selector.querySelector("input").value === "") {
        selector.querySelector("output").textContent = "Enter a memory budget from 1 to 200 GiB."; return;
      }
      let count = 0;
      selector.querySelectorAll("tbody tr").forEach((row) => {
        const fits = Number(row.dataset.memory) >= memory && (!needFabric || row.dataset.fabric === "yes");
        row.lastElementChild.textContent = fits ? "Candidate: verify software and benchmark" : "Fails selected constraint";
        if (fits) count++;
      });
      selector.querySelector("output").textContent = `${count} hypothetical candidates pass these two gates. This is not a performance ranking.`;
    };
    selector.addEventListener("input", update); update();
  }

  const scheduler = document.querySelector("[data-scheduler]");
  if (scheduler) {
    const layout = scheduler.querySelector(".ai-nodes");
    const select = scheduler.querySelector("select");
    function draw() {
      const packed = select.value === "packed";
      layout.replaceChildren();
      [0, 1].forEach((n) => {
        const node = document.createElement("div"); node.className = "ai-node";
        const label = document.createElement("strong"); label.textContent = `Node ${n + 1}: 4 GPUs`; node.append(label);
        for (let g = 0; g < 4; g++) {
          const busy = packed ? n === 0 : g < 2;
          const gpu = document.createElement("span"); gpu.className = `ai-gpu${busy ? " busy" : ""}`;
          gpu.textContent = `${g + 1}: ${busy ? "occupied" : "free"}`; node.append(gpu);
        }
        layout.append(node);
      });
      scheduler.querySelector("output").textContent = packed ? "4 free GPUs on node 2: the single-node 4-GPU Pod can fit, if its other constraints pass. Repacking requires planned eviction/checkpointing; running Pods do not move automatically." : "4 free GPUs total, but only 2 per node: the single-node 4-GPU Pod is Pending. An ordinary Pod cannot combine devices from two nodes.";
    }
    select.addEventListener("change", draw); draw();
  }
})();
