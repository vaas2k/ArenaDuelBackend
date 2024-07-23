import { PrismaClient } from "@prisma/client";
import getRatingUpdated from "../SERVICES/ratingUpdate/rateUpdate.js";
import { io } from "../server.mjs";


const prisma = new PrismaClient();

const winController = {
    async onTimeOutWin (req, res, next) { 
        const data = req.body;
        let saveWin ;
        try {

            const rated = data.rated ;
            const upRating = (data.winner.rating + 5) ;
            const downRating = (data.loser.rating - 3) > 50 ? (data.loser.rating - 3) : 50
            if(data.from == data.winner.username) {
                const [winner , loser ] = await prisma.$transaction([
                    prisma.user.update({
                        where : {username : data.winner.username},
                        data : {
                            rating : rated ? upRating : data.winner.rating 
                        }
                    }),
                     prisma.user.update({
                        where : {username : data.loser.username},
                        data : {
                            rating : rated ? downRating : data.loser.rating  
                        }
                    })
                    
                ])
    
                // match update
                saveWin = await prisma.match.update({
                    where : { id : data.id},
                    data : {
                        winner : {
                            username : winner.username,
                            image : winner.image,
                            rating : winner.rating
                        },
                        loser : {
                            username : loser.username,
                            image : loser.image,
                            rating : loser.rating
                        }
                    }
                })

            }
            else {
                // Loser waits for the match result to be updated
                while (true) {
                    saveWin = await prisma.match.findFirst({
                        where: { id: data.id },
                    });
    
                    if (saveWin && saveWin.winner) {
                        break;
                    }
    
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
            
        } catch (error) { 
            console.log(error);
        }
        console.log(saveWin);
        return res.status(200).json(saveWin);
    },
    async onSubmissionWin (req, res, next) { 
        const data = req.body;
        let saveWin ;
        console.log("Data recieved from client");

        
        try {
            const rated = data.rated;
            const upRating = (data.winner.rating + 7) ;
            const downRating = (data.loser.rating - 4) > 50 ? (data.loser.rating - 4) : 50
            
            
            if(data.from == data.winner.username) {
                const [winner , loser ] = await prisma.$transaction([
                    prisma.user.update({
                        where : {username : data.winner.username},
                        data : {
                            rating : rated ? upRating : data.winner.rating 
                        }
                    }),
                     prisma.user.update({
                        where : {username : data.loser.username},
                        data : {
                            rating : rated ? downRating : data.loser.rating
                        }
                    })
                    
                ])
                // match update
                saveWin = await prisma.match.update({
                    where : { id : data.id},
                    data : {
                        winner : {
                            username : winner.username,
                            image : winner.image,
                            rating : winner.rating,
                            solution : data.winner.code
                        },
                        loser : {
                            username : loser.username,
                            image : loser.image,
                            rating : loser.rating
                        }
                    }
                })

            }
            else {
                // Loser waits for the match result to be updated
                while (true) {
                    saveWin = await prisma.match.findFirst({
                        where: { id: data.id },
                    });
    
                    if (saveWin && saveWin.winner) {
                        break;
                    }
    
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
            
        } catch (error) { 
            console.log(error);
        }

        console.log("Data sent to Client")
        return res.status(200).json({...saveWin });
    },
    async onDraw (req, res, next) {
        const data = req.body;

        let saveWin ;
        try {
            saveWin = await prisma.match.update({
                where : {id : data.id},
                data : {
                    winner : {draw : true},
                }
            })
            console.log(saveWin);
        } catch (error) { 
            console.log(error);
        }
        
        return res.status(200).json(saveWin);
    },
    async marathonMatchWin ( req, res, next ) {

        const data = req.body;
        console.log(data);
        try { 

            

            // delete the match table for current user;
            await prisma.marathon.delete({ where : { id : data.id } })
         
         
            // update the leaderboard if entry for the user already exist 
            // only update if the new ranking is greater then the previous one
            // if no entry then create
            let userPlace = await prisma.marathonLeaderboard.findFirst({
                where : { userID : data.userID}
            })

            let updateLeaderBoard ;
            if(userPlace && userPlace.problemsSolved < data.solved) {
                updateLeaderBoard = await prisma.marathonLeaderboard.update({
                    where : { id : userPlace.id , userID : data.userID},
                    data : {
                        problemsSolved : data.solved,
                        rating : data.rating                        
                    }
                }) 
            }
            else if(!userPlace) {
                updateLeaderBoard = await prisma.marathonLeaderboard.create({
                    data : {
                        problemsSolved : data.solved ,
                        username : data.username,
                        image  : data.image,
                        userID : data.userID,
                        rating : data.rating                        
                    }
                }) 
            }
            else {
                updateLeaderBoard = userPlace;
             }

            return res.status(200).json('All Good');

        } catch (error) {
            console.log( error );
            return res.status(500).json('Internal Server Error');
        }
    },
    async matchAbandon(req, res, next) {

        console.log('abandon');
        const data = req.body;
        console.log(data);
        try{

            const rated = data.rated ;
            const upRating = (data.winner.rating + 5) ;
            const downRating = (data.loser.rating - 3) > 50 ? (data.loser.rating - 3) : 50
            const [winner , loser ] = await prisma.$transaction([
                prisma.user.update({
                    where : {id : data.p2},
                    data : {
                        rating : rated ? upRating : data.winner.rating 
                    }
                }),
                 prisma.user.update({
                    where : {id : data.p1},
                    data : {
                        rating : rated ? downRating : data.loser.rating
                    }
                })
                
            ])


            // match update
            const update_match = await prisma.match.update({
                where : { id : data.id},
                data : {
                    winner : {
                        username : winner.username,
                        image : winner.image,
                        rating : winner.rating
                    },
                    loser : {
                        username : loser.username,
                        image : loser.image,
                        rating : loser.rating
                    }
                }
            })

            // inform the winner through socket
            const key = `abandon-${data.p2}`;

            
            setTimeout(()=>{
                io.emit(key,{...update_match,by : data.by});
            },[2500])
            
            return res.status(200).json('All Good');
        }catch(error) { 
            console.log(error);
        }
    } 

}

export default winController;