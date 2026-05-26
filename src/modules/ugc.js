/**
 * ASWA UGC Module.
 */

export class UGCManager {
  constructor() {
    this.pending = [];
    this.approved = [];
  }

  submitContent(userId, imageFile, caption, authorization = false) {
    if (!userId || !imageFile || !authorization) {
      return { success: false, error: 'Datos incompletos o sin autorizacion' };
    }

    const submission = {
      id: `ugc_${Date.now()}`,
      userId,
      image: imageFile,
      caption,
      status: 'pending',
      createdAt: new Date(),
      approvedAt: null,
    };

    this.pending.push(submission);
    return { success: true, id: submission.id };
  }

  approveContent(contentId) {
    const index = this.pending.findIndex((content) => content.id === contentId);
    if (index === -1) return false;

    const content = this.pending[index];
    content.status = 'approved';
    content.approvedAt = new Date();
    this.approved.push(content);
    this.pending.splice(index, 1);
    return true;
  }

  rejectContent(contentId) {
    const index = this.pending.findIndex((content) => content.id === contentId);
    if (index === -1) return false;

    this.pending.splice(index, 1);
    return true;
  }

  getApprovedContent() {
    return [...this.approved];
  }

  getPendingContent() {
    return [...this.pending];
  }
}

export const ugcManager = new UGCManager();
