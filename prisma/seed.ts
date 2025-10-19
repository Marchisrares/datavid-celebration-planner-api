import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.member.deleteMany();

  await db.member.createMany({
    data: [
      { firstName:'Luca', lastName:'Ionescu', birthDate:new Date('1990-10-25'), country:'Romania', city:'Bucharest', tz:'Europe/Bucharest', email:'luca@datavid.test' },
      { firstName:'Priya', lastName:'Menon', birthDate:new Date('1991-02-14'), country:'India', city:'Bengaluru', tz:'Asia/Kolkata', email:'priya@datavid.test' },
      { firstName:'Marco', lastName:'Rossi', birthDate:new Date('1988-11-03'), country:'Italy', city:'Milan', tz:'Europe/Rome', email:'marco@datavid.test' },
      { firstName:'Ava', lastName:'Smith', birthDate:new Date('1995-12-01'), country:'USA', city:'New York', tz:'America/New_York', email:'ava@datavid.test' },
      { firstName:'Jonas', lastName:'Weber', birthDate:new Date('1992-01-09'), country:'Germany', city:'Berlin', tz:'Europe/Berlin', email:'jonas@datavid.test' },
      { firstName:'Mei',  lastName:'Chen',  birthDate:new Date('1993-10-20'), country:'China', city:'Shanghai', tz:'Asia/Shanghai', email:'mei@datavid.test' },
    ]
  });
}

main().then(()=> db.$disconnect());
