/* No dependencies: diagrams remain readable without JavaScript. */
(function () {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-walkthrough]").forEach(function (lab) {
    const steps = Array.from(lab.querySelectorAll(".net-flow > li"));
    const controls = document.createElement("div");
    controls.className = "net-controls";
    const status = document.createElement("p");
    status.className = "net-status";
    status.setAttribute("role", "status");
    let current = 0;
    let timer = null;
    function button(text, action) {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = text;
      element.addEventListener("click", action);
      controls.appendChild(element);
      return element;
    }
    function stop() {
      window.clearInterval(timer);
      timer = null;
      play.textContent = "Play walkthrough";
    }
    function draw() {
      steps.forEach(function (step, index) {
        step.classList.toggle("is-current", index === current);
        if (index === current) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      previous.disabled = current === 0;
      next.disabled = current === steps.length - 1;
      status.textContent = "Step " + (current + 1) + " / " + steps.length + ": " + steps[current].querySelector("strong").textContent;
    }
    const previous = button("Previous step", function () { stop(); current = Math.max(0, current - 1); draw(); });
    const next = button("Next step", function () { stop(); current = Math.min(steps.length - 1, current + 1); draw(); });
    const play = button("Play walkthrough", function () {
      if (timer !== null) { stop(); return; }
      if (current === steps.length - 1) current = 0;
      draw();
      play.textContent = "Pause walkthrough";
      timer = window.setInterval(function () {
        current += 1;
        draw();
        if (current === steps.length - 1) stop();
      }, 3000);
    });
    button("Reset", function () { stop(); current = 0; draw(); });
    function motionPreference() { stop(); play.hidden = reducedMotion.matches; }
    reducedMotion.addEventListener("change", motionPreference);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });
    lab.appendChild(controls);
    lab.appendChild(status);
    motionPreference();
    draw();
  });

  const prefix = document.getElementById("net-prefix");
  if (prefix) {
    const bits = document.getElementById("net-bits");
    for (let i = 0; i < 32; i += 1) bits.appendChild(document.createElement("span"));
    function subnet() {
      const n = Number(prefix.value);
      const total = 2 ** (32 - n);
      Array.from(bits.children).forEach(function (bit, i) { bit.classList.toggle("host-bit", i >= n); });
      document.getElementById("net-subnet-result").textContent = "10.20.4.0/" + n + ": " + n + " network bits + " + (32 - n) + " host bits = " + total + " addresses (.0–." + (total - 1) + "). Ordinary AWS/Azure IPv4 subnet: " + (total - 5) + " assignable; 61 needed. " + (total - 5 >= 61 ? "Fits this address budget." : "Does not fit this address budget.");
    }
    prefix.addEventListener("input", subnet);
    subnet();
  }
  const clock = document.getElementById("net-dns-time");
  if (clock) {
    function dns() {
      const t = Number(clock.value);
      document.getElementById("net-dns-ttl").value = Math.max(0, 60 - t);
      document.getElementById("net-dns-result").textContent = "t=" + t + "s. Authoritative answer: region " + (t < 10 ? "A" : "B") + ". Resolver: " + (t < 60 ? "cached A, " + (60 - t) + "s TTL remaining" : "cache expired; next lookup can fetch B") + ". " + (t < 10 ? "Region A is healthy." : "A has failed. A fresh connection using cached A fails; an existing connection cannot migrate via DNS.");
    }
    clock.addEventListener("input", dns);
    dns();
  }
  const packet = document.getElementById("net-packet-size");
  if (packet) {
    const signaling = document.getElementById("net-icmp");
    function mtu() {
      const size = Number(packet.value);
      const fits = size <= 1400;
      document.getElementById("net-packet-meter").value = size;
      document.getElementById("net-mtu-result").textContent = size + "-byte inner IPv4 packet + 100-byte assumed tunnel overhead = " + (size + 100) + " bytes on a 1500-byte underlay. " + (fits ? "Fits. This does not prove other parts of the connection work." : signaling.checked ? "Too large with DF set. ICMP fragmentation-needed reaches the sender, which can reduce packet size and retry." : "Too large with DF set; packet dropped and ICMP blocked. Classic PMTUD stalls until another recovery mechanism intervenes: the small-probe / large-transfer trap.");
    }
    packet.addEventListener("input", mtu);
    signaling.addEventListener("change", mtu);
    mtu();
  }
})();
