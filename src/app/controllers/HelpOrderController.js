import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

import ReplyOrderMail from '../jobs/ReplyOrderMail';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async listUnAnswered(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answered_at: null },
      include: [
        {
          model: Student,
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed!' });
    }

    const student_id = req.params.id;

    if (!student_id) {
      res.status(400).json({ error: 'Invalid student' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      res.status(400).json({ error: 'Invalid student' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExists) {
      return res.status(400).json({ error: 'Student is not enrolled.' });
    }

    const { question } = req.body;

    const helpOrder = await HelpOrder.create({ question, student_id });

    return res.json(helpOrder);
  }

  async listAll(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      attributes: ['question', 'answer', 'answered_at', 'created_at'],
      include: [
        {
          model: Student,
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed!' });
    }

    const { id } = req.params;

    const helpOrder = await HelpOrder.findByPk(id);

    if (!helpOrder) {
      return res.status(400).json({ message: 'Help order not found.' });
    }

    if (helpOrder.answer) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    const student = await Student.findByPk(helpOrder.student_id, {
      attributes: ['name', 'email'],
    });

    req.body.answered_at = new Date();

    await helpOrder.update(req.body);

    await Queue.add(ReplyOrderMail.key, { student, helpOrder });

    return res.json({ ...req.body });
  }
}

export default new HelpOrderController();
