import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient() ;


export default async function getRatingUpdated(winner, loser,by) {
    try {
        // Fetch users by usernames
        const [user1, user2] = await prisma.$transaction([
            prisma.user.findUnique({ where: { username : winner } }),
            prisma.user.findUnique({ where: { username: loser } })
        ]);

        if (!user1 || !user2) {
            throw new Error('One or both users not found');
        }

        // Calculate new ratings (this is just an example, replace with your logic)
        let winRating , loseRating ;
        if(by == 'solving') {
            winRating = user1.rating + 7;
            loseRating = user2.rating - 4;
        }
        else if(by == 'timeout') {
            winRating = user1.rating + 5;
            loseRating = user2.rating - 3;
        }

        // Update users' ratings in a transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user1.id },
                data: { rating: winRating },
            }),
            prisma.user.update({
                where: { id: user2.id },
                data: { rating: loseRating },
            }),
        ]);

        console.log('Rantings updated successfully');
        return {winRating , loseRating}; 
    } catch (error) {
        console.error('Error updating ratings:', error);
    } finally {
        await prisma.$disconnect();
    }
}