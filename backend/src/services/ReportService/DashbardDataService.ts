/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";
import { string } from "yup";
import { Console } from "console";

export interface DashboardData {
  counters: any;
  attendants: [];
}

export interface Params {
  days?: number;
  date_from?: string;
  date_to?: string;
  userId?: [];
  queueId?: [];
}

export default async function DashboardDataService(
  params: Params
): Promise<DashboardData> {
  const query = `
    with
    traking as (
      select
        u.name "userName",
        u.online "userOnline",
        w.name "whatsappName",
        ct.name "contactName",
        ct.number "contactNumber",
        (tt."finishedAt" is not null) "finished",
        (tt."userId" is null and tt."finishedAt" is null) "pending",
        coalesce((
          (date_part('day', age(coalesce(tt."ratingAt", tt."finishedAt") , tt."startedAt")) * 24 * 60) +
          (date_part('hour', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."startedAt")) * 60) +
          (date_part('minutes', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."startedAt")))
        ), 0) "supportTime",
        coalesce((
          (date_part('day', age(tt."startedAt", tt."queuedAt")) * 24 * 60) +
          (date_part('hour', age(tt."startedAt", tt."queuedAt")) * 60) +
          (date_part('minutes', age(tt."startedAt", tt."queuedAt")))
        ), 0) "waitTime",
        t.status,
        tt.*,
        ct."id" "contactId"
      from "TicketTraking" tt
      left join "Users" u on u.id = tt."userId"
      left join "Whatsapps" w on w.id = tt."whatsappId"
      left join "Tickets" t on t.id = tt."ticketId"
      left join "Contacts" ct on ct.id = t."contactId"
      -- filterPeriod
    ),
    counters as (
      select
        (select avg("supportTime") from traking where "supportTime" > 0) "avgSupportTime",
        (select avg("waitTime") from traking where "waitTime" > 0) "avgWaitTime",
        (
          select count(distinct t1."id")
          from "Tickets" t1
           inner join traking tt1 on t1."id" = tt1."ticketId"
          where t1."status" like 'open' 
        ) "supportHappening",
        (
          select count(distinct t1."id")
          from "Tickets" t1
          inner join traking tt1 on t1."id" = tt1."ticketId"
          where t1."status" like 'pending' 
        ) "supportPending",
        (select count(id) from traking where finished) "supportFinished",
        (
          select count(leads.id) from (
            select
              ct1.id,
              count(tt1.id) total
            from traking tt1
            left join "Tickets" t1 on t1.id = tt1."ticketId"
            left join "Contacts" ct1 on ct1.id = t1."contactId"
            group by 1
            having count(tt1.id) = 1
          ) leads
        ) "leads",
        (
        	select 
        		count(*)
          from traking  tt2
          left join "UserRatings" ur2 on ur2."ticketId" = tt2."ticketId"
          where tt2.rated =true 
            and ur2.rate > 8
	    	) "npsPromotersCount",
        (
          select 
            count(*) 
          from traking  tt3
          left join "UserRatings" ur3 on ur3."ticketId" = tt3."ticketId"
          where tt3.rated = true 
            and ur3.rate in (7,8)
        ) "npsPassiveCount",
        (
          select 
            count(*) 
          from traking  tt
          left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
          where tt.rated = true 
            and ur.rate < 7
        ) "npsDetractorsCount",
        (
        	select 
            (100*count(tt.*))/NULLIF((select count(*) total from traking where rated= true),0)
          from traking  tt
          left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
          where tt.rated =true 
            and ur.rate > 8
	    	) "npsPromotersPerc",
        (
          select 
            (100*count(tt.*))/NULLIF((select count(*) total from traking where rated= true),0) 
          from traking  tt
          left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
          where tt.rated = true 
            and ur.rate in (7,8)
        ) "npsPassivePerc",
        (
          select 
            (100*count(tt.*))/NULLIF((select count(*) total from traking where rated= true),0) 
          from traking  tt
          left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
          where tt.rated = true 
            and ur.rate < 7
        ) "npsDetractorsPerc",
        (
          select sum(nps.promoter) - sum(nps.detractor) from (
            (select 
              (100*count(tt.*))/NULLIF((select count(*) total from traking where rated= true),0) promoter
                    ,0 detractor
                      from traking tt
                      left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                  where tt.rated =true 
                  and ur.rate > 8
            union			
            select 
                        0,(100*count(tt.*))/NULLIF((select count(*) total from traking where rated= true),0)
                      from traking  tt
                      left join "UserRatings" ur on ur."ticketId" = tt."ticketId"
                  where tt.rated =true 
                  and ur.rate < 7)) nps
          ) "npsScore"
    ),
    attedants as (
      select
        u.id,
        u.name,
        coalesce(att."avgSupportTime", 0) "avgSupportTime",
        att.tickets,
        att.rating,
        att.online
      from "Users" u
      inner join (
        select
          u1.id,
          u1."name",
          u1."online",
          avg(t."supportTime") "avgSupportTime",
          count(t."id") tickets,
          coalesce(avg(ur.rate), 0) rating
        from "Users" u1
        left join traking t on t."userId" = u1.id
        left join "UserRatings" ur on ur."userId" = t."userId" and ur."createdAt"::date = t."finishedAt"::date
        group by 1, 2
      ) att on att.id = u.id
      order by att.name
    )
    select
      (select coalesce(jsonb_build_object('counters', c.*)->>'counters', '{}')::jsonb from counters c) counters,
      (select coalesce(json_agg(a.*), '[]')::jsonb from attedants a) attendants;
  `;

  let where = 'where tt."id" is not null';
  const replacements: any[] = [];

  if (_.has(params, "days")) {
    where += ` and tt."queuedAt" >= (now() - '? days'::interval)`;
    replacements.push(parseInt(`${params.days}`.replace(/\D/g, ""), 10));
  }

  if (_.has(params, "date_from")) {
    where += ` and tt."queuedAt" >= ?`;
    replacements.push(`${params.date_from} 00:00:00`);
  }

  if (_.has(params, "date_to")) {
    where += ` and tt."finishedAt" <= ?`;
    replacements.push(`${params.date_to} 23:59:59`);
  }

  if (_.has(params, "userId")) {
    const usersFilter = params.userId;
    if ( usersFilter !== undefined){
        if (usersFilter?.length > 1 ) {
          let count = 0;
          where += ` and ( `;
          usersFilter.forEach( async u=> {
            if (count === 0 ) {
              where += ` tt."userId" = ?`;
              replacements.push(`${u}`);
              count = count + 1;
            } else {
              where += ` or tt."userId" = ?`;
              replacements.push(`${u}`);
            }
        });
        where += ` )`;        
        } else {
          where += ` and tt."userId" = ?`;
          replacements.push(`${usersFilter}`);          
        }
      } 
      {/*else {
      where += ` and tt."userId" in (?)`;
      replacements.push(`${params.userId}`.replace(",","','"));
      */}
  }

  if (_.has(params, "queueId")) {
    const queuesFilter = params.queueId;
    if ( queuesFilter !== undefined){
        if (queuesFilter?.length > 1 ) {
          let count = 0;
          where += ` and ( `;
          queuesFilter.forEach( async q=> {
            if (count === 0 ) {
              where += ` t."queueId" = ?`;
              replacements.push(`${q}`);
              count = count + 1;
            } else {
              where += ` or t."queueId" = ?`;
              replacements.push(`${q}`);
            }
        });
        where += ` )`;        
        } else {
          where += ` and t."queueId" = ?`;
          replacements.push(`${queuesFilter}`);          
        }
      } 
      {/*else {
      where += ` and tt."userId" in (?)`;
      replacements.push(`${params.userId}`.replace(",","','"));
      */}
  }
  
  const finalQuery = query.replace("-- filterPeriod", where);

  const responseData: DashboardData = await sequelize.query(finalQuery, {
    replacements,
    type: QueryTypes.SELECT,
    plain: true
  });

  return responseData;
}
