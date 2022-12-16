/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface Params {
  days?: number;
  date_from?: string;
  date_to?: string;
}

export default async function DashboardDataService(
  params: Params
): Promise<any> {
  const query = `
    select
      u.name user_name,
      AVG(ur.rate) rate_avg
    from UserRatings ur
    left join Users u on u.id = ur.userId
    group by u.id
  `;

  const responseData = await sequelize.query(query, {
    type: QueryTypes.SELECT
  });

  return responseData;
}
