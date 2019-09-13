# Buffering


[NGINX directives](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)

## Server APIs

#### Buffered File
Retrieves a plain text compressed file

- Base: 			**/v1/buffered**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:8080/v1/buffered*

#### Unbuffered File
Retrieves a plain text uncompressed file

- Base: 			**/v1/unbuffered**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:8080/v1/unbuffered*

## Testing

Let's run the application

```bash
  cd src/web-acceleration/caching-content/
  docker-compose up --build
```

How is this done?

## Nginx Configuration File

### Setting the servers
Since we are working with HTTP protocol we need to open an http section and set the upstream servers. In our case we only have the backend server.

```nginx
http {
	upstream backend {
	    server caching-content:4500;
	}

  ## More magic
}
```

Notice that the DNS of the server is "caching-content" and is listening in port 4500. It is the name I've assigned to the backend service in the docker-compose file, and it only exists in the private network, also created in the compose file. It could also be an ip. As we said, the protocol is HTTP.

### Setting caches


## There's more...


