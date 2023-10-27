import express from 'express'
import cors from 'cors'

import { createUser, listUsers, login, updateUser } from './routes/users'
import { createPost, listPosts } from './routes/posts'
import { JWTValidation } from './middlewares/jwt'
import { getUser } from './routes/user'

const port = process.env.PORT || 3333

const app = express()

app.use(express.json())
app.use(cors())

app.post("/login", login)

app.get("/posts", listPosts)
app.post("/posts", JWTValidation, createPost)

app.get("/users", listUsers)
app.post("/users", createUser)
app.put("/users", JWTValidation, updateUser)

app.get("/user", JWTValidation, getUser)

app.listen(port, () => console.log(`[server] running on port ${port}`))