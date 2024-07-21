import { event, redis, io } from "../../server.mjs";
import { createMatch } from "./createMatch.js";

export const matchEvents = () => {
  event.on("player_joined", async (matchInfo) => {
    console.log(`Player Joined - ${matchInfo.id}`);

    const QueueKey = `Q${matchInfo.flag}`;

    const lenOFqueue = await redis.zcard(QueueKey);
    if (lenOFqueue >= 2) {

      
        const queue = await redis.zrange(QueueKey, 0, 1);
      
        const P1 = queue[0];
      
        const P2 = queue[1];
      
        await redis.zremrangebyrank(QueueKey, 0, 1);
      
        const matchCreated = await createMatch(P1, P2);
      
        // send match created to both players on their sockets(id)
        io.emit(JSON.stringify(matchCreated.p1), matchCreated);
      
        io.emit(JSON.stringify(matchCreated.p2), matchCreated);
    }
  });

  event.on("player_left", async (data) => {
    
    console.log(`Player left - ${data.id}`);
    
    const lenOFqueue = await redis.zcard(data.QueueKey);
    
    console.log(lenOFqueue);
  });
};
