# Buffering

[NGINX Buffering directives](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffers)

## Server APIs

#### Buffered File
Retrieves a plain text file with buffering enabled

- Base: 			**/v1/buffered**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:80/v1/buffered*

#### Unbuffered File
Retrieves a plain text file whitout buffering

- Base: 			**/v1/unbuffered**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:80/v1/unbuffered*

## Testing

Let's run the application

```bash
  cd src/web-acceleration/buffering-offload/
  docker-compose up --build
```

How is this done?

## Nginx Configuration File

### Setting the servers
Since we are working with HTTP protocol we need to open an http section and set the upstream servers. In our case we only have the backend server.

```nginx
http {
	upstream backend {
	    server buffering-offload:4500;
	}

  ## More magic
}
```

Notice that the DNS of the server is "buffering-offload" and is listening in port 4500. It is the name I've assigned to the backend service in the docker-compose file, and it only exists in the private network, also created in the compose file. It could also be an ip. As we said, the protocol is HTTP.

### Tunning the buffer

Here in our demostration we are not tunning anything, we are just setting the directives to the default values cause this is just to demostratate how things are done.

```nginx
  server {
    ...

    proxy_buffering on;
    proxy_buffer_size 8k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 32k;

    ...
  }
```

`proxy_buffering` Enablesor disables buffering, here we're setting the directive in the server block, but it can be settled in a location block for example. By default it is enabled.

**The first part of the response from a proxied server is stored in a separate buffer**, the size of which is set with the `proxy_buffer_size` directive. This part usually contains a comparatively small response header and can be made smaller than the buffers for the rest of the response. **By default, the buffer size is equal to one memory page.** which is either 4K or 8K, depending on a platform. This is something to take into consideration when tunning buffering, *NGINX is highly optimized to use the least ammount of resources to service each individual connection.*

The other directive to take into consideration is `proxy_buffers`. This directive sets the *number and size* of the buffers used for reading **the other part of the response** from the proxied server, for a single connection. The difference between a bigger number of smaller buffers, or a smaller number of bigger buffers, **may depend on the memory allocator provided by the operating system, as well as how much memory you have.** You could set one buffer of 1MB for example, but you would be allocating 1MB of memory for every connection even if the response could fit in a 4KB buffer, *potentially* wasting a lot of memory that could be used for attend other connections.

The last directive we are going to look into is `proxy_busy_buffers_size`. Limits the total *size* of buffers that can be busy before NGINX starts sending the response to the client even if the response is not yet fully read. By default, size is limited by the size of two buffers set by the proxy_buffer_size and proxy_buffers directives.

### 502 Bad Gateway: "upstream sent too big header while reading response header from upstream"

This error is a sign that our `proxy_buffer_size` should be increased. This is because NGINX doesn't have enough memory storage to allocate the first part of the response sent by the backend service. The proper value should be at least, equal to the maximum size of the headers of that particular response.

So, how can we know the size of the outgoing request headers? Simple:
```bash
	curl -s -w \%{size_header} -o /dev/null https://google.com
```
This will return the size in bytes of incoming headers. In this case we received *339 bytes*. This case fits well in our default configuration (8KB). But, if we had received an 11KB response headers (far too much), we should increase the buffer size. The value that we'll choose must be aligned with the memory page size which we will say it is 4k. So even that we received an 11K response, the proper number would be 12K.

### Disable proxy buffering

If buffering is disabled, the response is sent to the client synchronously while it is receiving it from the proxied server. This behavior may be desirable for fast interactive clients that need to start receiving the response as soon as possible. There are only a few cases, where you would want to disable proxy buffering that we are not going to cover in this workshop.

If you are interested in disabling the buffer, then you can read more about
[Time to first byte](https://en.wikipedia.org/wiki/Time_to_first_byte)
[SSL Termination](https://avinetworks.com/glossary/ssl-termination/)
[Slowloris DOS](https://en.wikipedia.org/wiki/Slowloris_(computer_security))
