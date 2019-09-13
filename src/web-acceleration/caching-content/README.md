# Caching

Imagine we had a service for serving static content which pulls the files from an S3 bucket for example and sends it to the client. Or a service in which the content that is served dependes on the geographic localization of the user, and you must cache that content to reduce the load of the servers and improve the user experience. All of this can be done with the NGINX's cache directives. In this section we are going to set up a server and expose three APIs, one to serve static files, one to serve localization info to the user based on his location and the other one will just return a not cached response.

The application is a cluster composed by an nginx reverse proxy and an API server made in node. Both are containarized as separated services with docker to simulate a production environment, where the application is hidden behind the reverse proxy to which exposes its APIs through a private network.

We'll test all the API's and see how are they accelerated when the content is cached. So, lets start.

[NGINX directives](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)

## Server APIs

#### Ping
Returns an object containing "pong" string.

- Base: 			**/v1/ping**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:8080/v1/ping*

#### Location
Returns your current location based on your IP address

- Base: 			**/v1/location**
- Method: 			`GET`
- Query Params:		No params
- Example: 			*http://localhost:8080/v1/location*


#### File
Used to retrieve plain text files

- Base: 			**/v1/file**
- Method: 			`GET`
- Example: 			*http://localhost:8080/v1/file?name=file1.text*

| name        | type           | description  | optional |
| ------------- |:-------------:|:-------------:|:-------------:|
| file | `String` | The filename | `True` |

## Testing

Let's run the application

```bash
  cd src/web-acceleration/caching-content/
  docker-compose up --build
```

The first API is *'Ping'*. This is a simple API that has no cache, and it could be used to check the health of out application. As you will see in the *nginx.conf* file, the correspondant location to this resource has *proxy_cache off*.

As you can see our server received the request as well as our reverse proxy

![request](../../static/caching-content/ping3.png)

And the result we've got is a JSON body with the pong response.

![headers](../../static/caching-content/ping2.png)

Now let's try an endpoint with a cache set up. The *file* API retrieves plain text files.

![request](../../static/caching-content/cache-empty-file2.png)

![headers](../../static/caching-content/cache-empty-file1.png)

As we can see in the first image, the request reached our server and in the response headers (the second image) we've got a custom header *X-Cache-Status → MISS* set by NGINX telling us that it couldn't find that file in its cache. Let's try again and see what happens

![headers](../../static/caching-content/cache-empty-file3.png)

Now, the value for the status header says *HIT*

![request](../../static/caching-content/cache-empty-file4.png)

And effectively that request didn't reach the server, instead the file was pulled from the cache by NGINX. The first to lines represents the first request, the one we used to populate the cache, and the third line represents our last request, so where we can see the server did not got hit.

The third endpoint, *location* behaves as the second one, so there's no need to test it. The difference between the latter and the *file* one, is that the cache process is done having in mind the client's IP to store the response in the cache. Give it a try by yourself and see.

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

The next two lines refers to two different cache zones that we are going to use for different purposes.

```nginx
  proxy_cache_path /var/cache/static levels=1:2 keys_zone=static:60m max_size=5g inactive=30m use_temp_path=off;
  proxy_cache_path /var/cache/dynamic levels=1:2 keys_zone=dynamic:8m max_size=50m inactive=10m use_temp_path=off;
```

Here we are telling nginx to create two caches, one named static which we are going to use for serving static content and one named dynamic that we will be using for retrieving IP sensitive content.

| Parameter        | Value           | Description |
| ------------- |:-------------:|:-------------:|
| path | `String` | This is the path where NGINX is going to save the files for the cache |
| levels | `String` | defines hierarchy levels of a cache: from 1 to 3, each level accepts values 1 or 2 |
| keys_zone | `String` | The name of the cache followed by a colon and the size in memory |
| max_size | `String` | Defines the maximun space in disk for that cache |
| inactive | `String` | Cached data that are not accessed during the time specified by the inactive parameter get removed from the cache regardless of their freshness  |
| use_temp_path | `Boolean` | NGINX first writes files that are destined for the cache to a temporary storage area, and the use_temp_path=off directive instructs NGINX to write them to the same directories where they will be cached. It is recommended that you set this parameter to off to avoid unnecessary copying of data between file systems. *(Default value "on")* |

The following line defines a key for caching to identify an element inside the cache.

```nginx
  proxy_cache_key $scheme$request_method$host$request_uri;
```

The default proxy_cache_key, which will fit most use cases, is "$scheme$proxy_host$request_uri". The variables used include the scheme, HTTP or HTTPS, the proxy_host, where the request is being sent, and the request URI. All together, this reflects the URL that NGINX is proxying the request to. You may find that there are many other factors that define a unique request per application, such as request arguments, headers, session identifiers, and so on, to which you’ll want to create your own hash key. Selecting a good hash key is very important and should be thought through with understanding of the application. Selecting a cache key for static content is typically pretty straightforward; using the hostname and URI will suffice. Selecting a cache key for fairly dynamic content like pages for a dashboard application requires more knowledge around how users interact with the application and the degree of variance between user experiences. **Due to security concerns you may not want to present cached data from one user to another without fully understanding the context. The proxy_cache_key directive configures the string to be hashed for the cache key. The proxy_cache_key can be set in the context of HTTP, server, and location blocks, providing flexible control on how requests are cached.**

Notice that is set at protocol level, this means that this key will be used always unless we override it in a more deeper level as we'll see further in this article.

In the next section we start defining the configs at a server level. This means al directives that we put inside this section will apply **for all of the locations that we set up**.

```nginx
  server {
    listen 8080;

    ## Redirections must be explicit on location
    proxy_redirect        off;

    ## Headers for the backend
    proxy_set_header      Host $host;
    proxy_set_header      X-Real-IP $remote_addr;
    proxy_set_header      X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header      X-Forwarded-Host $server_name;

    ## General cache settings
    proxy_cache_methods   GET HEAD;
    proxy_cache_valid     200 30m;

    ## Headers for the client
    expires               30m;
    add_header            Cache-Control "public";
    add_header            X-Cache-Status $upstream_cache_status;
  }
```

With the `listen` directive we are telling NGINX to listen to the port 8080, with the `proxy_redirect` to off we are forbidding redirections.

`proxy_set_header` is used to add headers to the request, and send them to the backend server. In our case we are forcing the Host header, and we are sending some client info like its IP.

`proxy_cache_methods` and `proxy_cache_valid` are telling NGINX that the only method that it should cache are *GET* and *HEAD* and the only status code should be *200* and that *cache will be valid for 30m*.

The `add_header` directive is used to add headers to the response that will be sent to the client and the `expires` directive will add the *max-age=1800* clause to the *Cache-Control* header.

#### The Ping location

```nginx
    location /v1/ping {
      ## Server url (The one set in the upstream section)
      proxy_pass          http://backend;
      ## Turn off the cache for ping service
      proxy_cache         off;
    }
```

We said that this endpoint wasn't cached. That is because the `proxy_cache` directive is set to *off*. This is how you turn off the cache for specific locations.

#### The File location

```nginx
    location /v1/file {
        ## Server url (The one set in the upstream section)
        proxy_pass            http://backend;
        ## Set the cache key for static locations
        proxy_cache           static;
        ## Force request that are competing for the same element to wait until the cache has been populated
        ## This way the backend only receives one request for the same element
        proxy_cache_lock      on;
        ## If the cache hadn't been populated after one second nginx let the requests continue their way to the backend
        proxy_cache_lock_timeout 1s;
    }
```

The `proxy_cache` directive points to the *static* cache zone we've defined before and it comes accompanied by two more powerful directives:
`proxy_cache_lock` blocks the path to the server for requests that are asking for the same resource, so only the first request pass through and populate the cache, and the others just wait 'til NGINX is ready to serve the content from the cache. By doing this we avoid overwhelming the server.
`proxy_cache_lock_timeout` is used to turn off the `proxy_cache_lock` directive, after a settled time, in case our server is taking too much to retrieve the specified resource.

#### The Location location

```nginx
    location /v1/location {
        ## Server url (The one set in the upstream section)
        proxy_pass            http://backend;
        ## Set the dynamic cache for location settings for location
        proxy_cache_key       $scheme$request_method$host$request_uri$remote_addr;
        proxy_cache           dynamic;
        proxy_cache_valid     200 404 302 2d;
        expires               2d;
    }
  }
```

In this one, we are pointing the `proxy_cache` directive to the *dynamic* zone we've defined, at the same time we are overriding the `proxy_cache_key` and extending the validity of our cache to more status codes with `proxy_cache_valid`. Notice the variable *$remote_addr* in the cache key.


## There's more...

Up to now, we've only covered the basic and used features for caching. NGINX provides  features for **bypassing**, **purging**, **slicing**, **byte-range** and more out of the box, as well as it provides tools for working with **geo localization** using its integration with the maxxmind database, **ip tracking** to the origin, **ip ranges** that can be combined all together to create a powerful service and solve lots of scenarios. We won't cover all of this features in this workshop.

[Byte Ranges Caching](https://www.nginx.com/blog/smart-efficient-byte-range-caching-nginx/)
