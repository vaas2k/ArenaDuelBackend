import { PrismaClient } from "@prisma/client";
import { redis } from "../../server.mjs";
import { v4 as uuidv4 } from 'uuid';
import getTotalTestCases from "../../utils/getLenforTestCases.js";

const prisma = new PrismaClient();

export const  createMatch = async (P1, P2) => { 
    try {
        const room_id = uuidv4(); // Generate a unique room ID

        // Parse P1 and P2 if they are JSON strings
        const parsedP1 = P1 ? JSON.parse(P1) : null;
        const parsedP2 = P2 ? JSON.parse(P2) : null;

        if (!parsedP1 || !parsedP2 || !parsedP1.id || !parsedP2.id) {
            throw new Error('Invalid player data');
        }
        // each problem can't be send to the same user twice in a day (only once)
        const p1Key = `user:${parsedP1.id}:lastProblem`;
        const p2Key = `user:${parsedP2.id}:lastProblem`;
        console.log(1);

        const p1_problem_check = await  redis.get(p1Key);
        const p2_problem_check = await  redis.get(p2Key);
        let getRandomID , i = 1;
        while(true) {
            console.log(i);
            if(i == 73) { 
                break;
            }
            getRandomID = Math.floor(Math.random() * 72) + 1;
            if(getRandomID == 53 || getRandomID == 54) continue; 
            if(getRandomID != p1_problem_check &&  getRandomID != p2_problem_check ){
                break;
            
            }
            i++;

        }
        


        await redis.setex(p1Key,120,getRandomID);
        await redis.setex(p2Key,120,getRandomID);

        // once we get problem id we look for total number of testCases (hard coded rn)
        const totalCases = getTotalTestCases(getRandomID);

        const match = await prisma.match.create({
            data: {
                room_id: room_id,
                problem_id: getRandomID, 
                p1: parsedP1.id,
                p2: parsedP2.id,
                rated : parsedP1.rating && parsedP2.rating !== 0 ? true : false,
                totalCases : totalCases
            }
        });

        return match;

    } catch (error) {
        console.log('Error:', error);
        throw error; // Re-throw the error to ensure it's not silently ignored
    }
};
