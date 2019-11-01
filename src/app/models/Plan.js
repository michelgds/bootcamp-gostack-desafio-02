import Sequelize, { Model } from 'sequelize';

class Plan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        price: Sequelize.DECIMAL,
        duration: Sequelize.INTEGER,
        active: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
  }
}

export default Plan;
