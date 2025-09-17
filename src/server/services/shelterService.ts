import { prisma } from '@/server/db';

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
    const agg = await prisma.shelterAggregate.findUnique({ where: { externalSource_externalId: { externalSource, externalId } } }).catch(() => null) as any;
    let yes = 0, no = 0, topDoctors: Array<{ name: string; recCount: number }> = [];
    if (agg) {
      yes = agg.firstVisitFreeYes || 0;
      no = agg.firstVisitFreeNo || 0;
      try { if (agg.topDoctorsJson) topDoctors = agg.topDoctorsJson as any; } catch {}
    } else {
      // compute fresh
      yes = await prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } });
      no = await prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } });
      const docs = await prisma.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
      topDoctors = docs.map(d => ({ name: d.name, recCount: d.recCount }));
    }
    const { score, confidence } = computeScore(yes, no);
    return { infoCard: { firstVisitFree: { yes, no, score, confidence: confidence < 0.4 ? 'low' : confidence < 0.7 ? 'medium' : 'high' as const }, topDoctors } };
  },

  async voteFirstVisitFree(externalId: string, userId: string, value: 'yes' | 'no') {
    const externalSource = SRC as string;
    await prisma.shelterAttributeVote.upsert({
      where: { externalSource_externalId_userId_key: { externalSource, externalId, userId, key: 'first_visit_free' } } as any,
      update: { value },
      create: { externalSource, externalId, userId, key: 'first_visit_free', value },
    } as any);
    const [yes, no] = await Promise.all([
      prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } }),
      prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } }),
    ]);
    const { score, confidence } = computeScore(yes, no);
    // cache
    await prisma.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence },
      create: { externalSource, externalId, firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence },
    });
    return { yes, no, score, confidence };
  },

  async recommendDoctor(externalId: string, userId: string, name: string, reason?: string | null) {
    const externalSource = SRC as string;
    const doctor = await prisma.shelterDoctor.upsert({
      where: { externalSource_externalId_name: { externalSource, externalId, name } },
      update: {},
      create: { externalSource, externalId, name },
    });
    await prisma.shelterDoctorRecommendation.upsert({
      where: { doctorId_userId: { doctorId: doctor.id, userId } },
      update: { reason: reason || undefined },
      create: { doctorId: doctor.id, userId, reason: reason || undefined },
    });
    // increment recCount efficiently
    const recCount = await prisma.shelterDoctorRecommendation.count({ where: { doctorId: doctor.id } });
    await prisma.shelterDoctor.update({ where: { id: doctor.id }, data: { recCount } });
    const top = await prisma.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
    await prisma.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { topDoctorsJson: top.map(d => ({ name: d.name, recCount: d.recCount })) as any },
      create: { externalSource, externalId, topDoctorsJson: top.map(d => ({ name: d.name, recCount: d.recCount })) as any },
    });
    return top.map(d => ({ name: d.name, recCount: d.recCount }));
  },

  async recomputeAggregates(externalId: string) {
    const externalSource = SRC as string;
    const [yes, no] = await Promise.all([
      prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'yes' } }),
      prisma.shelterAttributeVote.count({ where: { externalSource, externalId, key: 'first_visit_free', value: 'no' } }),
    ]);
    const { score, confidence } = computeScore(yes, no);
    const top = await prisma.shelterDoctor.findMany({ where: { externalSource, externalId }, orderBy: { recCount: 'desc' }, take: 3 });
    await prisma.shelterAggregate.upsert({
      where: { externalSource_externalId: { externalSource, externalId } },
      update: { firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence, topDoctorsJson: top.map(d => ({ name: d.name, recCount: d.recCount })) as any },
      create: { externalSource, externalId, firstVisitFreeYes: yes, firstVisitFreeNo: no, firstVisitFreeScore: score, firstVisitConfidence: confidence, topDoctorsJson: top.map(d => ({ name: d.name, recCount: d.recCount })) as any },
    });
    return { yes, no, score, confidence, topDoctors: top.map(d => ({ name: d.name, recCount: d.recCount })) };
  },
};

