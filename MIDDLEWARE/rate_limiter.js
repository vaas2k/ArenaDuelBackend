import { redis } from "../server.mjs";

export async function rate_limiter(req, res, next) {
  try {

    console.log("Rate Limiter Check");
    const userip = req.ip;
    const key = `USER_IP:${userip}`;
    // Increment the counter for the IP
    const requests = await redis.incr(key);

    if (requests === 1) {
      // Set the TTL to 10 seconds on the first request
      await redis.expire(key, 20);
    }

    if (requests > 10) {
      const ttl = await redis.ttl(key);
      return res.status(403).json({ msg: `${ttl} seconds before you can retry` });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
}

export async function strict_rate_limiter(req, res, next) {
  try {

    console.log("Rate Limiter Check");
    const userip = req.ip;
    const key = `USER_IP:${userip}`;
    // Increment the counter for the IP
    const requests = await redis.incr(key);

    if (requests === 1) {
      // Set the TTL to 10 seconds on the first request
      await redis.expire(key, 5);
    }

    if (requests > 1) {
      const ttl = await redis.ttl(key);
      return res.status(403).json({ msg: `${ttl} seconds before you can retry` });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
}
