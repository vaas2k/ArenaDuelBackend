import { io } from "../../server.mjs";
import { redis } from "../../server.mjs";

export const match_started = async (data) => {

    try{

        const room_id = data.room_id;
        await redis.expire(`${room_id}`,1200);
        await redis.lpush(`${room_id}`,JSON.stringify(data))
        const ttl = await redis.ttl(`${room_id}`);
        if(ttl == 0) {
            await redis.lrem(`${room_id}`);
        }        
        

    }catch(error)  {

        console.log(error);

    }

}