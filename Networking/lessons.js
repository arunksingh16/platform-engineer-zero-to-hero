/* Course data consumed by ../course.js. */
const COURSE = {
  key: "networking",
  title: "Networking fundamentals",
  lessons: [
    { n: 1, file: "01-follow-the-packet.html", title: "Follow the packet", blurb: "Layers, gateways, request paths and ownership." },
    { n: 2, file: "02-addressing-and-routing.html", title: "Addresses, subnets and routes", blurb: "CIDR, IP budgets, longest-prefix matching and return paths." },
    { n: 3, file: "03-dns-and-discovery.html", title: "DNS and service discovery", blurb: "Resolvers, caching, private zones and failover limits." },
    { n: 4, file: "04-transport-and-tls.html", title: "TCP, UDP, HTTP and TLS", blurb: "Connections, encryption, latency, MTU and timeouts." },
    { n: 5, file: "05-load-balancing.html", title: "When and how to load balance", blurb: "L4 versus L7, algorithms, health checks and draining." },
    { n: 6, file: "06-aws-and-azure.html", title: "Choose an AWS or Azure service", blurb: "Regional, global, DNS, CDN and appliance decisions." },
    { n: 7, file: "07-vm-load-balancing.html", title: "Load balancing a fleet of VMs", blurb: "HAProxy, NGINX, Envoy and the highly available front door." },
    { n: 8, file: "08-private-connectivity.html", title: "Private connectivity and egress", blurb: "VPCs/VNets, firewalls, NAT, private endpoints and hybrid links." },
    { n: 9, file: "09-edge-and-streaming.html", title: "Edge delivery and streaming", blurb: "CDNs, cache safety, global routing and origin protection." },
    { n: 10, file: "10-resilience-and-capacity.html", title: "Capacity and failure design", blurb: "Zone loss, retries, connection budgets and network cost." },
    { n: 11, file: "11-troubleshooting.html", title: "Debug the request path", blurb: "DNS to application: evidence, tools and incident drills." },
    { n: 12, file: "12-design-review.html", title: "Design a streaming platform", blurb: "A worked AWS, Azure and VM capstone with primary references." },
  ],
};
