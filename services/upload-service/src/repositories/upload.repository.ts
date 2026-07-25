import { prisma } from '../config/db.js';

export class UploadRepository {
  async createJob(tenantId: string, data: any) {
    const { filmId, ...jobData } = data;

    // Ensure tenant skeleton exists
    await prisma.tenant.upsert({
      where: { id: tenantId },
      create: { id: tenantId },
      update: {},
    });

    if (filmId) {
      // Ensure film skeleton exists
      await prisma.film.upsert({
        where: { id: filmId },
        create: { id: filmId },
        update: {},
      });
    }

    return prisma.uploadJob.create({
      data: {
        ...jobData,
        tenantId,
        filmId: filmId ?? null,
      },
      include: {
        parts: true,
        validations: true,
        events: true,
        artifacts: true,
      },
    });
  }

  async getJobById(tenantId: string, id: string) {
    return prisma.uploadJob.findFirst({
      where: { id, tenantId },
      include: {
        parts: true,
        validations: true,
        events: true,
        artifacts: true,
      },
    });
  }

  async updateJob(tenantId: string, id: string, data: any) {
    const { filmId, ...jobData } = data;

    if (filmId) {
      // Ensure film skeleton exists
      await prisma.film.upsert({
        where: { id: filmId },
        create: { id: filmId },
        update: {},
      });
    }

    return prisma.uploadJob.update({
      where: { id },
      data: {
        ...jobData,
        ...(filmId !== undefined && { filmId: filmId ?? null }),
      },
      include: {
        parts: true,
        validations: true,
        events: true,
        artifacts: true,
      },
    });
  }

  async deleteJob(tenantId: string, id: string) {
    return prisma.uploadJob.delete({
      where: { id },
    });
  }

  async listJobs(
    tenantId: string,
    filters: {
      status?: any;
      validationStatus?: any;
      filmId?: string;
    } = {}
  ) {
    const where: any = { tenantId };

    if (filters.status) where.status = filters.status;
    if (filters.validationStatus) where.validationStatus = filters.validationStatus;
    if (filters.filmId) where.filmId = filters.filmId;

    return prisma.uploadJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        parts: true,
        validations: true,
      },
    });
  }

  // Parts
  async addPart(uploadJobId: string, data: any) {
    return prisma.uploadPart.upsert({
      where: {
        uploadJobId_partNumber: {
          uploadJobId,
          partNumber: data.partNumber,
        },
      },
      create: { ...data, uploadJobId },
      update: data,
    });
  }

  // Validations
  async addValidation(uploadJobId: string, data: any) {
    return prisma.uploadValidation.create({
      data: { ...data, uploadJobId },
    });
  }

  // Events
  async addEvent(uploadJobId: string, data: any) {
    return prisma.uploadEvent.create({
      data: { ...data, uploadJobId },
    });
  }

  // Artifacts
  async addArtifact(uploadJobId: string, data: any) {
    return prisma.uploadArtifact.create({
      data: { ...data, uploadJobId },
    });
  }
}

export const uploadRepository = new UploadRepository();
export default uploadRepository;
