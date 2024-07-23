import sendToJudge0 from "../SERVICES/CodeChecking/batch_submission.js";
import getInputandOutputfromFolder from "../SERVICES/CodeChecking/getInputandoutput.js";
import pollGetResults from "../SERVICES/CodeChecking/getSubmissions.js";



const CodeChecker = {

    async runSampleTestCases(req, res, next) {
        try {
            console.log(req.body);
            const data = {
                userid: req.body.userid,
                type: req.body.type,
                passed: 5,
                failedCase: {},
                errorMessage: '',
                total: 10
            }
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
        }
    },
    async runAllTestCases(req, res, next) {

        const { language, code, problem_id, userid } = req.body;
        console.log(req.body);
        let langauge_id = 0;
        switch (language) {
            case 'cpp':
                langauge_id = 54;
                break;
            case 'java':
                langauge_id = 62
                break;
            case 'python':
                langauge_id = 71
                break;
            case 'javascript':
                langauge_id = 63
                break;
            default:
                return res.status(200).json('Language not Supported !')
        }

        try {

            // based on problem id get the inputs and outputs
            const path_to_cases = `./tests/${problem_id}`;
            const inputs_outputs = await getInputandOutputfromFolder(path_to_cases);

            console.log(inputs_outputs.length);
            // send batch submission to judge0
            const tokens = await sendToJudge0(inputs_outputs, code, langauge_id);

            // get Batch Submissions
            const output = await pollGetResults(tokens, next);

            if (output == 401) {
                return res.status(201).json({ error: 'CE' });
            }

            // Finding the number of wrong answers and calculating averages
            let wrong = 0, avg_time = 0, avg_memory = 0 , RTE = false, TLE = false  ; 

            for (let i = 0; i < output.length; i++) {
                avg_memory += output[i].memory;
                avg_time += Number(output[i].time); // Ensure time is converted to a number

                if (output[i].status.id === 4) {
                    wrong++;
                }
                if (Number(output[i].time) >= 1) { // Ensure comparison is done with a number
                    TLE = true;
                }
                if (output[i].status.id == 6) {
                    return res.status(201).json({ error: 'CE' });
                }
                if (output[i].status.id >= 7 && output[i].status.id <= 12) {
                    RTE = true;
                }
            }

            // Correcting the average calculation
            const totalItems = output.length;
            const avg_time_calc = avg_time / totalItems;
            const avg_memory_calc = avg_memory / totalItems;

            const data = {
                userid: req.body.userid,
                type: req.body.type,
                passed: (inputs_outputs.length - 1) - wrong,
                total: (inputs_outputs.length - 1),
                time: avg_time_calc,
                memory: avg_memory_calc,
                message : {
                    RTE : RTE ? 'RTE' : null,
                    TLE : TLE ? 'TLE' : null
                }
            };

            console.log(data);
            return res.status(200).json(data);

        } catch (error) {
            console.log(error);
        }
    }
}

export default CodeChecker;