# Roadblocks to deploy this using dedicated VPC for Redis

When I tried to deploy this project to GCP using dedicated VPC network for the Memorystore instance, I found it impossible within a stable way.
I leave here what I had already solved and what still needs to be resolved.

*Caution!: This is just a memo for possible solution in the future. The project won't work with this way at this point.*

## Table of contents

- [Roadblocks to deploy this using dedicated VPC for Redis](#roadblocks-to-deploy-this-using-dedicated-vpc-for-redis)
  - [Table of contents](#table-of-contents)
  - [What I had already solved](#what-i-had-already-solved)
    - [Needs proxy server](#needs-proxy-server)
      - [Create VPC network](#create-vpc-network)
      - [Setup a Redis instance](#setup-a-redis-instance)
      - [Setup proxy VM](#setup-proxy-vm)
    - [Nutcracker needs to be version 5](#nutcracker-needs-to-be-version-5)
    - [Upload nutcracker configuration file](#upload-nutcracker-configuration-file)
    - [Peer VPC networks](#peer-vpc-networks)
      - [Connection test to Memorystore for Redis instance from a VM instance inside `default` VPC network](#connection-test-to-memorystore-for-redis-instance-from-a-vm-instance-inside-default-vpc-network)
  - [What still needs to be resolved](#what-still-needs-to-be-resolved)
    - [Nutcracker(or its alternative) needs to support `INFO` command](#nutcrackeror-its-alternative-needs-to-support-info-command)
    - [Other problems(or solutions) might appear in the future](#other-problemsor-solutions-might-appear-in-the-future)

## What I had already solved

### Needs proxy server

If you use a dedicated VPC network for an instance of Memorystore for Redis, the instance needs to be accessible from api. But to make it, you need a proxy server in the VPC network where the instance is directly accessible as explained in [this article](https://medium.com/google-cloud/memorystore-redis-access-through-vpc-peering-3bb75e1746d4).

#### Create VPC network

Create a VPC network for Redis to join.

- Create VPC with name `vpc-redis` with `Custom` subnet creation mode with creating subnet named `vpc-redis-subnet` with range `10.0.0.0/24` and Private Google Access On. Select all of the firewall rules but `vpc-redis-allow-rdp`.

#### Setup a Redis instance

- Enable `Google Cloud Memorystore for Redis API`.
- Use `redis` as instance name.
- Use `vpc-redis` as network.
- Select `Private service access` as `Connection` option. Along the way, you need to create private service access connection for `vpc-redis`, which you will be able to check the detail in the `PRIVATE SERVICE CONNECTION` tab in `vpc-redis`'s detail page.

#### Setup proxy VM

- Create a VM named `redis-proxy` with `2e-micro` machine type with network interface selecting `vpc-redis`(and delete `default`) network and IP forwarding `Enable`.
- Allow ingress from `0.0.0.0/0`(means any) with any port.
- From browser SSH of `redis-proxy`, try to connect to the Redis server following [this article](https://cloud.google.com/memorystore/docs/redis/connect-redis-instance#connecting-compute-engine).

### Nutcracker needs to be version 5

Currently if you install nutcracker with apt-get install command you would get version 4. We want to set `tcpkeepalive: false` in the configuration(`nutcracker.yaml`), but it's only available from version 5. You can install nutcracker version 5 with the following commands withing the SSH of `redis-proxy` VM instance:

```sh
curl -LO https://github.com/twitter/twemproxy/releases/download/0.5.0/twemproxy-0.5.0.tar.gz
...
tar -xf twemproxy-0.5.0.tar.gz
cd twemproxy-0.5.0
sudo apt update
...
sudo apt install build-essential # Including C compiler `gcc` which will be required in the next step.
...
./configure
...
make
...
sudo make install
...
libtool: install: /usr/bin/install -c nutcracker /usr/local/sbin/nutcracker # Your nutcracker v5 is installed /usr/local/sbin/nutcracker
...
cd ..
```

### Upload nutcracker configuration file

- Create a file `nutcracker.yaml` with the following contents.

```yaml
redis:
  listen: 0.0.0.0:6379
  redis: true
  tcpkeepalive: true
  servers:
  - <your-redis-primary-endpoint-ip>:6379:1
```

- Upload it through SSH browser window.
- Run following command:

```sh
sudo /usr/local/sbin/nutcracker --conf-file nutcracker.yaml
```

### Peer VPC networks

- Peer `default` and `vpc-redis` VPC network interconnectedly.

Now, you should be able to connect from `default` to any instance inside `vpc-redis`.

#### Connection test to Memorystore for Redis instance from a VM instance inside `default` VPC network

- Create a VM instance `redis-connection-test-vm` with `2e-micro` machine type.
- From browser SSH of `redis-connection-test-vm`, you should be able to connect from this VM instance to the Redis server with the following command:

```sh
sudo apt-get install redis-tools
redis-cli -h <your-REDIS-PROXY-vm-instance-ip>
```

See [here](https://cloud.google.com/memorystore/docs/redis/connect-redis-instance) for the official document about connect options. *Note: Methods other than redis-cli like telnet might be blocked when you try any Redis commands after establishing telnet connection.*

If you could see prompt like `10.0.0.1:6379>`(`10.0.0.1` is your `redis-proxy` VM's IP and might be different), you can try some simple Redis commands like following:

```sh
10.0.0.2:6379> SET HELLO WORLD
OK
10.0.0.2:6379> GET HELLO
"WORLD"
10.0.0.2:6379> GET *
(nil)
10.0.0.2:6379> DEL HELLO
(integer) 1
10.0.0.2:6379> GET HELLO
(nil)
```

Now you ALMOST can use the Memorystore for Redis instance from `default` VPC network, to which your api app will belong, by targeting `redis-proxy` VM instance's IP and port `6379` which are configured in `nutcracker.yaml`.

You'd better to delete `redis-connection-test-vm` which will cost you without doing any job.

Now your proxy server should ALMOST works. Please leave the window to check the next problem.

## What still needs to be resolved

### Nutcracker(or its alternative) needs to support `INFO` command

If you deploy api app with appropriate configurations, the status of your api will switch between `OK` and `CrashLoopBackOff` every 5+ minutes with `RedisSocket._RedisSocket_onSocketError` appearing on the log of api app(we would get `SocketClosedUnexpectedlyError` if we don't set `tcpkeepalive: true` option as mentioned above).
If you see the SSH window we left in the previous step, you would see errors in every 5+ minutes like this:

```sh
[2023-01-01 00:00:00.000] nc_redis.c:1324 parsed unsupported command 'info'
```

These imply the nutcracker version still not support `INFO` command and it blocks some connection required between api and Memorystore.

### Other problems(or solutions) might appear in the future

With this trial, I conclude that tech stacks around Redis are still actively developed and I need to wait and see what happens. Besides, even after my problem will be gone, I might have to struggle with another problems.

Along the way, you might need the other way like [GCP's Serverless VPC access](https://cloud.google.com/vpc/docs/serverless-vpc-access).
