import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/get', async (req, res) => {
    const users = await prisma.user.findMany();
    res.send({
        code: 200,
        data: users,
    });
});

export default router;
