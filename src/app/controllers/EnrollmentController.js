import * as Yup from 'yup';
import { parseISO, startOfDay, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // Check if student exists
    const student = await Student.findByPk(student_id, {
      where: {
        active: true,
      },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    // Check if plan exists
    const plan = await Plan.findByPk(plan_id, { where: { active: true } });

    if (!plan) {
      return res.json({ error: 'Plan does not exists.' });
    }

    // Check if enrollment alredy exists
    const enrolled = await Enrollment.findOne({ where: { student_id } });

    if (enrolled) {
      return res.status(400).json({ error: 'Enrollment alredy exists.' });
    }

    const parsedDate = startOfDay(parseISO(start_date));

    const end_date = addMonths(parsedDate, plan.duration);

    const { price, duration } = plan;
    const calcPrice = parseFloat(price * duration).toFixed(2);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: parsedDate,
      end_date,
      price: calcPrice,
    });

    await Queue.add(EnrollmentMail.key, {
      student,
      enrollment,
      plan,
      end_date,
      price,
    });

    return res.json(enrollment);
  }

  async index(req, res) {
    const { page = 1 } = req.params;

    const enrollments = await Enrollment.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'start_date', 'end_date'],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],

      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(enrollments);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { plan_id, start_date } = req.body;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Invalid enrollment.' });
    }

    const enrollment = await Enrollment.findOne({
      where: { id, canceled_at: null },
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Invalid enrollment.' });
    }

    if (start_date !== enrollment.start_date) {
      const parsedDate = startOfDay(parseISO(start_date));

      enrollment.start_date = parsedDate;

      const plan = await Plan.findByPk(plan_id, { where: { active: true } });

      if (!plan) {
        return res.json({ error: 'Plan does not exists.' });
      }

      enrollment.plan_id = plan_id;
      enrollment.price = (plan.price * plan.duration).toFixed(2);

      enrollment.end_date = addMonths(parsedDate, plan.duration);
    }

    await enrollment.save();

    return res.json(enrollment);
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Enrollmentt not found.' });
    }

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found.' });
    }

    enrollment.canceled_at = new Date();
    await enrollment.save();

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
