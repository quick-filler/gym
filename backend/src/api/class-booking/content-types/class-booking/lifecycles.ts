/**
 * ClassBooking lifecycle hooks.
 *
 * Enforces two business rules at write time:
 *   1. Capacity — total non-cancelled bookings for (classSchedule, date)
 *      cannot exceed the schedule's maxCapacity.
 *   2. Dedup — the same student / dependent cannot have two active bookings
 *      for the same (classSchedule, date).
 *
 * Both fire from the admin UI as well as the GraphQL mutation. Cancelled
 * bookings are excluded from the counts so a user can rebook after a no-show.
 */

const UID = 'api::class-booking.class-booking';
const SCHEDULE_UID = 'api::class-schedule.class-schedule';

function pickRelationId(value: any): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    return value.id ?? value.connect?.[0]?.id ?? null;
  }
  return null;
}

async function activeBookingCount(scheduleId: number, date: string): Promise<number> {
  return await strapi.db.query(UID).count({
    where: {
      classSchedule: { id: scheduleId },
      date,
      status: { $ne: 'cancelled' },
    },
  });
}

async function findExistingBooking(params: {
  scheduleId: number;
  date: string;
  studentId: number | null;
  dependentId: number | null;
  excludeId?: number;
}): Promise<boolean> {
  const where: any = {
    classSchedule: { id: params.scheduleId },
    date: params.date,
    status: { $ne: 'cancelled' },
  };
  if (params.studentId) where.student = { id: params.studentId };
  if (params.dependentId) where.dependent = { id: params.dependentId };
  if (params.excludeId) where.id = { $ne: params.excludeId };

  const existing = await strapi.db
    .query(UID)
    .findOne({ where, select: ['id'] });
  return !!existing;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const scheduleId = pickRelationId(data?.classSchedule);
    const studentId = pickRelationId(data?.student);
    const dependentId = pickRelationId(data?.dependent);
    const date: string | undefined = data?.date;
    const status: string = data?.status ?? 'confirmed';

    if (!scheduleId || !date) return;
    if (!studentId && !dependentId) {
      throw new Error('Reserva requer aluno ou dependente.');
    }
    if (studentId && dependentId) {
      throw new Error(
        'Reserva não pode ter aluno e dependente simultaneamente.',
      );
    }

    // Cancelled bookings are inert — skip dedup/capacity to allow re-creates.
    if (status === 'cancelled') return;

    // Dedup: same person can't have two open bookings for the same slot.
    if (
      await findExistingBooking({
        scheduleId,
        date,
        studentId,
        dependentId,
      })
    ) {
      throw new Error('Já existe uma reserva ativa para este horário.');
    }

    // Capacity: don't exceed the schedule's maxCapacity.
    const schedule: any = await strapi.db
      .query(SCHEDULE_UID)
      .findOne({ where: { id: scheduleId }, select: ['maxCapacity', 'name'] });
    if (schedule?.maxCapacity) {
      const current = await activeBookingCount(scheduleId, date);
      if (current >= schedule.maxCapacity) {
        throw new Error(
          `Aula "${schedule.name}" sem vagas para esta data (${schedule.maxCapacity} ocupadas).`,
        );
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    if (!data) return;

    // Re-validate only when capacity-relevant fields change.
    const touchesCapacityFields =
      data.status !== undefined ||
      data.date !== undefined ||
      data.classSchedule !== undefined ||
      data.student !== undefined ||
      data.dependent !== undefined;
    if (!touchesCapacityFields) return;

    const current: any = await strapi.db.query(UID).findOne({
      where,
      populate: {
        classSchedule: { select: ['id', 'maxCapacity', 'name'] },
        student: { select: ['id'] },
        dependent: { select: ['id'] },
      },
    });
    if (!current) return;

    const nextStatus = data.status ?? current.status;
    if (nextStatus === 'cancelled') return;

    const scheduleId =
      pickRelationId(data.classSchedule) ?? current.classSchedule?.id;
    const studentId = pickRelationId(data.student) ?? current.student?.id ?? null;
    const dependentId =
      pickRelationId(data.dependent) ?? current.dependent?.id ?? null;
    const date = data.date ?? current.date;

    if (!scheduleId || !date) return;

    if (
      await findExistingBooking({
        scheduleId,
        date,
        studentId,
        dependentId,
        excludeId: current.id,
      })
    ) {
      throw new Error('Já existe uma reserva ativa para este horário.');
    }

    // If we're moving an existing booking *into* a different slot, capacity
    // must still be respected at the destination.
    const slotChanged =
      data.classSchedule !== undefined || data.date !== undefined;
    if (slotChanged) {
      const schedule: any = await strapi.db
        .query(SCHEDULE_UID)
        .findOne({ where: { id: scheduleId }, select: ['maxCapacity', 'name'] });
      if (schedule?.maxCapacity) {
        const count = await activeBookingCount(scheduleId, date);
        if (count >= schedule.maxCapacity) {
          throw new Error(
            `Aula "${schedule.name}" sem vagas para esta data.`,
          );
        }
      }
    }
  },
};
