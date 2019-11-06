import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, end_date, price } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Bem vindo a Gympoint',
      template: 'enrollment',
      context: {
        name: student.name,
        plan: plan.title,
        end_date: format(parseISO(end_date), "'Dia' dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        total: price,
      },
    });
  }
}

export default new EnrollmentMail();
