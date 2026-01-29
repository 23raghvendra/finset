import express from 'express';
import {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
    .get(getGoals)
    .post(createGoal);

router.route('/:id')
    .get(getGoal)
    .put(updateGoal)
    .delete(deleteGoal);

router.post('/:id/contribute', contributeToGoal);

export default router;
