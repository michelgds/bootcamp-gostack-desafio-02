import { startOfDay, subDays, endOfDay } from 'date-fns';
import Student from '../models/Student';
import Checkin from '../schemas/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async store(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { id },
    });

    if (!enrollmentExists) {
      return res.status(400).json({ error: 'Student is not enrolled.' });
    }

    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);

    const checkinCount = await Checkin.find({
      student_id: student.id,
    })
      .gte('createdAt', startOfDay(last7Days))
      .lte('createdAt', endOfDay(today))
      .countDocuments();

    // verify if it reaches 5 chekins on 7 days
    if (checkinCount >= 5) {
      return res.status(400).json({
        error: '5 checkins on a seven day row limit exceeded.',
      });
    }

    const checkin = await Checkin.create({
      student_id: student.id,
    });

    return res.json(checkin);
  }

  async index(req, res) {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Invalid student' });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      res.status(400).json({ error: 'Invalid student' });
    }

    const checkins = await Checkin.find({
      student_id: id,
    })
      .sort('createdAt')
      .limit(20);

    return res.json(checkins);
  }
}

export default new CheckinController();
