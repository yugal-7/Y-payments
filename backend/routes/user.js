const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const zod = require('zod');
const { User, Account } = require('../db');
const { JWT_SECRET } = require('../config');
const  { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateSchema = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post('/signin', async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const existingUser = User.findOne({
        username: body.username,
        password: body.password
    })
    if(existingUser){
        const token = jwt.sign({
            userId: existingUser._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})

router.post('/signup', async (req, res) => {
    const body = req.body;
    const { success } = signupSchema.safeParse(body);
    if(!success){
        console.log('first');
        return res.json({
            message: "Email already taken / Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username: body.username
    })
    if(existingUser){
        return res.json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})

router.put('/', authMiddleware ,async (req, res) => {
    const { success } = updateSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

	await User.updateOne({ _id: req.userId }, req.body);
	
    console.log(userId);

    res.json({
        message: "Updated successfully"
    })
})

router.get('/bulk', authMiddleware, async (req, res) => {
    const filter = req.query.filter || '';
    const users = await User.find({
        $or: [
            {
                firstName: {
                    "$regex": filter
                }
            },
            {
                secondName: {
                    "$regex": filter
                }
            }
        ]
    })
    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;