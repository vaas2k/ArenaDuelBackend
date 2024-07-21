import {config} from 'dotenv'

config();

const Creds = { 
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD : process.env.REDIS_PASSWORD,
    REDIS_HOST :process.env.REDIS_HOST,
    JUDGE_0 : process.env.JUDGE0
}

export default Creds
