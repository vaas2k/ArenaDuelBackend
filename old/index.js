import fs from 'fs';
import path, { resolve } from 'path';
import axios from 'axios';
import { setInterval } from 'timers/promises';
import { clear } from 'console';

// Path to the extracted folder
const extractedFolderPath = './tests/1';

const judge0 = 'http://localhost:2358/'

// Object to store the inputs and outputs
let data = {}, tokens , results = [] ;

// C++ source code
const sourceCode = `
#include <bits/stdc++.h>
using namespace std;

#define ll long long

int main() {
    ll n;
    cin >> n ;
    
    cout << n << " ";
    while(n > 1){
        if(n % 2 == 0){
            n /= 2;
        }else{
            n = n * 3 + 1 ;
        }
        cout << n << " ";
    }
    return 0;
}
`;

// Function to read content from the extracted folder
function readFilesFromFolder() {
    fs.readdirSync(extractedFolderPath).forEach(file => {
        const filePath = path.join(extractedFolderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const content = fs.readFileSync(filePath, 'utf-8');

            if (ext === '.in') {
                if (!data[baseName]) data[baseName] = {};
                data[baseName].input = content;
            } else if (ext === '.out') {
                if (!data[baseName]) data[baseName] = {};
                data[baseName].output = content;
            }
        }
});

    // Log the data object to verify its content
    console.log(data);
}

// Function to send data to Judge0 API
async function sendToJudge0(data) {
    const apiUrl = `${judge0}submissions/batch`;
    const submissions = Object.keys(data).map(key => ({
        language_id: 54, // 54 for C++ (GCC 9.2.0)
        source_code: sourceCode,
        stdin: data[key].input,
        expected_output: data[key].output,
        callback_url: 'http://localhost:8080/judge0/'
    }));

    try {
        const response = await axios.post(apiUrl, { submissions });
        tokens = response.data.map(submission => submission.token);
        console.log('Batch submission response:', tokens);


        


    } catch (error) {
        console.error('Error sending data to Judge0:', error);
    }
}

// Function to fetch results using tokens
async function fetchResults(tokens) {
    const apiUrl = `${judge0}/submissions`;

    for (const token of tokens) {
        try {
            const response = await axios.get(`${apiUrl}/${token}`); 
        } catch (error) {
            console.error(`Error fetching result for token ${token}:`, error);
        }
    }

}
async function pollGetSubmissions () { 

    try {

        let i = 1;
        while(true) {
            if(tokens) {
                console.log(`Go ${i++}`);
                const response = await axios.get(`${judge0}/submissions/${tokens[0]}`);
                if(response.data.stdout !== null) {
                    console.log(response.data);
                    break;
                }
            }

            await new Promise(resolve => setTimeout(resolve,1000));
        }
        console.log(results);
    } catch ( error ) { 
        console.log(error);
    }      
}



async function getResults ( ) { 
    try { 


        let i = 0 ;
        while(tokens && results.length !== tokens.length) { 
            
            while(true) { 
                    const response = await axios.get(`${judge0}/submissions/${tokens[i]}`);
                    if(response.data.status.id !== 1 && response.data.status.id !== 2 ) { 
                        results.push(response.data);
                        break;
                    } 
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            i++;
        }

        console.log
    } catch (error)  { 
        console.log(error);
    }
}

// Execute the functions
readFilesFromFolder();
await sendToJudge0(data);

await getResults();






