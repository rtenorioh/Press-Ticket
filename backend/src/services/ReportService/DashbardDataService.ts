/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

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
  const query = `with
  traking as (   
    select
      u.name userName,
      u.online userOnline,
      w.name whatsappName,
      ct.name contactName,
      ct.number contactNumber,
      (tt.finishedAt is not null) finished,
      (tt.userId is null and tt.finishedAt is null) pending,
      coalesce((
        (TIMESTAMPDIFF(day, tt.startedAt,coalesce(tt.ratingAt, tt.finishedAt) ) * 24 * 60) +
        (TIMESTAMPDIFF(HOUR, tt.startedAt,coalesce(tt.ratingAt, tt.finishedAt)) * 60) +
        (TIMESTAMPDIFF(MINUTE, tt.startedAt,coalesce(tt.ratingAt, tt.finishedAt)))
      ), 0) supportTime,
      coalesce((
        (TIMESTAMPDIFF(DAY, tt.queuedAt,tt.startedAt) * 24 * 60) +
        (TIMESTAMPDIFF (HOUR, tt.queuedAt,tt.startedAt) * 60) +
        (TIMESTAMPDIFF(MINUTE, tt.queuedAt,tt.startedAt))
      ), 0) waitTime,
      t.status,
      tt.*,
      ct.id contactId
    from TicketTraking tt
    left join Users u on u.id = tt.userId
    left join Whatsapps w on w.id = tt.whatsappId
    left join Tickets t on t.id = tt.ticketId
    left join Contacts ct on ct.id = t.contactId
-- filterPeriod  
)
,
  counters as (
    select
      (select avg(supportTime) from traking where supportTime > 0) avgSupportTime,
      (select avg(waitTime) from traking where waitTime > 0) avgWaitTime,
      (
        select count(distinct t1.id)
        from Tickets t1
         inner join traking tt1 on t1.id = tt1.ticketId
        where t1.status like 'open' 
      ) supportHappening,
      (
        select count(distinct t1.id)
        from Tickets t1
        inner join traking tt1 on t1.id = tt1.ticketId
        where t1.status like 'pending' 
      ) supportPending,
      (select count(id) from traking where finished) supportFinished,
      (
        select count(leads.id) from (
          select
            ct1.id,
            count(tt1.id) total
          from traking tt1
          left join Tickets t1 on t1.id = tt1.ticketId
          left join Contacts ct1 on ct1.id = t1.contactId
          group by 1
          having count(tt1.id) = 1
        ) leads
      ) leads,
      (
        select 
          count(*)
        from traking  tt2
        left join UserRatings ur2 on ur2.ticketId = tt2.ticketId
        where tt2.rated =true 
          and ur2.rate > 8
      ) npsPromotersCount,
      (
        select 
          count(*) 
        from traking  tt3
        left join UserRatings ur3 on ur3.ticketId = tt3.ticketId
        where tt3.rated = true 
          and ur3.rate in (7,8)
      ) npsPassiveCount,
      (
        select 
          count(*) 
        from traking  tt
        left join UserRatings ur on ur.ticketId = tt.ticketId
        where tt.rated = true 
          and ur.rate < 7
      ) npsDetractorsCount,
      (
        select 
          (100*count(tt.id))/NULLIF((select count(id) total from traking where rated= 1),0)
        from traking  tt
        left join UserRatings ur on ur.ticketId = tt.ticketId
        where tt.rated =true 
          and ur.rate > 8
      ) npsPromotersPerc,
      (
        select 
          (100*count(tt.id))/NULLIF((select count(id) total from traking where rated= 1),0) 
        from traking  tt
        left join UserRatings ur on ur.ticketId = tt.ticketId
        where tt.rated = true 
          and ur.rate in (7,8)
      ) npsPassivePerc,
      (
        select 
          nullif((100*count(tt.ID))/NULLIF((select count(id) total from traking where rated= 1),0),0)
        from traking  tt
        left join UserRatings ur on ur.ticketId = tt.ticketId
        where tt.rated = true 
          and ur.rate < 7
      ) npsDetractorsPerc,
      (
        select sum(nps.promoter-nps.detractor)   from (
          (select 
           (100*count(tt.id))/NULLIF((select count(id) total from traking where rated= 1),0) promoter
       , 0 detractor
                    from traking tt
                    left join UserRatings ur on ur.ticketId = tt.ticketId
                where tt.rated =true 
                and ur.rate > 8
          union			
           select 
          0,nullif((100*count(tt.ID))/NULLIF((select count(id) total from traking where rated= 1),0),0)
        from traking  tt
        left join UserRatings ur on ur.ticketId = tt.ticketId
        where tt.rated = true 
          and ur.rate < 7)) nps
        ) npsScore
  ),
  attedants as (
      select
        u1.id,
        u1.name,
        u1.online,
        avg(t.supportTime) avgSupportTime,
        count(t.id) tickets,
        coalesce(avg(ur.rate), 0) rating,
        coalesce(count(ur.id), 0) countRating
      from Users u1
      left join traking t on t.userId = u1.id
      left join UserRatings ur on ur.userId = t.userId and ur.ticketId = t.ticketId 
      group by 1, 2
    order by u1.name
  )   
  select (select JSON_OBJECT('leads', leads, 'npsScore', npsScore, 'avgWaitTime',avgWaitTime, 'avgSupportTime', avgSupportTime, 'npsPassivePerc', npsPassivePerc, 'supportPending', supportPending, 'npsPassiveCount', npsPassiveCount, 'supportFinished', supportFinished, 'npsPromotersPerc', npsPromotersPerc, 'supportHappening', supportHappening, 'npsDetractorsPerc', npsDetractorsPerc, 'npsPromotersCount', npsPromotersCount, 'npsDetractorsCount', npsDetractorsCount)  counters from counters  ) counters    
    ,
   (select JSON_ARRAYAGG( JSON_OBJECT('id', id,'name', name, 'online', online, 'avgSupportTime', avgSupportTime, 'tickets', tickets, 'rating', rating, 'countRating', countRating))  attendants  from attedants a) attendants ;
`;
  
  let where = 'where tt.id is not null';
const replacements: any[] = [];

if (_.has(params, "days")) {
  where += ` and tt.createdAt >= (curdate() - interval ? day)`;
  replacements.push(parseInt(`${params.days}`.replace(/\D/g, ""), 10));
}

if (_.has(params, "date_from") && _.has(params, "date_to")) {
  where += ` and date(tt.createdAt) between '${params.date_from}' and '${params.date_to}'`;
  // replacements.push(`${params.date_from}`);
  // console.log(replacements)
}

if (_.has(params, "userId")) {
  const usersFilter = params.userId;
  if ( usersFilter !== undefined){
      if (usersFilter?.length > 1 ) {
        let count = 0;
        where += ` and ( `;
        usersFilter.forEach( async u=> {
          if (count === 0 ) {
            where += ` tt.userId = ?`;
            replacements.push(`${u}`);
            count = count + 1;
          } else {
            where += ` or tt.userId = ?`;
            replacements.push(`${u}`);
          }
      });
      where += ` )`;        
      } else {
        where += ` and tt.userId = ?`;
        replacements.push(`${usersFilter}`);          
      }
    }      
}

if (_.has(params, "queueId")) {
  const queuesFilter = params.queueId;
  if ( queuesFilter !== undefined){
      if (queuesFilter?.length > 1 ) {
        let count = 0;
        where += ` and ( `;
        queuesFilter.forEach( async q=> {
          if (count === 0 ) {
            where += ` t.queueId = ?`;
            replacements.push(`${q}`);
            count = count + 1;
          } else {
            where += ` or t.queueId = ?`;
            replacements.push(`${q}`);
          }
      });
      where += ` )`;        
      } else {
        where += ` and t.queueId = ?`;
        replacements.push(`${queuesFilter}`);          
      }
    }     
}
  
  const finalQuery = query.replace("-- filterPeriod", where);
  
  const responseData: DashboardData = await sequelize.query(finalQuery, {
    replacements,
    type: QueryTypes.SELECT,
    plain: true
  });

  console.log(responseData)

  return responseData;
}