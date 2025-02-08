const express = require('express');
const router = express.Router();
const db = require('./../db/firebase');
const admin = require('firebase-admin');
const authenticate = require('./../middleware/auth');

const Task = require('../models/Task');

router.get('/', authenticate, async (req, res) => {
    console.log('------- tasks: [START] ');
    try {
        const tasksCollection = await db.collection('tasks').orderBy('creation', 'asc').get();

        const tasks = tasksCollection.docs.map(doc => {
            const taskData = doc.data();
            const task = new Task(taskData.title, taskData.description, taskData.creation.toDate(), taskData.complete);
            task.id = doc.id;
            return task;
        });
        console.log('------- tasks: [END] ');
        res.json(tasks);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ message: 'Error al obtener tareas' });
    }
});

router.put('/change-states', authenticate, async (req, res) => {
    console.log('------- tasks/change-states: [START] ');
    const taskIds = req.body;
    try {
        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: 'Se requiere un array de IDs de tareas' });
        }

        const updatePromises = taskIds.map(async (taskId) => {

            const taskRef = db.collection('tasks').doc(taskId);
            const taskDoc = await taskRef.get();

            if (!taskDoc.exists) {
                return res.status(404).json({ message: `No se encontró la tarea con ID: ${taskId}` });
            }

            const currentComplete = taskDoc.data().complete;
            return taskRef.update({ complete: !currentComplete });
        });

        await Promise.all(updatePromises);

        console.log('------- tasks/change-states: [END] ');
        res.json({ message: 'Tareas actualizadas correctamente' });

    } catch (error) {
        console.error('Error al actualizar tareas:', error);
        res.status(500).json({ message: 'Error al actualizar tareas' });
    }
});

router.delete('/:taskId', authenticate, async (req, res) => {
    console.log('------- tasks/:taskId: [START] ');
    const taskId = req.params.taskId;
    try {
        if (!taskId) {
            return res.status(400).json({ message: 'Se requiere un ID de tarea válido' });
        }

        await db.collection('tasks').doc(taskId).delete();
        console.log('------- tasks/:taskId: [END] ');
        res.status(204).end();

    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ message: 'Error al eliminar tarea' });
    }
});

router.post('/', authenticate, async (req, res) => {
    console.log('------- tasks: [START] ');
    const { title, description } = req.body;
    try {
        if (!title || !description) {
            return res.status(400).json({ message: 'Título y descripción son obligatorios' });
        }

        const creation = new Date();
        const newTask = { title, description, complete: false, creation };
        const docRef = await db.collection('tasks').add(newTask);

        const createdTask = { id: docRef.id, ...newTask };
        console.log('------- tasks: [END] ');
        res.status(201).json(createdTask); // 201 Created

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ message: 'Error al crear tarea' });
    }
});

router.put('/:idTask', async (req, res) => {

    console.log('------- tasks/:id : [START] ');
    const idTask = req.params.idTask;
    const { title, description } = req.body;
    try {

        if (!title || !description) {
            return res.status(400).json({ message: 'Título y descripción son obligatorios' });
        }

        const taskRef = db.collection('tasks').doc(idTask);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ message: `No se encontró la tarea con ID: ${idTask}` });
        }

        const { complete, creation } = taskDoc.data();
        const updatedTask = {
            title,
            description
        };


        await taskRef.update(updatedTask);


        const updatedTaskDoc = await taskRef.get();
        const updatedTaskWithId = { id: updatedTaskDoc.id, ...updatedTaskDoc.data() };
        console.log('------- tasks/:id : [END] ');
        res.json(updatedTaskWithId);

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ message: 'Error al actualizar tarea' });
    }
});

module.exports = router;