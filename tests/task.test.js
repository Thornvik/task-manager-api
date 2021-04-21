const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
  userOne,
  userTwo,
  taskOne,
  setupDatabase,
  taskTwo,
} = require('./fixtures/bd')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'this is the description',
    })
    .expect(201)

  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toBe(false)
})

test('should not create task with invalid description', async () => {
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: '',
    })
    .expect(400)
})

test('should not create task with invalid completed value', async () => {
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: '',
    })
    .expect(400)
})

test('Should get a users tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toEqual(2)
})

test('Should not get another users tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toEqual(1)
})

test('Should get a task by its ID', async () => {
  await request(app)
    .get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get a task by its ID if unauthenticated', async () => {
  await request(app).get(`/tasks/${taskTwo._id}`).send().expect(401)
})

test('Should not get a another users task by its ID', async () => {
  await request(app)
    .get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
})

test('Should only get completed tasks', async () => {
  const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toBe(1)
})

test('Should only get incompleted tasks', async () => {
  const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toBe(1)
})

test('Should sort tasks by completed', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[0].completed).toBe(true)
  expect(response.body[1].completed).toBe(false)
})

test('Should not be able to delete other users taskss', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})

test('should delete a users tasks', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(taskOne._id)
  expect(task).toBeNull()
})

test('should not delete a unauthenticated users tasks', async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).send().expect(401)
})

test('should update a users tasks', async () => {
  const response = await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: true,
    })
    .expect(200)

  const task = await Task.findById(taskOne._id)
  expect(task.completed).toBe(response.body.completed)
})

test('should not update another users tasks', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      completed: true,
    })
    .expect(404)
})
