# NGINX workshop

## What is NGINX?

Is an open source, high-performance, highly scalable and highly available web, reverse proxy and web accelerator due to its features, whic allows to do caching, buffering, compression, load balancing and more. It was developed by Igor Sysoev to solve a problem known as C10k (10000 concurrent connections). Actually is being used by companies like Airbnb, Dropbox, Netflix, Tumblr and many others for scalability and performance reasons.

## Back to basics: Forward vs Reverse

### Forward Proxy
A forward proxy, often called a proxy, proxy server, or web proxy, is a server that sits in front of a group of client machines. When those computers make requests to sites and services on the Internet, the proxy server intercepts those requests and then communicates with web servers on behalf of those clients, like a middleman. The most general use cases are:
- Avoid restrinctions
- Content blocking
- Identity Protection
- Caching

![Forward](https://gitlab.com/gonzalo.spina/nginx-workshop/blob/master/static/forward-proxy-flow.jpg)

### Reverse Proxy

A reverse proxy server is a type of proxy server that sits in front of one or more web servers. This is different from a forward proxy, where the proxy sits in front of the clients. With a reverse proxy, when clients send requests to the origin server of a website, those requests are intercepted at the network edge by the reverse proxy server and redirects them to the proper backend server. They are generally used for:
- Load balancing
- Web acceleration
- Security and anonymity

We will be covering these concepts along this course

![Reverse](https://gitlab.com/gonzalo.spina/nginx-workshop/blob/master/static/reverse-proxy-flow.jpg)

## Web Acceleration with NGINX

Refers to speeding up the transfer of content between web servers and client browsers by using a variety of techniques such as caching and compression.
High‑traffic websites must support hundreds of thousands, if not millions, of users in a fast, reliable manner. To scale to meet such high volumes, modern computing best practice usually calls for adding more server hardware, which can become expensive. Web acceleration instead employs other methods to speed delivery of both static and dynamic content, enabling your web servers to handle more client requests without the need for more hardware.

### Cache Server

Caching accelerates content serving by storing request responses to be served again in the future. Content caching reduces load to upstream servers, caching the full response rather than running computations and queries again for the same request. Caching increases performance and reduces load, meaning you can serve faster with fewer resources. Scaling and distributing caching servers in strategic locations can have a dramatic effect on user experience. It’s optimal to host content close to the consumer for the best performance. You can also cache your content close to your users. This is the pattern of content delivery networks, or CDNs. With NGINX you’re able to cache your content wherever you can place an NGINX server, effectively enabling you to create your own CDN. With NGINX caching, you’re also able to passively cache and serve cached responses in the event of an upstream failure.

[Creating a reverse Proxy Cache server with NGINX](https://gitlab.com/gonzalo.spina/nginx-workshop/tree/master/src/web-acceleration/caching-content)

#### NGINX vs Redis. What should I use?

*Redis*: is an open-source **key value** store that can operate as both an in-memory store and as cache. Redis is a data structure server that can be used as a database server on its own, or paired with a relational database like MySQL to speed things up.

Nginx is used for caching dynamic and static content that is served through the backend server. When a web page is cached, repeated requests for the same page by web clients are quickly returned by NGINX because the page is pulled from a cached location, instead of compiling all the data again. A page is cached as a whole (all the data the makes up the page is stored together).

Both caching methods are pretty good, but which is actually better? There's no a better or faster solution, so you should choose what fits best for you.

Crudely, you would use a "low-level" cache like Redis to cache raw data, like the results of a database query for example; Whereas you would use a "higher-level" cache like Nginx to cache the whole HTML page on which the data is being displayed. So which one is appropriate depends somewhat on your usecase. If you have one simple page (or page fragment) which contains the slow data, and the content displayed is the same for all clients, then a high-level cache might be appropriate. If the content depends on lots of little tweaks and reformats which would make a whole-page cache very fragmented, then a lower-level cache would be appropriate.

In reality, this isn't entirely true, as you can store whole pages in Redis and individual data fragments in NGINX. So what will define the technology will mostly depend on your infraestructure and yor data.

#### NGINX + Redis

NGINX provides its own [module](https://www.nginx.com/resources/wiki/modules/redis/) to plugin a Redis instance so they can work together. Also if it suits your application needs, you could have an implementation of both technologies around.

### Buffering
Buffering is method that involves pre-loading data into a certain area of memory known as a “buffer”, so the data can be accessed more quickly.

By default, NGINX provides a buffering method to off load the proxied server by storing the outgoing responses in its internal buffers. When a response is stored in the buffers, is not sent to the client until the whole response is received. Buffering helps to optimize performance with slow clients, which can waste proxied server time if the response is passed from NGINX to the client synchronously. This allows the proxied server to process responses quickly, while NGINX stores the responses for as much time as the clients need to download them.

If buffering is disabled, the response is sent to the client synchronously while it is receiving it from the proxied server. This behavior may be desirable for fast interactive clients that need to start receiving the response as soon as possible. However, disabling buffering but can make the backend server vulnerable to a Slowloris attack. Slowloris is a type of denial-of-service (DOS) attack, which allows an attacker to overwhelm a targeted server by opening and maintaining many simultaneous HTTP connections between the attacker and the target. It operates by using partial HTTP requests. The attack is made by opening connections to a targeted Web server and then keeping those connections open as long as it can.

[Tunning NGINX Buffering](https://gitlab.com/gonzalo.spina/nginx-workshop/tree/master/src/web-acceleration/buffering-offload)

### Compression
HTTP compression is a capability that can be built into web servers and web clients to improve transfer speed and bandwidth utilization.
HTTP data is compressed before it is sent from the server: compliant browsers will announce what methods are supported to the server before downloading the correct format; browsers that do not support compliant compression method will download uncompressed data. The most common compression schemes include gzip and Deflate.

Compressing responses often significantly reduces the size of transmitted data. However, since compression happens at runtime it can also add considerable processing overhead which can negatively affect performance. NGINX performs compression before sending responses to clients, but does not “double compress” responses that are already compressed (for example, by a proxied server).

By default, NGINX does not compress responses to proxied requests (requests that come from the proxy server). The fact that a request comes from a proxy server is determined by the presence of the Via header field in the request. To configure compression of these responses, use the gzip_proxied directive. The directive has a number of parameters specifying which kinds of proxied requests NGINX should compress. For example, it is reasonable to compress responses only to requests that will not be cached on the proxy server. For this purpose the gzip_proxied directive has parameters that instruct NGINX to check the Cache-Control header field in a response and compress the response if the value is no-cache, no-store, or private. In addition, you must include the expired parameter to check the value of the Expires header field. These parameters are set in the following example, along with the auth parameter, which checks for the presence of the Authorization header field

[Guide to enable the NGINX copression features](https://gitlab.com/gonzalo.spina/nginx-workshop/tree/master/src/web-acceleration/buffering-offload)

## Load Balancing & DNS Resolving for Scaling services.

Load balancing refers to efficiently distributing incoming network traffic across a group of backend servers, also known as a server farm or server pool. Load balancing has a positive impact in the latest user experience.

### Hardware vs. Software Load Balancing
Load balancers typically come in two flavors: hardware‑based and software‑based. Vendors of hardware‑based solutions load proprietary software onto the machine they provide, which often uses specialized processors. To cope with increasing traffic at your website, you have to buy more or bigger machines from the vendor. Software solutions generally run on commodity hardware, making them less expensive and more flexible. You can install the software on the hardware of your choice or in cloud environments like AWS EC2.

Today’s internet user experience demands performance and uptime. To achieve this, multiple copies of the same system are run, and the load is distributed over them. As the load increases, another copy of the system can be brought online. This architecture technique is called horizontal scaling. Software-based infrastructure is increasing in popularity because of its flexibility, opening up a vast world of possibilities. Whether the use case is as small as a set of two for high availability or as large as thousands around the globe, there’s a need for a load-balancing solution that is as dynamic as the infrastructure. NGINX fills this need in a number of ways, such as HTTP, TCP, and UDP load balancing.

### Healthy apps
Also, ensuring that the application is healthy is really important. For a number of reasons, applications fail. It could be because of network connectivity, server failure, or application failure, for example. Proxies and load balancers must be smart enough to detect failure of upstream servers and stop passing traffic to them; otherwise, the client will be waiting, only to be delivered a timeout. A way to mitigate service degradation when a server fails is to have the proxy check the health of the upstream servers. NGINX offers two different types of health checks: passive, available in the open source version; and active. Active health checks at regular intervals will make a connection or request to the upstream server and can verify that the response is correct. Passive health checks monitor the connection or responses of the upstream server as clients make the request or connection. You might want to use passive health checks to reduce the load of your upstream servers, and you might want to use active health checks to determine failure of an upstream server before a client is served a failure. The tail end of this chapter examines monitoring the health of the upstream application servers for which you’re load balancing.

### Session Persistence
Nowadays session state is immensely valuable and vast in interactive applications. Information about a user’s session is often stored locally in the browser. For example, in a shopping cart application the items in a user’s cart might be stored at the browser level until the user is ready to purchase them. Changing which server receives requests from that client in the middle of the shopping session can cause performance issues or outright transaction failure. In such cases, it is essential that all requests from a client are sent to the same server for the duration of the session. This is known as session persistence. NGINX provides an intelligent way to stick these connections to the proper backend server.

[Guide to load balancing with NGINX](https://gitlab.com/gonzalo.spina/nginx-workshop/tree/master/src/load-balancing)

## Security and Firewalling

[Making your app secure with NGINX](https://gitlab.com/gonzalo.spina/nginx-workshop/tree/master/src/security)

## References

### NGINX Statements
- http://nginx.org/en/docs/http/ngx_http_proxy_module.html

### Forward & Reverse Proxies
- https://www.nginx.com/faq/what-is-nginx-how-different-is-it-from-e-g-apache/
- http://www.kegel.com/c10k.html
- https://www.nginx.com/resources/glossary/reverse-proxy-server/
- https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/
- https://www.youtube.com/watch?v=ozhe__GdWC8&t=72s

### Web acceleration
- https://www.nginx.com/resources/glossary/web-acceleration/
- https://www.nginx.com/blog/nginx-caching-guide/
- https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/#nginx-processes-involved-in-caching
- https://www.nginx.com/blog/nginx-high-performance-caching
- https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/#buffers
- https://www.cloudflare.com/learning/ddos/ddos-attack-tools/slowloris/
- https://www.digitalocean.com/community/tutorials/understanding-nginx-http-proxying-load-balancing-buffering-and-caching
- https://www.getpagespeed.com/server-setup/nginx/tuning-proxy_buffer_size-in-nginx
- https://en.wikipedia.org/wiki/Page_(computer_memory)
- https://en.wikipedia.org/wiki/HTTP_compression
- https://docs.nginx.com/nginx/admin-guide/web-server/compression/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation

### Load Balancing
- https://www.nginx.com/resources/glossary/load-balancing/
- https://www.nginx.com/blog/docker-swarm-load-balancing-nginx-plus/
- https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-docker/
- https://www.nginx.com/blog/service-discovery-nginx-plus-etcd/
- https://www.youtube.com/watch?v=t_Tzzucx-oQ
- https://www.youtube.com/watch?v=D6qojxvBuqg
- https://www.nginx.com/products/nginx/live-activity-monitoring/
- https://www.nginx.com/blog/dynamic-reconfiguration-with-nginx-plus/


https://www.nginx.com/blog/performance-tuning-tips-tricks