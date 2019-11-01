import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .positive()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation fails.' });
    }

    const { title, duration, price } = await Plan.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async index(req, res) {
    const plans = await Plan.findAll({
      where: {
        active: true,
      },
      limit: 20,
    });

    return res.json({ plans });
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ error: 'Invalid plan' });
    }

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ error: 'Invalid plan' });
    }

    plan.active = false;

    return res.json(plan);
  }

  async update(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ error: 'Invalid plan' });
    }

    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation fails.' });
    }

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ error: 'Invalid plan' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }
}

export default new PlanController();
