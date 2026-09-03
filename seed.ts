import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
const rows=[
['civic-pothole','Road pothole / damaged road','Civic','Local civic authority','HIGH',['What exactly happened?','Where is the issue?','When did you notice it?'],['Photo/video','Exact location']],
['civic-streetlight','Street light not working','Civic','Local civic authority','MEDIUM',['What is the location?','How long has it been off?'],['Photo','Exact location']],
['civic-garbage','Garbage not collected / dumping','Civic','Local civic authority','MEDIUM',['Where is the garbage?','How long has it been there?'],['Photo','Exact location']],
['vehicle-service','Bike / car service complaint','Vehicle','Manufacturer / dealer support','MEDIUM',['Vehicle model?','What service was performed?','What went wrong?'],['Invoice/job card','Photos/video']],
['consumer-refund','Refund not received','Consumer','Merchant / consumer grievance route','MEDIUM',['Order/reference number?','Payment date and amount?','What did the company say?'],['Invoice/order proof','Payment proof','Communication history']],
['govt-certificate','Government certificate / document','Government','Official government service','MEDIUM',['Which document/service?','What is your state/city?'],['Officially required identity/document proofs']],
['cyber-scam','Online fraud / cyber scam','Safety','Official cybercrime / bank route','URGENT',['When did it happen?','Amount/transaction ID?','Which bank/payment app?'],['Transaction proof','Screenshots','Communications']],
['telecom-network','Mobile / internet service problem','Telecom','Telecom provider','MEDIUM',['Provider?','What is the issue?','Where is service affected?'],['Account details','Screenshots','Service location']],
['bank-transaction','Banking / UPI transaction dispute','Banking','Bank / payment provider','HIGH',['Transaction ID?','Date/time and amount?','What outcome do you need?'],['Transaction details','Bank communication']],
['home-service','Home appliance / service problem','Home','Manufacturer / service provider','MEDIUM',['Product/model?','Warranty/AMC?','What failed?'],['Invoice','Warranty/AMC','Photos/video']]
];
async function main(){for(const r of rows) await db.problemType.upsert({where:{id:r[0] as string},update:{name:r[1] as string,category:r[2] as string,route:r[3] as string,priority:r[4] as string,questions:r[5],evidence:r[6]},create:{id:r[0] as string,name:r[1] as string,category:r[2] as string,route:r[3] as string,priority:r[4] as string,questions:r[5],evidence:r[6]}})}
main().finally(()=>db.$disconnect());
