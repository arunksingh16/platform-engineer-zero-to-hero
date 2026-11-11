/* Course data for the Traffic management sub-course. Consumed by ../../course.js.
   A child folder of the Kubernetes course: its own progress key, and "up" goes to
   the parent course rather than the site index. */
const COURSE = {
  key: "kubernetes-traffic",
  title: "Ingress, gateways and service mesh",
  up: { href: "../index.html", label: "↖ Kubernetes" },
  lessons: [
    { n: 1, file: "01-how-traffic-gets-in.html", title: "How traffic gets in, and the layers involved", blurb: "North-south versus east-west, L4 versus L7, and what Services already give you." },
    { n: 2, file: "02-ingress.html", title: "Ingress and ingress controllers", blurb: "What the resource is, what the controller does, and why annotations hurt." },
    { n: 3, file: "03-gateway-api.html", title: "Gateway API: the successor to Ingress", blurb: "Role-oriented routing, and who owns which object." },
    { n: 4, file: "04-kong-and-api-gateways.html", title: "Kong and API gateways", blurb: "Auth, rate limits and plugins at the edge, versus plain routing." },
    { n: 5, file: "05-istio-and-service-mesh.html", title: "Istio and service meshes, plus how to choose", blurb: "Why Istio? A production scenario, simpler alternatives, sidecars, ambient and mTLS." },
  ],
};
