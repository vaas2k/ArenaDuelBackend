import axios from "axios";
import Creds from "../../config/config.js";

// Function to send data to Judge0 API
export default async function sendToJudge0(data,sourceCode,language_id) {

    // Function to encode in base64
    function base64Encode(str) {
        return Buffer.from(str, 'utf-8').toString('base64');
    }

    const encodedSourceCode = base64Encode(sourceCode);
    const encodedTestCases = Object.keys(data).map(key => {
        const input = base64Encode(data[key].input);
        const output = base64Encode(data[key].output);
        return { stdin: input, expected_output: output };
    });

    let tokens = [];
    const apiUrl = `${Creds.JUDGE_0}/submissions/batch?base64_encoded=true`;
    const submissions = Object.keys(data).map((key, index) => ({
        language_id: language_id,
        source_code: encodedSourceCode,
        stdin: encodedTestCases[index].stdin,
        expected_output: encodedTestCases[index].expected_output,
        base64_encoded: true
    }));

    try {
        const response = await axios.post(apiUrl, { submissions });
        tokens = response.data.map(submission => submission.token);
        console.log('Batch submission response:', tokens);
    } catch (error) {
        console.error('Error sending data to Judge0:', error);
    }

    return tokens;
}