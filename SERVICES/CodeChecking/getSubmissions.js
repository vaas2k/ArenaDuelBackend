import axios from "axios";
import Creds from "../../config/config.js";

export default async function pollGetResults (tokens) { 

    let results = [] ;
    let go = 1 , wrong = 0;
    try {
        while (tokens.length > 0) {
            let completed = 0;

            for (let i = 0; i < tokens.length; i++) {

                console.log(go++);
                const response = await axios.get(`${Creds.JUDGE_0}/submissions/${tokens[i]}`);
                if(response.data.status.id === 14) {
                    console.log('Wrong Format')
                }

                if(response.data.status.id === 6) {
                    console.log('Compilation Error');
                }

                if (response.data.status.id !== 1 && response.data.status.id !== 2) {
                    results[i] = response.data;
                    completed++;
                }
            }

            if (completed === tokens.length) {
                console.log('All submissions processed.');
                for(let i = 0 ; i < results.length; i++) {
                    console.log({
                        stdout: results[i].stdout,
                        time : results[i].time,
                        memory : results[i].memory,
                        status : results[i].status
                    })
                }
                console.log(results.length);
                return results ;
            }

            await new Promise((resolve => setTimeout(resolve,1000)));
        }

        
    } catch (error) {
        console.error('Error during polling and fetching results:', error);
        return 401
    }
}