import { uploadRepository } from '../repositories/upload.repository.js';
import { NotFoundError } from '../errors/appError.js';

export class UploadService {
  private repo = uploadRepository;

  async createJob(tenantId: string, data: any) {
    const job = await this.repo.createJob(tenantId, data);
    
    // Log creation event
    await this.repo.addEvent(job.id, {
      eventType: 'JOB_CREATED',
      payload: { sourceType: job.sourceType, storageProvider: job.storageProvider },
    });

    return job;
  }

  async getJobById(tenantId: string, id: string) {
    const job = await this.repo.getJobById(tenantId, id);
    if (!job) {
      throw new NotFoundError(`Upload job with ID '${id}' not found`);
    }
    return job;
  }

  async updateJob(tenantId: string, id: string, data: any) {
    await this.getJobById(tenantId, id);
    const updated = await this.repo.updateJob(tenantId, id, data);

    // Audit status change if applicable
    if (data.status) {
      await this.repo.addEvent(id, {
        eventType: 'STATUS_CHANGED',
        payload: { newStatus: data.status, errorCode: data.errorCode },
      });
    }

    return updated;
  }

  async deleteJob(tenantId: string, id: string) {
    await this.getJobById(tenantId, id);
    return this.repo.deleteJob(tenantId, id);
  }

  async listJobs(tenantId: string, filters: any = {}) {
    return this.repo.listJobs(tenantId, filters);
  }

  // Parts
  async addPart(tenantId: string, jobId: string, partData: any) {
    await this.getJobById(tenantId, jobId);
    const part = await this.repo.addPart(jobId, partData);

    await this.repo.addEvent(jobId, {
      eventType: 'PART_UPLOADED',
      payload: { partNumber: part.partNumber, fileSizeBytes: part.fileSizeBytes?.toString() },
    });

    return part;
  }

  // Validations
  async addValidation(tenantId: string, jobId: string, validationData: any) {
    const job = await this.getJobById(tenantId, jobId);
    const validation = await this.repo.addValidation(jobId, validationData);

    // Update validation status on job if we encounter failed status
    let nextStatus = job.validationStatus;
    if (validation.status === 'FAILED') {
      nextStatus = 'FAILED';
    } else if (validation.status === 'PASSED' && job.validationStatus === 'PENDING') {
      nextStatus = 'PASSED';
    }

    if (nextStatus !== job.validationStatus) {
      await this.repo.updateJob(tenantId, jobId, { validationStatus: nextStatus });
    }

    await this.repo.addEvent(jobId, {
      eventType: 'VALIDATION_COMPLETED',
      payload: { code: validation.code, status: validation.status, severity: validation.severity },
    });

    return validation;
  }

  // Events
  async addEvent(tenantId: string, jobId: string, eventData: any) {
    await this.getJobById(tenantId, jobId);
    return this.repo.addEvent(jobId, eventData);
  }

  // Artifacts
  async addArtifact(tenantId: string, jobId: string, artifactData: any) {
    await this.getJobById(tenantId, jobId);
    const artifact = await this.repo.addArtifact(jobId, artifactData);

    await this.repo.addEvent(jobId, {
      eventType: 'ARTIFACT_REGISTERED',
      payload: { kind: artifact.kind, name: artifact.name, key: artifact.storageKey },
    });

    return artifact;
  }
}

export const uploadService = new UploadService();
export default uploadService;
