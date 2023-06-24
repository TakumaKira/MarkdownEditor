#!/bin/bash

# Retrieve password from environment variable
redisRootPassword="$REDIS_ROOT_PASSWORD"
redisUser="$REDIS_USER"
redisPassword="$REDIS_PASSWORD"

# Construct ACL SETUSER commands
aclSetDefaultUserPasswordCommand="ACL SETUSER default on >\"$redisRootPassword\""
aclSetUserCommand="ACL SETUSER $redisUser on >\"$redisPassword\" +@all -@dangerous ~*"

# Start Redis server
redis-server &

# Wait for Redis server to be ready
until redis-cli PING &>/dev/null; do
  sleep 1
done

# Set default user password
redis-cli <<< "$aclSetDefaultUserPasswordCommand"

# Set user password
redis-cli -a "$redisRootPassword" <<< "$aclSetUserCommand"

# Keep the script running to keep the container alive
tail -f /dev/null
