import { redis, event, io } from "../server.mjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const matchController = {
    async push_player_to_queue(req, res, next) {
        // will put the player in redis queue

        let playerInfo = req.body; // ID , Type , Rating;
        console.log(playerInfo);
        const timeStamp = Date.now();
        try {
            let enqueue_player;
            let flag;
            if (playerInfo.rating >= 50 && playerInfo.rating < 300) {
                enqueue_player = await redis.zadd(
                    "Q1",
                    timeStamp,
                    JSON.stringify(playerInfo)
                );
                flag = 1;
            } else if (playerInfo.rating >= 300 && playerInfo.rating < 600) {
                enqueue_player = await redis.zadd(
                    "Q2",
                    timeStamp,
                    JSON.stringify(playerInfo)
                );
                flag = 2;
            } else if (playerInfo.rating == 0) {
                enqueue_player = await redis.zadd(
                    "Q0",
                    timeStamp,
                    JSON.stringify(playerInfo)
                );
                flag = 0;
            }

            if (!enqueue_player) {
                console.log(enqueue_player);
                return res.status(500).json({ error: "Error, Try Again Later" });
            }

            playerInfo = { ...playerInfo, flag: flag };
            event.emit("player_joined", playerInfo);
            return res.status(200).json({ id: playerInfo.id });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error });
        }
    },
    async rem_player_from_queue(req, res, next) {

        // will remove the player from redis queue (cancel looking for match)
        const { id, type, rating } = req.body;
        const numericRating = Number(rating); // Ensure rating is a number
        let QueueKey;

        try {
            console.log(1);
            if (numericRating >= 50 && numericRating < 300) {
                
                QueueKey = `Q${1}`;
            
            } else if (numericRating >= 300 && numericRating < 600) {
            
                QueueKey = `Q${2}`;
            
            } else if (numericRating === 0) {
            
                QueueKey = `Q${0}`;
            
            } else {
            
                return res.status(400).json({ msg: "Invalid rating value" });
            
            }

            const queue = await redis.zrange(QueueKey, 0, -1);
            const playerIndex = queue.findIndex((player) => {
                if (player) {
                    const parsedPlayer = JSON.parse(player);
                    return parsedPlayer.id === id;
                }
                return false;
            });
            if (playerIndex === -1) {
                return res.status(404).json({ msg: "Player not found in queue" });
            }

            const removePlayer = queue[playerIndex];
            await redis.zrem(QueueKey, removePlayer);
        } catch (error) {
            console.log("Error:", error);
            return res.status(500).json({ error: error });
        }
        event.emit("player_left", { id, QueueKey });
        return res.status(200).json({ id: id });
    },
    async marathonMatch ( req, res, next ) { 
        try {

            const data = req.body;

            console.log(data);
            let id ;
            while(true) {
                id = Math.floor(Math.random() * 73) + 1;
                if(id != 53 && id != 54 ) break;
            }
            const createMatch = await prisma.marathon.create (
                {
                    data : {
                        userID : data.id,
                        problems : [id]
                    }                    
                }
            )

            const socketKey = `Marathon-${data.id}`;

            
            setTimeout(()=> {io.emit(socketKey,createMatch);},[2500])
            
            return res.status(200).json(createMatch);
        } catch ( error ) {
            console.log( error );
        }
    },
    async getLeaderboardMarathon(req, res, next) {
        try {
            // Get the leaderboard in ascending order based on problemsSolved
            const leaderboard = await prisma.marathonLeaderboard.findMany({
                orderBy: {
                    problemsSolved: 'desc',
                },
                take : 5,
                select: {
                    id: true,
                    problemsSolved: true,
                    username: true,
                    image: true,
                    userID: true,
                    rating : true,
                },
            });
    
            console.log(leaderboard);
            // Send the leaderboard as the response
            return res.status(200).json(leaderboard);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
        }
    }
    

};

export default matchController;