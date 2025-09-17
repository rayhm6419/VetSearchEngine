import { prisma } from '@/server/db';
const p: any = prisma as any;

const SRC = 'petfinder' as const;

function computeScore(yes: number, no: number) {
  const total = yes + no;
  const score = (yes - no) / Math.max(1, total);
  const confidence = total / (total + 5);
  return { score, confidence };
}

export const shelterService = {
  async getInfo(externalId: string) {
    const externalSource = SRC as string;
    // try cache
    const agg = await p.shelterAggregate.findUnique({ where: { externalSource_externalId: { externalSource, externalId } } }).catch(() => null) as any;
    let yes = 0, no = 0, topDoctors: Array<{ name: string; recCount: number }> = [];
    if (agg) {
      yes = agg.firstVisitFreeYes || 0;
      no = agg.firstVisitFreeNo || 0;
      try { if (agg.topDoctorsJson) topDoctors = agg.topDoctorsJson as any; } catch {}
    } else {
      // compute fresh
      yes = await p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } });
      no = await p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } });
      const docs = await p.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
      topDoctors = docs.map((d: any) => ({ name: d.name, recCount: d.recCount }));
    }
    const { score, confidence } = computeScore(yes, no);
    return { infoCard: { firstVisitFree: { yes, no, score, confidence: confidence < 0.4 ? 'low' : confidence < 0.7 ? 'medium' : 'high' as const }, topDoctors } };
  },

  async voteFirstVisitFree(externalId: string, userId: string, value: 'yes' | 'no') {
    const externalSource = SRC as string;
    await p.shelterAttributeVote.upsert({
      where: { externalSource_externalId_userId_key: { externalSource, externalId, userId, key: 'first_visit_free' } } as any,
      update: { value },
      create: { externalSource, externalId, userId, key: 'first_visit_free', value },
    } as any);
    const [yes, no] = await Promise.all([
      p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } }),
      p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } }),
    ]);
    const { score, confidence } = computeScore(yes, no);
    // cache
    await p.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence },
      create: { externalSource, externalId, firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence },
    });
    return { yes, no, score, confidence };
  },

  async recommendDoctor(externalId: string, userId: string, name: string, reason?: string | null) {
    const externalSource = SRC as string;
    const doctor = await p.shelterDoctor.upsert({
      where: { externalSource_externalId_name: { externalSource, externalId, name } },
      update: {},
      create: { externalSource, externalId, name },
    });
    await p.shelterDoctorRecommendation.upsert({
      where: { doctorId_userId: { doctorId: doctor.id, userId } },
      update: { reason: reason || undefined },
      create: { doctorId: doctor.id, userId, reason: reason || undefined },
    });
    // increment recCount efficiently
    const recCount = await p.shelterDoctorRecommendation.count({ where: { doctorId: doctor.id } });
    await p.shelterDoctor.update({ where: { id: doctor.id }, data: { recCount } });
    const top = await p.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
    await p.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { topDoctorsJson: top.map((d: any) => ({ name: d.name, recCount: d.recCount })) as any },
      create: { externalSource, externalId, topDoctorsJson: top.map((d: any) => ({ name: d.name, recCount: d.recCount })) as any },
    });
    return top.map((d: any) => ({ name: d.name, recCount: d.recCount }));
  },

  async recomputeAggregates(externalId: string) {
    const externalSource = SRC as string;
    const [yes, no] = await Promise.all([
      p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } }),
      p.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } }),
    ]);
    const { score, confidence } = computeScore(yes, no);
    const top = await p.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
    await p.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence, topDoctorsJson: top.map((d: any) => ({ name: d.name, recCount: d.recCount })) as any },
      create: { externalSource, externalId, firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence, topDoctorsJson: top.map((d: any) => ({ name: d.name, recCount: d.recCount })) as any },
    });
    return { yes, no, score, confidence, topDoctors: top.map((d: any) => ({ name: d.name, recCount: d.recCount })) };
  },
};
