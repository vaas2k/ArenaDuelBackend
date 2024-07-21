import express from 'express';
import  matchController from '../controller/match_controller.js';
import CodeChecker from '../controller/codeCheck_controller.js';
import winController from '../controller/winController.js';
import { rate_limiter, strict_rate_limiter } from '../MIDDLEWARE/rate_limiter.js';
const router = express.Router();



router.get('/',(req , res, next )=>{
    console.log("Success");
    next('error we got lol');
    return res.json({msg : "success"});
    
})

router.post('/enqueue_player',matchController.push_player_to_queue);
router.post('/player_left',matchController.rem_player_from_queue);
router.post('/marathonmatch',matchController.marathonMatch);
router.get('/getleaderboard',strict_rate_limiter,matchController.getLeaderboardMarathon);


router.post('/marathonmatchover',winController.marathonMatchWin)
router.post('/ontimeoutwin',winController.onTimeOutWin)
router.post('/onSubmissionwin',winController.onSubmissionWin);
router.post('/onDraw',winController.onDraw);
router.post('/abandon',winController.matchAbandon);


router.post('/runSampleTestCases',rate_limiter,CodeChecker.runSampleTestCases);
router.post('/runAllTestCases',rate_limiter,CodeChecker.runAllTestCases);



router.all('/judge0',(req, res , next) => {

    console.log(req.body);

    return res.status(200).json("Good");

})


export default router;